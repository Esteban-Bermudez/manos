import { useEffect, useRef, useState } from "react";
import { DeskBoard, ManagerPingModal } from "./DeskBoard";
import { ManoView, SignupModal } from "./ManoView";
import { ReceiptModal } from "./Flows";
import { HatPage } from "./HatPage";
import { Icon } from "./Icons";
import { PaperHat } from "./PaperHat";
import {
  calculateAmount,
  cloneSeed,
  findMano,
  type DemoState,
  type HelpRequest,
  type Mano,
  type Receipt,
  type RequestDraft,
  type RequestStatus,
  type Skill,
  type Zone,
} from "./data";

const STORAGE_KEY = "manos-demo-state-v3";

type ModalState =
  | { kind: "ping"; manoId: string }
  | { kind: "signup" }
  | { kind: "receipt"; receiptId: string }
  | null;

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed.version !== 3 || !Array.isArray(parsed.manos) || parsed.manos.length === 0 || !parsed.selectedManoId) {
      return cloneSeed();
    }
    return {
      ...cloneSeed(),
      ...parsed,
      requests: Array.isArray(parsed.requests) ? parsed.requests : [],
      receipts: Array.isArray(parsed.receipts) ? parsed.receipts : [],
    };
  } catch {
    return cloneSeed();
  }
}

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function App() {
  const [state, setState] = useState<DemoState>(loadState);
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The demo keeps working when storage is blocked or isolated.
    }
  }, [state]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 5200);
  };

  const selectedMano = findMano(state, state.selectedManoId) ?? state.manos[0];
  const pingMano = modal?.kind === "ping" ? findMano(state, modal.manoId) : undefined;
  const receipt = modal?.kind === "receipt" ? state.receipts.find((item) => item.id === modal.receiptId) : undefined;
  const receiptMano = receipt ? findMano(state, receipt.manoId) : undefined;
  const dispatchTarget = state.manos.find((mano) => mano.free && mano.pings) ?? state.manos.find((mano) => mano.pings) ?? state.manos[0];

  const updateMano = (patch: Partial<Mano>) => {
    setState((current) => ({
      ...current,
      manos: current.manos.map((mano) => mano.id === current.selectedManoId ? { ...mano, ...patch } : mano),
    }));
  };

  const createQuietRequest = (manoId: string, draft: RequestDraft) => {
    const mano = findMano(state, manoId);
    const request: HelpRequest = {
      ...draft,
      id: newId("request"),
      status: "pinged",
      manoId,
      createdAt: Date.now(),
    };
    setState((current) => ({ ...current, requests: [request, ...current.requests] }));
    setModal(null);
    notify(`Quiet demo request prepared for ${mano?.name.split(" ")[0] ?? "the mano"}. Nothing was sent.`);
  };

  const setRequestStatus = (requestId: string, status: RequestStatus) => {
    setState((current) => ({
      ...current,
      requests: current.requests.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      ),
    }));
  };

  const acceptRequest = (requestId: string) => {
    setRequestStatus(requestId, "claimed");
    notify("The hand is yours. The app now mirrors your hat for Morgan.");
  };

  const declineRequest = (requestId: string) => {
    setRequestStatus(requestId, "declined");
    notify("Passed with no charge. The desk will see it was a no.");
  };

  const completeRequest = (requestId: string) => {
    const request = state.requests.find((item) => item.id === requestId);
    const mano = request ? findMano(state, request.manoId) : undefined;
    if (!request || !mano) return;
    const newReceipt: Receipt = {
      id: newId("receipt"),
      requestId,
      memberName: request.memberName,
      manoId: mano.id,
      perMinuteRate: mano.perMinuteRate,
      maxPerHand: mano.maxPerHand,
      minutes: 5,
      amount: calculateAmount(mano.perMinuteRate, mano.maxPerHand, 5),
      tipAmount: 0,
      completedAt: Date.now(),
    };
    setState((current) => ({
      ...current,
      requests: current.requests.map((item) => item.id === requestId ? { ...item, status: "completed" } : item),
      receipts: [newReceipt, ...current.receipts],
    }));
    setModal({ kind: "receipt", receiptId: newReceipt.id });
  };

  const setTip = (receiptId: string, tipAmount: number) => {
    setState((current) => ({
      ...current,
      receipts: current.receipts.map((item) => item.id === receiptId ? { ...item, tipAmount } : item),
    }));
  };

  const setMinutes = (receiptId: string, minutes: number) => {
    setState((current) => ({
      ...current,
      receipts: current.receipts.map((item) =>
        item.id === receiptId
          ? { ...item, minutes, amount: calculateAmount(item.perMinuteRate, item.maxPerHand, minutes) }
          : item,
      ),
    }));
  };

  const createMano = (values: { name: string; headline: string; skills: Skill[]; zone: Zone; perMinuteRate: number; maxPerHand: number; kofiUrl: string; pings: boolean }) => {
    const colors = ["#e9b949", "#8eb8a6", "#dc927f", "#b4a7d6", "#88b7cf"];
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mano";
    const mano: Mano = {
      ...values,
      id: newId(slug),
      free: false,
      color: colors[state.manos.length % colors.length],
    };
    setState((current) => ({ ...current, manos: [...current.manos, mano], selectedManoId: mano.id, view: "hat" }));
    setModal(null);
    notify(`Welcome, ${mano.name.split(" ")[0]}. Your hat sheet is ready — print it, fold it, and wear it when you’re free.`);
  };

  const callManoToDesk = (manoId: string) => {
    const mano = findMano(state, manoId);
    notify(`Called ${mano?.name.split(" ")[0] ?? "the mano"} to the manager desk.`);
  };

  const resetDemo = () => {
    if (!window.confirm("Reset all demo profiles, requests, rates, and receipts?")) return;
    setState(cloneSeed());
    setModal(null);
    notify("Demo reset. Fresh hats, fresh start.");
  };

  return (
    <>
      <div id="app-shell" className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/95 backdrop-blur">
          <div className="navbar mx-auto w-full max-w-6xl gap-2 px-4 sm:px-6">
            <div className="navbar-start">
              <button type="button" className="btn btn-ghost gap-2 px-2" onClick={() => setState((current) => ({ ...current, view: "desk" }))} aria-label="MANOS home">
                <span className="grid size-9 -rotate-3 place-items-center rounded-box rounded-bl-sm bg-primary text-primary-content shadow-md">
                  <Icon name="hand" size={20} />
                </span>
                <span className="text-left leading-none">
                  <strong className="block font-serif text-xl tracking-[0.06em]">MANOS</strong>
                  <small className="text-[0.6rem] tracking-wider text-base-content/50 uppercase">tu mano en KWENCH</small>
                </span>
              </button>
            </div>
            <div className="navbar-center hidden md:flex">
              <div role="tablist" className="tabs tabs-box tabs-sm">
                <button
                  type="button"
                  role="tab"
                  aria-selected={state.view === "desk"}
                  className={`tab ${state.view === "desk" ? "tab-active" : ""}`}
                  onClick={() => setState((current) => ({ ...current, view: "desk" }))}
                >
                  <Icon name="desk" size={15} /> Desk board
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={state.view === "mano"}
                  className={`tab ${state.view === "mano" ? "tab-active" : ""}`}
                  onClick={() => setState((current) => ({ ...current, view: "mano" }))}
                >
                  <Icon name="user" size={15} /> My mano
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={state.view === "hat"}
                  className={`tab ${state.view === "hat" ? "tab-active" : ""}`}
                  onClick={() => setState((current) => ({ ...current, view: "hat" }))}
                >
                  <Icon name="hat" size={15} /> Hat
                </button>
              </div>
            </div>
            <div className="navbar-end gap-2">
              <span className="badge badge-success badge-sm gap-1.5">
                <span className="status status-xs status-success" /> Demo only
              </span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal({ kind: "ping", manoId: dispatchTarget.id })}>
                <Icon name="hand" size={15} /> <span className="hidden sm:inline">New quiet request</span><span className="sm:hidden">Request</span>
              </button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-6xl px-4 pb-2 md:hidden">
            <div role="tablist" className="tabs tabs-box tabs-xs w-full">
              <button
                type="button"
                role="tab"
                aria-selected={state.view === "desk"}
                className={`tab flex-1 ${state.view === "desk" ? "tab-active" : ""}`}
                onClick={() => setState((current) => ({ ...current, view: "desk" }))}
              >
                <Icon name="desk" size={14} /> Desk board
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={state.view === "mano"}
                className={`tab flex-1 ${state.view === "mano" ? "tab-active" : ""}`}
                onClick={() => setState((current) => ({ ...current, view: "mano" }))}
              >
                <Icon name="user" size={14} /> My mano
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={state.view === "hat"}
                className={`tab flex-1 ${state.view === "hat" ? "tab-active" : ""}`}
                onClick={() => setState((current) => ({ ...current, view: "hat" }))}
              >
                <Icon name="hat" size={14} /> Hat
              </button>
            </div>
          </div>
        </header>

        {state.view === "hat" ? (
          <HatPage mano={selectedMano} onPrint={() => window.print()} onBack={() => setState((current) => ({ ...current, view: "mano" }))} />
        ) : state.view === "desk" ? (
          <DeskBoard state={state} onCall={callManoToDesk} />
        ) : (
          <ManoView
            state={state}
            mano={selectedMano}
            onSelectMano={(selectedManoId) => setState((current) => ({ ...current, selectedManoId }))}
            onUpdate={updateMano}
            onSignup={() => setModal({ kind: "signup" })}
            onOpenHat={() => setState((current) => ({ ...current, view: "hat" }))}
            onAccept={acceptRequest}
            onDecline={declineRequest}
            onComplete={completeRequest}
            onReminder={() => notify("Hat check: are you wearing it? Hat on means free — update the app to match.")}
          />
        )}

        <footer className="mt-auto border-t border-base-300 bg-base-100">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="flex items-center gap-2 font-serif text-lg font-bold"><Icon name="hand" size={17} /> MANOS</span>
              <p className="text-xs text-base-content/60">Neighbors helping neighbors at KWENCH.</p>
            </div>
            <div className="flex max-w-2xl items-start gap-2 text-xs leading-relaxed text-base-content/55">
              <Icon name="shield" size={16} />
              <p>
                Clickable prototype, local only. Pings, receipts, and in-app tips are
                simulated; no money moves and no payment data is stored. The paper hat is
                the source of truth and the app only mirrors self-reported availability.
                Public areas only — no private rooms.
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetDemo}>
              <Icon name="reset" size={15} /> Reset demo
            </button>
          </div>
        </footer>
      </div>

      <PaperHat mano={selectedMano} />

      {modal?.kind === "ping" && pingMano && (
        <ManagerPingModal
          mano={pingMano}
          onClose={() => setModal(null)}
          onCreate={(values) => createQuietRequest(pingMano.id, values)}
        />
      )}
      {modal?.kind === "signup" && <SignupModal onClose={() => setModal(null)} onCreate={createMano} />}
      {modal?.kind === "receipt" && receipt && receiptMano && (
        <ReceiptModal
          receipt={receipt}
          mano={receiptMano}
          onClose={() => setModal(null)}
          onSetTip={setTip}
          onSetMinutes={setMinutes}
        />
      )}

      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div role="status" className="alert alert-success max-w-sm shadow-lg">
            <Icon name="bell" size={18} />
            <span className="text-xs leading-relaxed">{toast}</span>
            <button type="button" className="btn btn-circle btn-ghost btn-xs" onClick={() => setToast("")} aria-label="Dismiss notification">
              <Icon name="close" size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
