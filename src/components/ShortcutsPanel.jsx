export default function ShortcutsPanel({ open, onClose }) {
  if (!open) return null;

  const shortcuts = [
    { label: "Dashboard", key: "1" },
    { label: "Students", key: "2" },
    { label: "Attendance", key: "3" },
    { label: "Add Student", key: "N" },
    { label: "Search", key: "/" },
    { label: "Toggle Theme", key: "T" },
    { label: "Close Modal", key: "Esc" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[1000]" onClick={onClose} />
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1001] w-[90%] max-w-[400px] rounded-[var(--radius-card)] border border-[var(--color-border)] p-5 animate-[fadeSlideUp_0.2s_ease]"
        style={{ background: "var(--color-bg-card)", boxShadow: "var(--shadow-lg)" }}>
        <h3 className="text-sm font-semibold mb-3.5">Keyboard Shortcuts</h3>
        {shortcuts.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-1.5 text-[13px]">
            <span>{s.label}</span>
            <kbd className="font-mono text-[11px] bg-[var(--color-surface-2)] px-2 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-muted)]">{s.key}</kbd>
          </div>
        ))}
      </div>
    </>
  );
}
