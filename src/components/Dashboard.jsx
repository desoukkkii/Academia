import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { getInitials, esc } from "../utils";

export default function Dashboard({ onStudentClick }) {
  const { stats, students, activity } = useApp();
  const recent = students.slice(0, 5);

  return (
    <div className="animate-[fadeSlideIn_0.4s_cubic-bezier(0.32,0.72,0,1)] max-md:pb-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 mb-4 md:mb-5">
        <StatCard icon="fa-users" accent="primary" label="Students" value={String(stats.total)} />
        <StatCard icon="fa-star" accent="secondary" label="Avg GPA" value={stats.avgGpa.toFixed(2)} />
        <StatCard icon="fa-trophy" accent="accent" label="Top GPA" value={stats.topGpa !== null ? stats.topGpa.toFixed(2) : "—"} />
        <StatCard icon="fa-calendar-check" accent="warning" label="Attendance" value={stats.avgAtt !== null ? `${stats.avgAtt}%` : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3 md:gap-3.5">
        {/* Students by Grade */}
        <div
          className="rounded-2xl border border-[var(--color-border)] p-4 md:p-5"
          style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}
        >
          <h3 className="text-[13px] md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-column text-[var(--color-primary-light)] text-sm" />
            Students by Grade
          </h3>
          <div className="flex flex-col gap-2.5 md:gap-3">
            {[9, 10, 11, 12].map((g) => {
              const maxCount = Math.max(...Object.values(stats.byGrade), 1);
              const pct = Math.max((stats.byGrade[g] / maxCount) * 100, 0);
              return (
                <div key={g} className="flex items-center gap-2 md:gap-2.5">
                  <span className="text-[11px] md:text-xs font-medium text-[var(--color-text-muted)] w-[48px] md:w-[55px] flex-shrink-0">
                    Gr {g}
                  </span>
                  <div className="flex-1 bg-[var(--color-surface-2)] rounded-full h-2 md:h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-[0.6s]"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))" }}
                    />
                  </div>
                  <span className="text-[11px] md:text-xs font-semibold text-[var(--color-text-muted)] w-5 text-right flex-shrink-0 tabular-nums">
                    {stats.byGrade[g]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Added */}
        <div
          className="rounded-2xl border border-[var(--color-border)] p-4 md:p-5"
          style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}
        >
          <h3 className="text-[13px] md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-[var(--color-primary-light)] text-sm" />
            Recent
          </h3>
          {recent.length ? (
            <ul className="flex flex-col gap-1.5 md:gap-2">
              {recent.map((st) => (
                <li
                  key={st.id}
                  onClick={() => onStudentClick(st.id)}
                  className="flex items-center gap-2.5 md:gap-3 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl cursor-pointer transition-all hover:bg-[var(--color-bg-hover)] active:scale-[0.98]"
                  style={{ background: "var(--color-surface-1)" }}
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary-light)] text-[10px] md:text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {getInitials(st.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] md:text-[13px] font-medium truncate">{esc(st.name)}</div>
                    <div className="text-[10px] md:text-[11px] text-[var(--color-text-muted)]">Grade {st.grade}</div>
                  </div>
                  <span className="font-bold text-[12px] md:text-[13px] text-[var(--color-secondary)] flex-shrink-0 tabular-nums">{st.gpa.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[var(--color-text-dim)] py-3">No students yet.</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="mt-3 md:mt-5 rounded-2xl border border-[var(--color-border)] p-4 md:p-5"
        style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}
      >
        <h3 className="text-[13px] md:text-sm font-semibold mb-3 md:mb-3.5 flex items-center gap-2">
          <i className="fa-solid fa-bolt text-[var(--color-accent)] text-sm" />
          Activity
        </h3>
        <div className="flex flex-col gap-1.5 md:gap-2.5 max-h-[180px] md:max-h-[200px] overflow-y-auto">
          {activity.length ? (
            activity.slice(0, 10).map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2 md:gap-2.5 py-1.5 md:py-2 border-b border-[var(--color-border)] last:border-b-0 text-[12px] md:text-[13px]"
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.type === "success"
                      ? "bg-[var(--color-success)]"
                      : a.type === "error"
                        ? "bg-[var(--color-danger)]"
                        : a.type === "warning"
                          ? "bg-[var(--color-warning)]"
                          : "bg-[var(--color-info)]"
                  }`}
                />
                <span className="text-[var(--color-text)]">{esc(a.text)}</span>
                <span className="ml-auto text-[10px] md:text-[11px] text-[var(--color-text-dim)] whitespace-nowrap flex-shrink-0">{a.time}</span>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-[var(--color-text-dim)] py-2">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, accent, label, value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) {
      setDisplayValue(value);
      return;
    }
    startRef.current = null;
    const isFloat = value.includes(".");
    const duration = 500;

    function tick(now) {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = numValue * eased;
      setDisplayValue(isFloat ? current.toFixed(2) : Math.round(current));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const iconBg = {
    primary: { bg: "var(--color-primary-glow)", color: "var(--color-primary-light)" },
    secondary: { bg: "var(--color-secondary-glow)", color: "var(--color-secondary)" },
    accent: { bg: "var(--color-accent-glow)", color: "var(--color-accent)" },
    warning: { bg: "rgba(251, 191, 36, 0.15)", color: "var(--color-warning)" },
  }[accent];

  return (
    <div
      className="rounded-2xl border border-[var(--color-border)] p-3 md:p-[18px] flex items-center gap-3 md:gap-3.5 relative overflow-hidden transition-all duration-[0.22s] md:hover:-translate-y-0.5 md:hover:shadow-[var(--shadow-lg)] md:hover:border-[var(--color-border-light)] cursor-default active:scale-[0.97]"
      style={{
        background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="absolute inset-0 rounded-[inherit] p-[1px] pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08), transparent 40%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div
        className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-base md:text-lg flex-shrink-0"
        style={{ background: iconBg.bg, color: iconBg.color }}
      >
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <span className="block text-[10px] md:text-[11px] text-[var(--color-text-muted)] uppercase tracking-[0.5px] mb-0.5">{label}</span>
        <span className="block text-[20px] md:text-[26px] font-extrabold leading-[1.1] tracking-tight tabular-nums">{displayValue}</span>
      </div>
    </div>
  );
}