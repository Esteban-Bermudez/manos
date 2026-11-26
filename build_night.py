#!/usr/bin/env python3
"""AI Build Night #002 participant client. Requires Python 3.8+."""
import argparse
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.request import build_opener, HTTPRedirectHandler, Request

ORIGIN = "https://ai-build-night-002.aibuildnight-victoria.workers.dev"
STATE = Path.home() / ".ai-build-night-002" / "aibuildnight-victoria" / "agent.json"


class RehearsalError(Exception):
    pass


class APIError(RehearsalError):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def api(route, data=None, token=None):
    headers = {"Accept": "application/json", "User-Agent": "AI-Build-Night-Participant-CLI/1.0"}
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode()
    if token:
        headers["Authorization"] = "Bearer " + token
    request = Request(ORIGIN + "/agent/v1/" + route, data=body, headers=headers)
    try:
        with build_opener(NoRedirect()).open(request, timeout=15) as reply:
            return json.load(reply)
    except HTTPError as exc:
        with exc:
            try:
                message = json.load(exc)["error"]
            except (ValueError, KeyError, TypeError):
                message = "Unexpected HTTP response. Check the event URL and try again."
        raise APIError(exc.code, message) from None


def read_state():
    return json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}


def save_state(state):
    STATE.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=STATE.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump(state, stream)
        os.replace(name, STATE)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def connect(expected_run):
    state = read_state()
    if not (state.get("pendingUntil", 0) > time.time() and state.get("expectedRun") == expected_run):
        pairing = api("connect", {})
        state = {k: pairing[k] for k in ("deviceCode", "userCode", "verificationUri")}
        if pairing.get("verificationUriComplete"):
            state["approvalUrl"] = pairing["verificationUriComplete"]
        state.update(expectedRun=expected_run, pendingUntil=time.time() + pairing["expiresIn"])
        save_state(state)
    return {"userCode": state["userCode"], "builderPage": state.get("approvalUrl", state["verificationUri"]),
            "next": "Give the builder this approval link and short code. After they choose Approve agent, run the round command."}


def session():
    state = read_state()
    if "accessToken" in state:
        return state
    if "deviceCode" not in state or state.get("pendingUntil", 0) <= time.time():
        raise RehearsalError("Run connect to request a fresh connection code.")
    grant = api("token", {"deviceCode": state["deviceCode"]})
    if state.get("expectedRun") and state["expectedRun"] != grant["runId"]:
        raise RehearsalError("The approved round differs from the kickoff. Check the builder page and reconnect for the intended round.")
    saved = {k: grant[k] for k in ("accessToken", "runId", "expiresAt")}
    save_state(saved)
    return saved


def epoch(timestamp):
    return datetime.fromisoformat(timestamp.replace("Z", "+00:00")).timestamp()


def verified_receipt(state, expected=None):
    receipt = api("receipt", token=state["accessToken"])["receipt"]
    if receipt is None:
        raise RehearsalError("No submission receipt is on file for this builder and round.")
    entry = {k: receipt[k] for k in ("commit", "outcome", "category", "teamName", "teammates")}
    for key in ("title", "demoUrl"):
        if receipt.get(key):
            entry[key] = receipt[key]
    encoded = json.dumps(entry, ensure_ascii=False, separators=(",", ":")).encode()
    if (not receipt.get("id") or not receipt.get("receivedAt") or receipt["runId"] != state["runId"]
            or hashlib.sha256(encoded).hexdigest() != receipt["payloadSha256"]):
        raise RehearsalError("Receipt verification failed. Check the saved receipt in the builder lobby.")
    if expected is not None and entry != expected:
        raise RehearsalError("A different entry is on file. Use receipt to inspect the saved demo entry.")
    return receipt


def run(args):
    if args.command == "connect":
        return connect(args.run)
    state = session()
    token = state["accessToken"]
    if args.command in ("round", "twist"):
        while True:
            current = api("round", token=token)
            if current["run"]["id"] != state["runId"]:
                raise RehearsalError("The returned round differs from the approved round.")
            if args.command == "round":
                return current
            if current["phase"] == "updated":
                return {"note": next(n for n in current["notes"] if n["id"] == "09"),
                        "endsAt": current["run"]["endsAt"]}
            remaining = epoch(current["run"]["twistAt"]) - epoch(current["serverNow"])
            time.sleep(max(1, min(60, remaining)))
    if args.command == "submit":
        mates = [name.strip() for name in args.teammate]
        if args.team_name and not mates:
            raise RehearsalError("Add one or two --teammate names for a team entry.")
        entry = {"commit": args.commit.strip(), "outcome": args.outcome.strip(),
                 "category": "team" if mates else "solo", "teamName": args.team_name.strip(), "teammates": mates}
        if args.title.strip():
            entry["title"] = args.title.strip()
        if args.demo_url.strip():
            entry["demoUrl"] = args.demo_url.strip()
        # A successful POST can lose its response. The saved GET is authoritative.
        try:
            submitted = api("submissions", entry, token)["receipt"]
        except (URLError, TimeoutError, APIError):
            try:
                return verified_receipt(state, entry)
            except RehearsalError:
                pass
            raise
        receipt = verified_receipt(state, entry)
        if receipt != submitted:
            raise RehearsalError("The saved receipt differs from the submission response.")
        return receipt
    receipt = verified_receipt(state)
    if args.output:
        Path(args.output).write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    cmds = parser.add_subparsers(dest="command", required=True)
    cmds.add_parser("connect").add_argument("--run", help="expected round ID from kickoff")
    cmds.add_parser("round")
    cmds.add_parser("twist")
    sub = cmds.add_parser("submit")
    sub.add_argument("--title", default="", help="project name to announce on stage")
    sub.add_argument("--demo-url", default="", help="optional public HTTPS demo link")
    sub.add_argument("--commit", default="", help="optional HTTPS source link")
    sub.add_argument("--outcome", required=True)
    sub.add_argument("--teammate", action="append", default=[])
    sub.add_argument("--team-name", default="")
    cmds.add_parser("receipt").add_argument("--output", help="save verified receipt JSON here")
    try:
        print(json.dumps(run(parser.parse_args()), ensure_ascii=False, indent=2))
    except (OSError, RehearsalError, ValueError, KeyError) as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
