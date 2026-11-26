import { useEffect, useId, type ReactNode } from "react";
import { Icon, type IconName } from "../Icons";

type ModalProps = {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
};

export function Modal({ title, eyebrow, onClose, children, wide = false }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal modal-open modal-middle" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={`modal-box ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</p>}
            <h2 id={titleId} className="font-serif text-2xl font-bold">{title}</h2>
          </div>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Close dialog" />
    </div>
  );
}

export function DemoPill({ children }: { children: ReactNode }) {
  return <span className="badge badge-outline badge-sm font-bold tracking-wide uppercase">{children}</span>;
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-box border border-dashed border-base-300 bg-base-100/60 px-6 py-9 text-center">
      <span className="inline-grid size-11 place-items-center rounded-box bg-primary/10 text-primary">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-3 font-serif text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-base-content/60">{children}</p>
    </div>
  );
}
