import { useState, type FormEvent } from "react";
import { Modal } from "./components/Modal";
import { initials, rateLabel, type DemoState, type Mano, type RequestDraft, type Skill } from "./data";
import { Icon, type IconName } from "./Icons";

export const skillIcons: Record<Skill, IconName> = {
  Screens: "monitor",
  "Wi-Fi": "wifi",
  Printing: "printer",
  Design: "pen",
};

type DeskBoardProps = {
  state: DemoState;
  onCall: (manoId: string) => void;
};

export function DeskBoard({ state, onCall }: DeskBoardProps) {
  const [callingId, setCallingId] = useState<string | null>(null);

  // Online first: the hat decides, not the alphabet.
  const sorted = [...state.manos].sort((a, b) => Number(b.free) - Number(a.free));
  const groups = [
    { id: "online", heading: "Online · free, hat on", manos: sorted.filter((mano) => mano.free) },
    { id: "offline", heading: "Offline · busy, hat off", manos: sorted.filter((mano) => !mano.free) },
  ];
  const calling = sorted.find((mano) => mano.id === callingId);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-serif text-2xl font-bold sm:text-3xl">Who’s around KWENCH</h1>

      <div className="mt-6 flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`${group.id}-heading`}>
            <h2
              id={`${group.id}-heading`}
              className="flex items-center gap-2 px-1 text-xs font-bold tracking-widest text-base-content/50 uppercase"
            >
              <span className={`status status-xs ${group.id === "online" ? "status-success" : "status-neutral"}`} />
              {group.heading}
              <span className="font-normal opacity-70">{group.manos.length}</span>
            </h2>
            {group.manos.length === 0 ? (
              <p className="mt-2 px-1 text-sm text-base-content/50">
                {group.id === "online" ? "Nobody has the FREE hat on right now." : "Everyone’s free — the hat says so."}
              </p>
            ) : (
              <ul className="list mt-2 rounded-box bg-base-100 shadow-sm">
                {group.manos.map((mano) => (
                  <li key={mano.id} className="list-row items-center gap-3">
                    <div className="avatar avatar-placeholder">
                      <div className="w-10 rounded-full text-white" style={{ backgroundColor: mano.color }}>
                        <span className="text-sm font-bold">{initials(mano.name)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="list-col-grow flex min-w-0 items-center justify-between gap-3 rounded-box px-2 py-1 text-left transition hover:bg-base-200"
                      onClick={() => setCallingId(mano.id)}
                      aria-label={`Call ${mano.name} to the manager desk`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-serif text-base font-semibold">{mano.name}</span>
                        <span className="block truncate text-xs text-base-content/60">{mano.skills.join(" · ")}</span>
                        <span className="block text-xs font-semibold text-base-content/70">
                          {rateLabel(mano.perMinuteRate, mano.maxPerHand)}
                        </span>
                      </span>
                      <span className={`badge badge-sm shrink-0 gap-1.5 ${mano.free ? "badge-success" : "badge-neutral"}`}>
                        <span className={`status status-xs ${mano.free ? "status-success" : "status-neutral"}`} />
                        {mano.free ? "Online" : "Offline"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {calling && (
        <CallModal
          mano={calling}
          onClose={() => setCallingId(null)}
          onConfirm={() => {
            onCall(calling.id);
            setCallingId(null);
          }}
        />
      )}
    </main>
  );
}

function CallModal({ mano, onClose, onConfirm }: { mano: Mano; onClose: () => void; onConfirm: () => void }) {
  const firstName = mano.name.split(" ")[0];
  return (
    <Modal title={`Call ${firstName} over?`} eyebrow="Manager desk · demo" onClose={onClose}>
      <div className="flex items-center gap-3 rounded-box bg-base-200 p-3">
        <div className="avatar avatar-placeholder">
          <div className="w-10 rounded-full text-white" style={{ backgroundColor: mano.color }}>
            <span className="font-bold">{initials(mano.name)}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm">{mano.name}</strong>
          <span className="block truncate text-xs text-base-content/60">{mano.skills.join(" · ")}</span>
          <span className="block text-xs font-semibold text-base-content/70">
            {rateLabel(mano.perMinuteRate, mano.maxPerHand)}
          </span>
        </div>
        <span className={`badge badge-sm shrink-0 ${mano.free ? "badge-success" : "badge-neutral"}`}>
          {mano.free ? "Online" : "Offline"}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-base-content/70">
        This only posts a local demo note — nothing is sent to {firstName}’s phone.
      </p>

      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>
          <Icon name="phone" size={16} /> Call over to desk
        </button>
      </div>
    </Modal>
  );
}

export function ManagerPingModal({
  mano,
  onClose,
  onCreate,
}: {
  mano: Mano;
  onClose: () => void;
  onCreate: (values: RequestDraft) => void;
}) {
  const [memberName, setMemberName] = useState("");
  const [need, setNeed] = useState("");
  const [place, setPlace] = useState<string>(mano.zone);
  const [when, setWhen] = useState("Right now");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!mano.pings) return;
    onCreate({
      memberName: memberName.trim() || "A KWENCH member",
      need: need.trim() || "A quick hand",
      place: place.trim() || mano.zone,
      when: when.trim() || "Right now",
    });
  };

  return (
    <Modal title={`Quiet request · ${mano.name.split(" ")[0]}`} eyebrow="Manager dispatch · demo" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-box bg-base-200 p-3">
          <div className="avatar avatar-placeholder">
            <div className="w-10 rounded-full text-white" style={{ backgroundColor: mano.color }}>
              <span className="font-bold">{initials(mano.name)}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm">{mano.name}</strong>
            <span className="text-xs text-base-content/60">{mano.skills.join(" · ")} · {rateLabel(mano.perMinuteRate, mano.maxPerHand)}</span>
          </div>
          <span className={`badge ${mano.free ? "badge-success" : "badge-neutral"}`}>{mano.free ? "Free" : "Busy"}</span>
        </div>

        {!mano.pings && (
          <div role="alert" className="alert alert-warning alert-soft">
            <Icon name="shield" size={18} />
            <p className="text-xs"><strong>Pings are off for {mano.name.split(" ")[0]}.</strong> Only a mano who opted in can receive a quiet request. Ask them at the desk instead.</p>
          </div>
        )}
        {!mano.free && (
          <div role="alert" className="alert alert-warning alert-soft">
            <Icon name="hat" size={18} />
            <p className="text-xs"><strong>The hat is off, so they’re busy.</strong> You can still record a demo request, but check with the person first.</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/70">Member name</span>
            <input className="input input-sm w-full" value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="Maya Chen" required autoFocus />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/70">Where?</span>
            <input className="input input-sm w-full" value={place} onChange={(event) => setPlace(event.target.value)} placeholder={mano.zone} required />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-base-content/70">What do they need?</span>
          <input className="input input-sm w-full" value={need} onChange={(event) => setNeed(event.target.value)} placeholder="e.g. Slides won’t show on the big screen" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-base-content/70">When?</span>
          <input className="input input-sm w-full" value={when} onChange={(event) => setWhen(event.target.value)} required />
        </label>

        <div className="flex items-start gap-2 rounded-box bg-base-200 px-3 py-2 text-xs text-base-content/60">
          <Icon name="info" size={16} />
          <p>Clearly labelled demo. Nothing is texted, emailed, or pushed, and two requests at once are fine.</p>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={!mano.pings}>
          Send quiet request (demo) <Icon name="send" size={16} />
        </button>
      </form>
    </Modal>
  );
}
