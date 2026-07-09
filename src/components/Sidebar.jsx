import { useCallback } from "react";
import { useApp } from "../context/AppContext";

const NAV_ITEMS = [
  { view: "dashboard", icon: "fa-chart-pie", label: "Dashboard" },
  { view: "students", icon: "fa-users", label: "Students" },
  { view: "attendance", icon: "fa-calendar-check", label: "Attendance" },
  { view: "add", icon: "fa-user-plus", label: "Add Student" },
];

export default function Sidebar() {
  const { view, setView, handleExportCSV, theme, toggleTheme } = useApp();

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-200 w-[232px] flex flex-col bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] shadow-[4px_0_32px_rgba(0,0,0,0.5)]"
      style={{ background: "linear-gradient(180deg, var(--color-bg-elevated), var(--color-bg))" }}
    >
      <div className="flex items-center gap-2.5 px-4 pb-3.5 pt-[18px] border-b border-[var(--color-border)]">
        <div className="w-[34px] h-[34px] rounded-[var(--radius-xs)] flex items-center justify-center text-base text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
          <i className="fa-solid fa-atom" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight">Academia</div>
          <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block -mt-0.5">Student Intelligence</div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-[13.5px] font-normal transition-all duration-[0.22s] relative ${
              view === item.view
                ? "text-[var(--color-primary-light)] font-medium"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-1)]"
            }`}
          >
            {view === item.view && (
              <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-sm"
                style={{ background: "linear-gradient(180deg, var(--color-primary), var(--color-secondary))", boxShadow: "0 0 12px var(--color-primary-glow)" }} />
            )}
            <i className={`fa-solid ${item.icon} w-[18px] text-center text-[15px] flex-shrink-0`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-[var(--color-border)] flex flex-col gap-0.5">
        <button onClick={toggleTheme} className="flex items-center gap-2.5 px-3 py-[9px] rounded-[var(--radius-sm)] text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-1)] transition-all">
          <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} w-[18px] text-center flex-shrink-0`} />
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button onClick={handleExportCSV} className="flex items-center gap-2.5 px-3 py-[9px] rounded-[var(--radius-sm)] text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-1)] transition-all">
          <i className="fa-solid fa-file-arrow-down w-[18px] text-center flex-shrink-0" />
          <span>Export CSV</span>
        </button>
        <ImportButton />
      </div>
    </aside>
  );
}

function ImportButton() {
  const { handleImportCSV, addActivity } = useApp();

  const handleChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = handleImportCSV(ev.target.result);
      addActivity("info", `Imported ${result.added} students`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [handleImportCSV, addActivity]);

  return (
    <label className="flex items-center gap-2.5 px-3 py-[9px] rounded-[var(--radius-sm)] text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-1)] transition-all cursor-pointer">
      <i className="fa-solid fa-file-arrow-up w-[18px] text-center flex-shrink-0" />
      <span>Import CSV</span>
      <input type="file" accept=".csv" onChange={handleChange} className="hidden" />
    </label>
  );
}
