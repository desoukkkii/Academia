import { useApp } from "../context/AppContext";

const TABS = [
  { view: "dashboard", icon: "fa-chart-pie", label: "Dashboard" },
  { view: "students", icon: "fa-users", label: "Students" },
  { view: "attendance", icon: "fa-calendar-check", label: "Attendance" },
  { view: "add", icon: "fa-user-plus", label: "Add" },
];

export default function BottomNav() {
  const { view, setView } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[300] md:hidden flex items-center justify-around border-t border-[var(--color-border)] px-2 pb-[env(safe-area-inset-bottom,0px)]"
      style={{
        background: "color-mix(in oklab, var(--color-bg-elevated) 85%, transparent)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}>
      {TABS.map((tab) => {
        const active = view === tab.view;
        return (
          <button
            key={tab.view}
            onClick={() => setView(tab.view)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              active
                ? "text-[var(--color-primary-light)]"
                : "text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              active
                ? "bg-[var(--color-primary-glow)]"
                : ""
            }`}>
              <i className={`fa-solid ${tab.icon} text-lg ${active ? "drop-shadow-[0_0_8px_var(--color-primary-glow)]" : ""}`} />
            </div>
            <span className={`text-[10px] font-medium leading-tight ${active ? "font-semibold" : ""}`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}