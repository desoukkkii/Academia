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
    <nav
      className="fixed bottom-0 left-0 right-0 z-[300] md:hidden flex items-stretch border-t border-[var(--color-border)]"
      style={{
        background: "color-mix(in oklab, var(--color-bg-elevated) 92%, transparent)",
        backdropFilter: "blur(30px) saturate(180%)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const active = view === tab.view;
        return (
          <button
            key={tab.view}
            onClick={() => setView(tab.view)}
            className="flex flex-col items-center justify-center flex-1 py-1.5 relative transition-all duration-200 active:scale-95"
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary-glow)]" />
            )}
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                active ? "bg-[var(--color-primary-glow)] scale-105" : ""
              }`}
            >
              <i
                className={`fa-solid ${tab.icon} text-lg transition-all duration-300 ${
                  active
                    ? "text-[var(--color-primary-light)] drop-shadow-[0_0_8px_var(--color-primary-glow)]"
                    : "text-[var(--color-text-dim)]"
                }`}
              />
            </div>
            <span
              className={`text-[9px] leading-tight mt-0.5 transition-all duration-300 ${
                active
                  ? "text-[var(--color-primary-light)] font-semibold"
                  : "text-[var(--color-text-dim)]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}