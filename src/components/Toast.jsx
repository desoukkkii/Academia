import { useState, useCallback, useRef, createContext, useContext } from "react";

const ToastContext = createContext(null);

const ICONS = {
  success: "fa-circle-check",
  error: "fa-circle-xmark",
  info: "fa-circle-info",
  warning: "fa-triangle-exclamation",
};

let toastIdCounter = 0;

function ToastItem({ toast }) {
  const iconColor =
    toast.type === "success"
      ? "text-[var(--color-success)]"
      : toast.type === "error"
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-info)]";

  const borderClass =
    toast.type === "success"
      ? "border-l-[var(--color-success)]"
      : toast.type === "error"
        ? "border-l-[var(--color-danger)]"
        : "border-l-[var(--color-info)]";

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-border)] animate-[toastSlideIn_0.3s_ease] max-w-[300px] border-l-[3px] ${borderClass}`}
      style={{ background: "var(--color-bg-card)", boxShadow: "var(--shadow-lg)" }}
    >
      <i className={`fa-solid ${ICONS[toast.type] || ICONS.info} text-sm flex-shrink-0 ${iconColor}`} />
      <span>{toast.msg}</span>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((msg, type = "info") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, msg, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  return (
    <ToastContext value={showToast}>
      {children}
      <div className="fixed bottom-5 right-5 max-md:bottom-[76px] max-sm:right-3 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
