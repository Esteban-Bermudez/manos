export type Skill = "Screens" | "Wi-Fi" | "Printing" | "Design";

export type Zone = "Front desk" | "Novelty" | "Connection";

export type Mano = {
  id: string;
  name: string;
  headline: string;
  skills: Skill[];
  zone: Zone;
  /** Mirrors the paper hat. The hat is the source of truth. */
  free: boolean;
  /** Opt-in. Default off: only opted-in manos receive demo pings. */
  pings: boolean;
  /** Mock timed rate, paid by KWENCH. */
  perMinuteRate: number;
  maxPerHand: number;
  kofiUrl: string;
  color: string;
};

export type RequestStatus = "pinged" | "claimed" | "completed" | "declined";

export type HelpRequest = {
  id: string;
  memberName: string;
  need: string;
  place: string;
  when: string;
  status: RequestStatus;
  manoId: string;
  createdAt: number;
};

export type RequestDraft = {
  memberName: string;
  need: string;
  place: string;
  when: string;
};

export type Receipt = {
  id: string;
  requestId: string;
  memberName: string;
  manoId: string;
  perMinuteRate: number;
  maxPerHand: number;
  /** Demo minutes picked on the mock receipt — no live timer. */
  minutes: number;
  amount: number;
  tipAmount: number;
  completedAt: number;
};

export type View = "desk" | "mano" | "hat";

export type DemoState = {
  version: 3;
  manos: Mano[];
  selectedManoId: string;
  requests: HelpRequest[];
  receipts: Receipt[];
  view: View;
};

export const SKILLS: Skill[] = ["Screens", "Wi-Fi", "Printing", "Design"];

export const ZONES: Zone[] = ["Front desk", "Novelty", "Connection"];

export const MAX_SKILLS = 3;

export const DEFAULT_PER_MINUTE_RATE = 0.1;
export const DEFAULT_MAX_PER_HAND = 2;

export const DEMO_MINUTE_OPTIONS = [2, 5, 10, 20];

/** amount = min(maxPerHand, demo minutes × per-minute rate), rounded to cents. */
export const calculateAmount = (perMinuteRate: number, maxPerHand: number, minutes: number) =>
  Math.round(Math.min(maxPerHand, Math.max(0, minutes) * Math.max(0, perMinuteRate)) * 100) / 100;

export const SEED_STATE: DemoState = {
  version: 3,
  selectedManoId: "esteban",
  view: "desk",
  requests: [],
  receipts: [],
  manos: [
    {
      id: "esteban",
      name: "Esteban Bermúdez",
      headline: "Slides, Wi-Fi, and the printer that hates everyone.",
      skills: ["Screens", "Wi-Fi", "Printing"],
      zone: "Novelty",
      free: true,
      pings: true,
      perMinuteRate: 0.1,
      maxPerHand: 2,
      kofiUrl: "https://ko-fi.com/estebanbermudez",
      color: "#e9b949",
    },
    {
      id: "sam",
      name: "Sam Okafor",
      headline: "Print, fold, and make it look good on paper.",
      skills: ["Printing", "Design"],
      zone: "Front desk",
      free: false,
      pings: false,
      perMinuteRate: 0.1,
      maxPerHand: 2,
      kofiUrl: "https://ko-fi.com/example-sam",
      color: "#8eb8a6",
    },
    {
      id: "kai",
      name: "Kai Nguyen",
      headline: "Just finished the welcome — screens and Wi-Fi are my thing.",
      skills: ["Wi-Fi", "Screens"],
      zone: "Connection",
      free: true,
      pings: true,
      perMinuteRate: 0.1,
      maxPerHand: 2,
      kofiUrl: "https://ko-fi.com/estebanbermudez",
      color: "#dc927f",
    },
  ],
};

export const cloneSeed = (): DemoState => JSON.parse(JSON.stringify(SEED_STATE)) as DemoState;

export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const profileUrl = (mano: Mano) => `https://manos.demo/${mano.id}`;

const compactMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export const rateLabel = (perMinuteRate: number, maxPerHand: number) =>
  `${Math.round(perMinuteRate * 100)}¢/min · ${compactMoney(maxPerHand)} max`;

export const findMano = (state: DemoState, id: string) => state.manos.find((mano) => mano.id === id);

export const isKofiUrl = (value: string) => /^https:\/\/ko-fi\.com\/[a-z0-9_-]+\/?$/i.test(value.trim());
