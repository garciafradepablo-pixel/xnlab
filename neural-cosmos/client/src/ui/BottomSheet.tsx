/**
 * Mobile-first secondary surface. On phones it's a bottom-sheet that slides up
 * and never covers the whole canvas; on desktop (≥1024px) the same component
 * docks as a right-hand panel. CSS does the responsive switch.
 */
import { type ReactNode, useEffect } from "react";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`sheet-backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <section
        className={`sheet ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="sheet-head">
          <span className="sheet-grab" aria-hidden />
          <h2 className="display sheet-title">{title}</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer && <footer className="sheet-foot">{footer}</footer>}
      </section>
    </>
  );
}
