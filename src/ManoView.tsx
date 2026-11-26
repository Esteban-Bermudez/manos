import { useEffect, useState, type FormEvent } from "react";
import { DemoPill, EmptyState, Modal } from "./components/Modal";
import { skillIcons } from "./DeskBoard";
import { calculateAmount, DEFAULT_MAX_PER_HAND, DEFAULT_PER_MINUTE_RATE, initials, isKofiUrl, MAX_SKILLS, money, profileUrl, rateLabel, SKILLS, ZONES, type DemoState, type HelpRequest, type Mano, type Skill, type Zone } from "./data";
import { Icon } from "./Icons";
import { TipQr } from "./TipQr";

const REMINDER_MINUTES = 15;

export function ManoView({
  state,
  mano,
  onSelectMano,
  onUpdate,
  onSignup,
  onOpenHat,
  onAccept,
  onDecline,
  onComplete,
  onReminder,
}: {
  state: DemoState;
  mano: Mano;
  onSelectMano: (id: string) => void;
  onUpdate: (patch: Partial<Mano>) => void;
  onSignup: () => void;
  onOpenHat: () => void;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onComplete: (requestId: string) => void;
  onReminder: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [kofiDraft, setKofiDraft] = useState(mano.kofiUrl);
  const [reminderArmed, setReminderArmed] = useState(false);

  const incoming = state.requests
    .filter((request) => request.manoId === mano.id && (request.status === "pinged" || request.status === "claimed"))
    .sort((a, b) => b.createdAt - a.createdAt);
  const url = profileUrl(mano);

  useEffect(() => {
    setKofiDraft(mano.kofiUrl);
    setLinkError("");
    setReminderArmed(false);
  }, [mano.id, mano.kofiUrl]);

  useEffect(() => {
    if (!reminderArmed) return;
    const timer = window.setTimeout(() => {
      setReminderArmed(false);
      onReminder();
    }, REMINDER_MINUTES * 60_000);
    return () => window.clearTimeout(timer);
  }, [reminderArmed]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setLinkError("Copy isn’t available here. Select the URL above to copy it manually.");
    }
  };

  const saveKofi = () => {
    if (!isKofiUrl(kofiDraft)) {
      setLinkError("Use a full https://ko-fi.com/yourname link.");
      return;
    }
    onUpdate({ kofiUrl: kofiDraft.trim() });
    setLinkError("");
  };

  const toggleSkill = (skill: Skill) => {
    if (mano.skills.includes(skill)) {
      onUpdate({ skills: mano.skills.filter((item) => item !== skill) });
    } else if (mano.skills.length < MAX_SKILLS) {
      onUpdate({ skills: [...mano.skills, skill] });
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">Your mano corner</p>
          <h1 className="mt-1 font-serif text-4xl font-bold">Hola, {mano.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm text-base-content/70">Two buttons, one hat, a rate by the minute. That’s the whole job.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-[0.65rem] font-bold tracking-wider text-base-content/50 uppercase">Viewing demo profile</span>
            <select className="select select-sm w-full" value={mano.id} onChange={(event) => onSelectMano(event.target.value)}>
              {state.manos.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button type="button" className="btn btn-outline btn-sm" onClick={onSignup}>
            <Icon name="plus" size={16} /> Join as a mano
          </button>
        </div>
      </div>

      <section className="card mt-6 border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="avatar avatar-placeholder">
              <div className="w-14 rounded-full text-white" style={{ backgroundColor: mano.color }}>
                <span className="text-xl font-bold">{initials(mano.name)}</span>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-2xl font-bold">{mano.name}</h2>
                <span className={`badge gap-1.5 ${mano.free ? "badge-success" : "badge-neutral"}`}>
                  <span className={`status status-xs ${mano.free ? "status-success" : "status-neutral"}`} />
                  {mano.free ? "Free · hat on" : "Busy · hat off"}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-base-content/70">{mano.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="badge badge-outline badge-sm gap-1"><Icon name="desk" size={12} />{mano.zone}</span>
                {mano.skills.map((skill) => (
                  <span key={skill} className="badge badge-ghost badge-sm gap-1"><Icon name={skillIcons[skill]} size={12} />{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-6 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
            <div>
              <p className="text-2xl font-black">{Math.round(mano.perMinuteRate * 100)}¢<span className="text-sm font-bold text-base-content/50">/min</span></p>
              <p className="text-xs text-base-content/55">{money(mano.maxPerHand)} max per hand · KWENCH pays</p>
            </div>
            <p className="text-xs text-base-content/55">{incoming.length} open {incoming.length === 1 ? "request" : "requests"}</p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4">
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">One simple switch</p>
                  <h2 className="font-serif text-2xl font-bold">Are you free right now?</h2>
                </div>
                <span className="text-secondary"><Icon name="hand" size={24} /></span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Set your availability">
                <button
                  type="button"
                  aria-pressed={mano.free}
                  className={`btn h-auto flex-col items-start gap-0.5 py-4 ${mano.free ? "btn-success" : "btn-outline"}`}
                  onClick={() => onUpdate({ free: true })}
                >
                  <span className="flex items-center gap-2 text-base font-bold"><span className={`status ${mano.free ? "status-success" : "status-neutral"}`} />I’m free</span>
                  <span className="text-xs font-normal opacity-80">Hat on</span>
                </button>
                <button
                  type="button"
                  aria-pressed={!mano.free}
                  className={`btn h-auto flex-col items-start gap-0.5 py-4 ${!mano.free ? "btn-warning" : "btn-outline"}`}
                  onClick={() => onUpdate({ free: false })}
                >
                  <span className="flex items-center gap-2 text-base font-bold"><span className={`status ${!mano.free ? "status-warning" : "status-neutral"}`} />I’m busy</span>
                  <span className="text-xs font-normal opacity-80">Hat off</span>
                </button>
              </div>

              <p className="flex items-start gap-2 rounded-box bg-base-200 px-3 py-2 text-xs leading-relaxed text-base-content/65">
                <Icon name="hat" size={16} />
                <span>The paper hat is the real signal and wins over the app: hat on means free, hat off means busy. If the app and the hat disagree, a KWENCH manager checks with you.</span>
              </p>

              <label className="flex items-center justify-between gap-4 rounded-box border border-base-300 px-3 py-2.5">
                <span>
                  <strong className="flex items-center gap-2 text-sm"><Icon name="bell" size={16} /> Open to quiet pings?</strong>
                  <small className="text-xs text-base-content/60">Off by default. Only opted-in manos get a demo request from the desk.</small>
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={mano.pings}
                  onChange={(event) => onUpdate({ pings: event.target.checked })}
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 border-t border-base-200 pt-3">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReminderArmed(true)} disabled={reminderArmed}>
                  <Icon name="clock" size={15} /> {reminderArmed ? "Nudge set" : `Nudge me in ${REMINDER_MINUTES} min`}
                </button>
                <small className="min-w-40 flex-1 text-xs text-base-content/55">
                  {reminderArmed ? "We’ll tap you on the shoulder while this tab is open. The hat still wins." : "A digital reminder is fine. It never replaces the hat."}
                </small>
              </div>
            </div>
          </section>

          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">Demo inbox</p>
                  <h2 className="font-serif text-2xl font-bold">Hands for you</h2>
                </div>
                <DemoPill>Nothing is sent</DemoPill>
              </div>

              {incoming.length === 0 ? (
                <EmptyState icon="bell" title="No pings right now">
                  When Morgan quietly pings you, it lands here. Nothing else is notified.
                </EmptyState>
              ) : (
                <div className="flex flex-col gap-3">
                  {incoming.map((request) => (
                    <RequestNotification
                      key={request.id}
                      request={request}
                      onAccept={() => onAccept(request.id)}
                      onDecline={() => onDecline(request.id)}
                      onComplete={() => onComplete(request.id)}
                    />
                  ))}
                </div>
              )}
              <p className="flex items-center gap-1.5 text-xs text-base-content/50">
                <Icon name="info" size={13} /> Passed or unclaimed requests cost nothing. A hand never bills by the minute.
              </p>
            </div>
          </section>

          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">Your one number</p>
                  <h2 className="font-serif text-2xl font-bold">Rate by the minute</h2>
                </div>
                <DemoPill>Editable demo setting</DemoPill>
              </div>
              <p className="text-sm text-base-content/70">
                You set a per-minute rate and a maximum per hand. KWENCH pays the
                calculated amount when you tap Done. Members pay nothing.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-base-content/70">Per-minute rate</span>
                  <label className="input flex items-center gap-1">
                    <span className="text-base-content/50">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="grow"
                      value={mano.perMinuteRate}
                      onChange={(event) => onUpdate({ perMinuteRate: Math.max(0, Number(event.target.value)) })}
                    />
                    <span className="text-xs text-base-content/45">/ min</span>
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-base-content/70">Maximum per hand</span>
                  <label className="input flex items-center gap-1">
                    <span className="text-base-content/50">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="grow"
                      value={mano.maxPerHand}
                      onChange={(event) => onUpdate({ maxPerHand: Math.max(0, Number(event.target.value)) })}
                    />
                    <span className="text-xs text-base-content/45">cap</span>
                  </label>
                </div>
              </div>
              <div className="rounded-box bg-base-200 px-3 py-2 text-xs leading-relaxed text-base-content/70">
                <strong className="text-base-content">{rateLabel(mano.perMinuteRate, mano.maxPerHand)}</strong>
                <span className="block">
                  Examples: 5 min = {money(calculateAmount(mano.perMinuteRate, mano.maxPerHand, 5))} · 10 min = {money(calculateAmount(mano.perMinuteRate, mano.maxPerHand, 10))} · 20 min = {money(calculateAmount(mano.perMinuteRate, mano.maxPerHand, 20))} (capped).
                </span>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs text-base-content/70">
                <li className="flex items-center gap-2"><Icon name="check" size={14} /> Demo minutes, no live timer</li>
                <li className="flex items-center gap-2"><Icon name="check" size={14} /> Paid by KWENCH, not the member</li>
                <li className="flex items-center gap-2"><Icon name="check" size={14} /> Optional tip goes 100% to you</li>
              </ul>
              <p className="flex items-center gap-1.5 text-xs text-base-content/50">
                <Icon name="info" size={13} /> Demo configuration only. No job is booked and no payment is collected.
              </p>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">Your little corner</p>
                  <h2 className="font-serif text-xl font-bold">Profile &amp; tips</h2>
                </div>
                <span className="text-secondary"><Icon name="qr" size={22} /></span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-base-content/70">Your unique Manos URL</span>
                <span className="flex gap-2">
                  <input className="input input-sm w-full" readOnly value={url} onFocus={(event) => event.target.select()} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={copyUrl} aria-label="Copy Manos profile URL">
                    <Icon name={copied ? "check" : "copy"} size={16} />
                  </button>
                </span>
                <small className="text-xs text-base-content/50">Copyable demo link — not a live page.</small>
              </div>
              {copied && <p role="status" className="flex items-center gap-1 text-xs font-semibold text-success"><Icon name="check" size={13} /> Copied!</p>}

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-base-content/70">Ko-fi URL</span>
                <input
                  className="input input-sm w-full"
                  value={kofiDraft}
                  onChange={(event) => setKofiDraft(event.target.value)}
                  onBlur={saveKofi}
                  placeholder="https://ko-fi.com/yourname"
                  inputMode="url"
                />
                <small className="text-xs text-base-content/50">The QR opens this real Ko-fi page. No payment happens inside MANOS.</small>
              </label>
              {linkError && <p role="alert" className="text-xs font-semibold text-error">{linkError}</p>}

              <div className="flex items-center gap-3 rounded-box border border-dashed border-base-300 bg-base-200/60 p-3">
                <div className="shrink-0 rounded-box bg-base-100 p-1">
                  <TipQr value={mano.kofiUrl} size={82} />
                </div>
                <div>
                  <strong className="block text-xs">“Scan to say thanks.”</strong>
                  <p className="text-xs leading-relaxed text-base-content/60">
                    The QR is real and opens {mano.kofiUrl.replace(/^https:\/\//, "")}. Tips are optional and 100% go to the mano; this app only records a mock receipt.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card bg-secondary/15 border border-secondary/30 shadow-sm">
            <div className="card-body gap-3 p-5">
              <span className="text-secondary"><Icon name="hat" size={28} /></span>
              <h2 className="font-serif text-2xl font-bold">The hat is the signal.</h2>
              <p className="text-sm leading-relaxed text-base-content/70">
                Print the one-page origami hat: wear it when you’re free, take it off
                when you’re busy. Name, skills, and the tip QR sit on the outside.
              </p>
              <div className={`hat-preview ${mano.free ? "free" : "busy"}`}>
                <span>MANOS · KWENCH</span>
                <strong>{mano.free ? "FREE" : "HAT OFF"}</strong>
                <small>{mano.free ? "Hat on · ask me for a hand" : "Hat off · busy right now"}</small>
              </div>
              <button type="button" className="btn btn-neutral btn-block" onClick={onOpenHat}>
                <Icon name="printer" size={16} /> Open hat page
              </button>
              <small className="text-xs text-base-content/55">One page · A4 or Letter · fold notes included</small>
            </div>
          </section>

          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-bold">Your zone</h2>
                <span className="text-secondary"><Icon name="desk" size={20} /></span>
              </div>
              <p className="text-xs text-base-content/60">Where Morgan should send people. Shown on your card and hat-side profile.</p>
              <select className="select select-sm w-full" value={mano.zone} onChange={(event) => onUpdate({ zone: event.target.value as Zone })}>
                {ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
              </select>
            </div>
          </section>
        </aside>
      </div>

      <section className="card mt-4 border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-3 p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">Keywords, not a CV</p>
              <h2 className="font-serif text-xl font-bold">Pick up to three skills</h2>
            </div>
            <span className="text-xs text-base-content/50">{mano.skills.length}/{MAX_SKILLS} picked</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((skill) => (
              <label
                key={skill}
                className={`flex cursor-pointer items-center gap-2 rounded-box border px-3 py-2.5 text-sm font-semibold ${
                  mano.skills.includes(skill) ? "border-success/50 bg-success/10" : "border-base-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-success"
                  checked={mano.skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  disabled={!mano.skills.includes(skill) && mano.skills.length >= MAX_SKILLS}
                />
                <Icon name={skillIcons[skill]} size={16} />{skill}
              </label>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-base-content/50">
            <Icon name="info" size={13} /> Fixed keywords keep the board scannable. Your skills print on the hat.
          </p>
        </div>
      </section>
    </main>
  );
}

function RequestNotification({
  request,
  onAccept,
  onDecline,
  onComplete,
}: {
  request: HelpRequest;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
}) {
  return (
    <article className="card border border-base-300 bg-base-100">
      <div className="card-body gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-box bg-info/15 text-info"><Icon name="bell" size={16} /></span>
            <DemoPill>Quiet demo ping</DemoPill>
          </div>
          <span className={`badge badge-sm ${request.status === "claimed" ? "badge-warning" : "badge-info"}`}>
            {request.status === "claimed" ? "Yours" : "New"}
          </span>
        </div>
        <h3 className="font-serif text-lg font-semibold">{request.memberName} needs a hand</h3>
        <p className="text-sm text-base-content/75">“{request.need}”</p>
        <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
          <span className="flex items-center gap-1"><Icon name="clock" size={13} />{request.when}</span>
          <span className="flex items-center gap-1"><Icon name="desk" size={13} />{request.place}</span>
        </div>
        <div className="card-actions mt-1 flex-wrap gap-2">
          {request.status === "pinged" && <button type="button" className="btn btn-primary btn-sm" onClick={onAccept}>I’ll take it</button>}
          {request.status === "claimed" && <button type="button" className="btn btn-success btn-sm" onClick={onComplete}>Done <Icon name="check" size={15} /></button>}
          {request.status === "pinged" && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onDecline}>Not now (no charge)</button>
          )}
        </div>
      </div>
    </article>
  );
}

export function SignupModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (values: { name: string; headline: string; skills: Skill[]; zone: Zone; perMinuteRate: number; maxPerHand: number; kofiUrl: string; pings: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [zone, setZone] = useState<Zone>("Front desk");
  const [perMinuteRate, setPerMinuteRate] = useState(DEFAULT_PER_MINUTE_RATE);
  const [maxPerHand, setMaxPerHand] = useState(DEFAULT_MAX_PER_HAND);
  const [kofiUrl, setKofiUrl] = useState("");
  const [pings, setPings] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (skill: Skill) => {
    setSkills((current) => {
      if (current.includes(skill)) return current.filter((item) => item !== skill);
      if (current.length >= MAX_SKILLS) return current;
      return [...current, skill];
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (skills.length === 0) {
      setError("Pick at least one skill keyword.");
      return;
    }
    if (!isKofiUrl(kofiUrl)) {
      setError("Use a full https://ko-fi.com/yourname link.");
      return;
    }
    onCreate({ name: name.trim(), headline: headline.trim() || "Happy to lend a hand.", skills, zone, perMinuteRate, maxPerHand, kofiUrl: kofiUrl.trim(), pings });
  };

  return (
    <Modal title="Become a mano" eyebrow="A little about you" onClose={onClose} wide>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-base-content/70">
          Pick up to three skills, a per-minute rate with a cap, your zone, and your
          Ko-fi. Then print the hat — it’s the signal everyone will actually see.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/70">Your name</span>
            <input className="input input-sm w-full" value={name} onChange={(event) => setName(event.target.value)} placeholder="Sam Okafor" required autoFocus />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/70">Your zone</span>
            <select className="select select-sm w-full" value={zone} onChange={(event) => setZone(event.target.value as Zone)}>
              {ZONES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-base-content/70">A friendly one-liner</span>
          <input className="input input-sm w-full" value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="I can untangle slides and the printer." maxLength={90} />
        </label>
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-xs">How can you help? (up to three)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {SKILLS.map((skill) => (
              <label key={skill} className={`flex cursor-pointer items-center gap-2 rounded-box border px-3 py-2 text-sm font-semibold ${skills.includes(skill) ? "border-success/50 bg-success/10" : "border-base-300"}`}>
                <input type="checkbox" className="checkbox checkbox-sm checkbox-success" checked={skills.includes(skill)} onChange={() => toggleSkill(skill)} />
                <Icon name={skillIcons[skill]} size={16} />{skill}
              </label>
            ))}
          </div>
          {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/70">Per-minute rate</span>
            <label className="input flex items-center gap-1">
              <span className="text-base-content/50">$</span>
              <input type="number" min="0" step="0.01" className="grow" value={perMinuteRate} onChange={(event) => setPerMinuteRate(Math.max(0, Number(event.target.value)))} required />
              <span className="text-xs text-base-content/45">/ min</span>
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/70">Maximum per hand</span>
            <label className="input flex items-center gap-1">
              <span className="text-base-content/50">$</span>
              <input type="number" min="0" step="0.5" className="grow" value={maxPerHand} onChange={(event) => setMaxPerHand(Math.max(0, Number(event.target.value)))} required />
              <span className="text-xs text-base-content/45">cap</span>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/70">Ko-fi URL</span>
            <input className="input input-sm w-full" value={kofiUrl} onChange={(event) => setKofiUrl(event.target.value)} placeholder="https://ko-fi.com/yourname" inputMode="url" required />
          </label>
        </div>
        <label className="flex items-center justify-between gap-4 rounded-box border border-base-300 px-3 py-2.5">
          <span>
            <strong className="block text-sm">Open to quiet pings?</strong>
            <small className="text-xs text-base-content/60">Off by default. You can change it any time.</small>
          </span>
          <input type="checkbox" className="toggle toggle-success" checked={pings} onChange={(event) => setPings(event.target.checked)} />
        </label>
        <div role="alert" className="alert alert-info alert-soft">
          <Icon name="shield" size={18} />
          <p className="text-xs">Demo profile only. Nothing is published, no payment data is stored, and you start <strong>busy</strong> until you put your hat on.</p>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Create my demo profile <Icon name="arrow" size={16} /></button>
      </form>
    </Modal>
  );
}
