import { DemoPill, Modal } from "./components/Modal";
import { DEMO_MINUTE_OPTIONS, money, rateLabel, type Mano, type Receipt } from "./data";
import { Icon } from "./Icons";
import { TipQr } from "./TipQr";

export function ReceiptModal({
  receipt,
  mano,
  onClose,
  onSetTip,
  onSetMinutes,
}: {
  receipt: Receipt;
  mano: Mano;
  onClose: () => void;
  onSetTip: (receiptId: string, tipAmount: number) => void;
  onSetMinutes: (receiptId: string, minutes: number) => void;
}) {
  const first = mano.name.split(" ")[0];

  return (
    <Modal title="A hand, a thank you." eyebrow="Mock receipt" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <span className="inline-grid size-12 place-items-center rounded-full bg-success/15 text-success">
            <Icon name="check" size={26} />
          </span>
          <h3 className="mt-2 font-serif text-2xl font-bold">Hand complete.</h3>
          <p className="text-sm text-base-content/60">{receipt.memberName} + {mano.name}</p>
          <div className="mt-2"><DemoPill>Demo · no money moved</DemoPill></div>
        </div>

        <div className="overflow-hidden rounded-box border border-base-300">
          <div className="flex items-center justify-between gap-3 bg-success/10 p-4">
            <div>
              <p className="text-xs font-bold tracking-wider text-base-content/50 uppercase">Space owes {first}</p>
              <p className="text-xs text-base-content/60">
                {receipt.minutes} demo min × {Math.round(receipt.perMinuteRate * 100)}¢/min · {money(receipt.maxPerHand)} max
              </p>
            </div>
            <strong className="text-3xl font-black">{money(receipt.amount)}</strong>
          </div>
          <div className="flex items-center justify-between border-t border-base-200 px-4 py-2 text-xs">
            <span className="text-base-content/60">Member pays</span>
            <strong>$0.00</strong>
          </div>
          <div className="flex items-center justify-between border-t border-base-200 px-4 py-2 text-xs">
            <span className="text-base-content/60">Mock tip recorded</span>
            <strong>{receipt.tipAmount > 0 ? money(receipt.tipAmount) : "None yet"}</strong>
          </div>
        </div>

        <div className="rounded-box border border-base-300 p-3">
          <p className="text-xs font-bold tracking-wider text-base-content/50 uppercase">Demo minutes</p>
          <p className="mt-0.5 text-xs text-base-content/60">
            No live timer — pick how long the hand felt. The amount is capped and recalculated.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {DEMO_MINUTE_OPTIONS.map((minutes) => (
              <button
                type="button"
                key={minutes}
                className={`btn btn-xs ${receipt.minutes === minutes ? "btn-primary" : "btn-outline"}`}
                onClick={() => onSetMinutes(receipt.id, minutes)}
              >
                {minutes} min
              </button>
            ))}
            <label className="join ml-auto">
              <input
                type="number"
                min="0"
                max="240"
                className="input input-sm join-item w-20"
                value={receipt.minutes}
                onChange={(event) => onSetMinutes(receipt.id, Math.max(0, Number(event.target.value)))}
                aria-label="Demo minutes"
              />
              <span className="btn btn-sm join-item pointer-events-none">min</span>
            </label>
          </div>
          <p className="mt-2 text-xs text-base-content/50">Mano rate: {rateLabel(receipt.perMinuteRate, receipt.maxPerHand)} · paid by KWENCH</p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-box bg-base-200 p-4 sm:flex-row">
          <div className="shrink-0 rounded-box bg-base-100 p-1.5">
            <TipQr value={mano.kofiUrl} size={112} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold">Say thanks, if you like.</h4>
            <p className="text-xs leading-relaxed text-base-content/65">
              The QR is real: it opens {mano.kofiUrl.replace(/^https:\/\//, "")}. Tips are
              optional and go 100% to the mano. Only the in-app tip record is mock.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Record a demo tip">
              {[0, 1, 2, 3, 5].map((amount) => (
                <button
                  type="button"
                  key={amount}
                  className={`btn btn-xs ${receipt.tipAmount === amount ? "btn-success" : "btn-outline"}`}
                  onClick={() => onSetTip(receipt.id, amount)}
                >
                  {amount === 0 ? "No tip" : money(amount)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div role="alert" className="alert alert-info alert-soft">
          <Icon name="heart" size={18} />
          <p className="text-xs">
            {receipt.tipAmount > 0
              ? <><strong>{money(receipt.tipAmount)} mock tip recorded.</strong> Nothing was charged, and the app stores no payment data.</>
              : <><strong>Tips are optional.</strong> The mock amount already came from KWENCH — the community connection is the point.</>}
          </p>
        </div>

        <button type="button" className="btn btn-neutral btn-block" onClick={onClose}>
          Back to the board <Icon name="arrow" size={16} />
        </button>
      </div>
    </Modal>
  );
}
