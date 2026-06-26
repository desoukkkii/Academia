import { useState, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

const ICONS = {
  success: "fa-circle-check",
  error: "fa-circle-xmark",
  info: "fa-circle-info",
  warning: "fa-triangle-exclamation",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext value={showToast}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-border)] animate-[toastSlideIn_0.3s_ease] max-w-[300px] ${
              t.type === "success" ? "border-l-[3px] border-l-[var(--color-success)]" :
              t.type === "error" ? "border-l-[3px] border-l-[var(--color-danger)]" :
              "border-l-[3px] border-l-[var(--color-info)]"
            }`}
            style={{ background: "var(--color-bg-card)", boxShadow: "var(--shadow-lg)" }}>
            <i className={`fa-solid ${ICONS[t.type] || ICONS.info} text-sm flex-shrink-0 ${
              t.type === "success" ? "text-[var(--color-success)]" :
              t.type === "error" ? "text-[var(--color-danger)]" :
              "text-[var(--color-info)]"
            }`} />
            <span>{t.msg}</span>
          </div>
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
