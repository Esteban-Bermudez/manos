import { initials, type Mano } from "./data";
import { Icon } from "./Icons";
import { TipQr } from "./TipQr";

const FOLD_STEPS = [
  "Print this single sheet at 100% on A4 or Letter, printed side up.",
  "Fold the sheet in half, top to bottom, keeping the printed side facing out.",
  "Fold both top corners down to the centre line to make a triangle.",
  "Fold the bottom edge up over the triangle, front and back, to make the brim.",
  "Open it up and tuck the corners. The FREE panel, your name, skills, and tip QR stay on the outside.",
  "Wear it when you’re free. Hat off = busy; the app follows the hat.",
];

export function HatPage({
  mano,
  onPrint,
  onBack,
}: {
  mano: Mano;
  onPrint: () => void;
  onBack: () => void;
}) {
  const first = mano.name.split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">Your paper signal</p>
          <h1 className="mt-1 font-serif text-4xl font-bold">{first}’s origami hat.</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/70">
            One printed hat. Hat on means free; hat off means busy. The hat is the source
            of truth — the app only mirrors it.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button type="button" className="btn btn-neutral flex-1 sm:flex-none" onClick={onPrint}>
            <Icon name="printer" size={17} /> Print hat sheet
          </button>
          <button type="button" className="btn btn-ghost flex-1 sm:flex-none" onClick={onBack}>
            <Icon name="user" size={16} /> My mano
          </button>
        </div>
      </div>

      <div role="alert" className="alert alert-info alert-soft mt-5">
        <Icon name="info" size={18} />
        <p className="text-xs">
          Print one page on A4 or Letter at 100%, single-sided. Fold it so the FREE panel,
          name, skills, and tip QR end up on the outside. One page only.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="card border-2 border-success/40 bg-success/10 shadow-sm">
          <div className="card-body gap-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-bold tracking-widest text-success uppercase">
                <span className="status status-success" /> Printed hat
              </span>
              <span className="badge badge-success badge-sm">FREE</span>
            </div>
            <p className="font-serif text-5xl font-black tracking-wide text-success">FREE</p>
            <p className="text-sm font-semibold">Ask me for a hand.</p>
            <div>
              <p className="font-serif text-2xl font-bold">{mano.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {mano.skills.map((skill) => (
                  <span key={skill} className="badge badge-outline badge-sm">{skill}</span>
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-box border border-success/30 bg-base-100 p-3">
              <div className="shrink-0 rounded-box bg-base-100 p-1">
                <TipQr value={mano.kofiUrl} size={112} />
              </div>
              <div>
                <strong className="block text-sm">Scan to say thanks</strong>
                <p className="text-xs leading-relaxed text-base-content/60">
                  Optional tip, 100% to {first}. The QR opens {mano.kofiUrl.replace(/^https:\/\//, "")} — a real Ko-fi page.
                </p>
                <span className="mt-1 block text-[0.6rem] font-bold tracking-wider text-base-content/45 uppercase">
                  Ko-fi tip QR · generated in the browser
                </span>
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-base-content/65">
              <Icon name="hat" size={16} /> Wear the hat when you’re free. Take it off when you’re busy — the app shows busy when the hat is off.
            </p>
          </div>
        </section>

        <aside className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-2xl font-bold">Fold your hat</h2>
              <span className="text-secondary"><Icon name="scissors" size={20} /></span>
            </div>
            <ol className="flex flex-col gap-2">
              {FOLD_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-2 text-xs leading-relaxed text-base-content/75">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-content">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-box border border-dashed border-base-300 p-4 sm:flex-row">
        <p className="flex items-center gap-2 text-xs text-base-content/60">
          <span className="avatar avatar-placeholder">
            <span className="w-8 rounded-full text-white" style={{ backgroundColor: mano.color }}>
              <span className="text-xs font-bold">{initials(mano.name)}</span>
            </span>
          </span>
          Ready to wear at the front desk, {first}?
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onPrint}>
          <Icon name="printer" size={15} /> Print hat sheet
        </button>
      </div>
    </main>
  );
}
