type IconName =
  | "hand"
  | "desk"
  | "user"
  | "plus"
  | "search"
  | "bell"
  | "copy"
  | "check"
  | "clock"
  | "printer"
  | "arrow"
  | "close"
  | "sparkle"
  | "sliders"
  | "heart"
  | "link"
  | "reset"
  | "chevron"
  | "coffee"
  | "monitor"
  | "volume"
  | "pen"
  | "camera"
  | "wrench"
  | "info"
  | "phone"
  | "receipt"
  | "send"
  | "shield"
  | "wifi"
  | "hat"
  | "scissors"
  | "qr";

const paths: Record<IconName, React.ReactNode> = {
  hand: <><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" /><path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V12" /><path d="M14 11V6a1.5 1.5 0 0 1 3 0v7" /><path d="M17 11a1.5 1.5 0 0 1 3 0v4.5a6.5 6.5 0 0 1-6.5 6.5h-1a6 6 0 0 1-4.7-2.3L4.6 16a1.6 1.6 0 0 1 2.3-2.2L8 15" /></>,
  desk: <><path d="M3 10h18" /><path d="M5 10v9M19 10v9" /><path d="M8 10V6h8v4" /><path d="M9 15h6" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  printer: <><path d="M7 8V3h10v5" /><rect x="4" y="8" width="16" height="9" rx="2" /><path d="M7 14h10v7H7zM17 11h.01" /></>,
  arrow: <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
  sliders: <><path d="M4 7h8M16 7h4M4 17h4M12 17h8" /><circle cx="14" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  heart: <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />,
  link: <><path d="m10 13 4-4" /><path d="M8 15 6.5 16.5a3.5 3.5 0 0 1-5-5L5 8a3.5 3.5 0 0 1 5 0" /><path d="m16 9 1.5-1.5a3.5 3.5 0 0 1 5 5L19 16a3.5 3.5 0 0 1-5 0" /></>,
  reset: <><path d="M3 10a9 9 0 1 1 2.6 8.4" /><path d="M3 4v6h6" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  coffee: <><path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" /><path d="M16 9h2a3 3 0 0 1 0 6h-2M7 2v3M11 2v3M15 2v3" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  volume: <><path d="m11 5-5 4H3v6h3l5 4V5Z" /><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" /></>,
  pen: <><path d="m15 4 5 5M4 20l4.5-1L20 7.5a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /></>,
  camera: <><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="4" /></>,
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.4 7.2 6.3 5.3a4 4 0 0 0 5 5L20 19a2.1 2.1 0 0 1-3 3l-8.7-8.7a4 4 0 0 1-5-5L5.6 11l3.6-3.6-1.7-1.7a4 4 0 0 0 5-5l-8.8 8.8a2.1 2.1 0 0 0 3 3l8.9-8.9" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 18h4" /></>,
  receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  wifi: <><path d="M2 8.5a15 15 0 0 1 20 0" /><path d="M5.5 12.5a10 10 0 0 1 13 0" /><path d="M9 16.5a5 5 0 0 1 6 0" /><path d="M12 20h.01" /></>,
  hat: <><path d="M3 20 12 4l9 16" /><path d="M6.5 14h11" /><path d="M3 20h18" /></>,
  scissors: <><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8.2 7.6 20 19M8.2 16.4 20 5" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h.01" /></>,
};

export type { IconName };

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
