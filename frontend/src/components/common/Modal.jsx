import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Accessible modal dialog with Escape handling and a simple keyboard focus loop. */
export default function Modal({ open, onClose, title, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const initialTarget = dialog?.querySelector('input, select, textarea, button:not([disabled])');
    initialTarget?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab' || !dialog) return;
      const targets = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!targets.length) return;
      const first = targets[0]; const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) return null;
  return createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCloseRef.current(); }}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800"><h2 id={titleId} className="font-semibold">{title}</h2><button type="button" onClick={() => onCloseRef.current()} aria-label="Close dialog" className="rounded p-1 text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"><X size={19} /></button></header>
      <div className="p-6">{children}</div>
    </section>
  </div>, document.body);
}
