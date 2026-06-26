import { useApp } from "../context/AppContext";
import { getInitials, esc, formatLongDate, today } from "../utils";
import { useToast } from "./Toast";

export default function AttendanceView() {
  const { students, markAttendance, markAllPresent, markAllAbsent, getAttendancePct } = useApp();
  const showToast = useToast();
  const todayKey = today();
  const present = students.filter((s) => s.attendance[todayKey] === "present").length;
  const absent = students.filter((s) => s.attendance[todayKey] === "absent").length;

  const handleMark = (id, status) => {
    markAttendance(id, status);
    showToast("Attendance recorded.", "info");
  };

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease] max-md:pb-2">
      <div className="flex items-center justify-between mb-4 max-md:mb-3 gap-2 flex-wrap">
        <span className="text-sm max-md:text-[13px] text-[var(--color-text-muted)] font-medium">{formatLongDate(new Date())}</span>
        <div className="flex gap-1.5">
          <button onClick={markAllPresent} className="inline-flex items-center gap-1.5 px-3.5 max-md:px-3 py-1.5 max-md:py-2 rounded-full text-xs max-md:text-[12px] font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all active:scale-95">
            <i className="fa-solid fa-check" /> All Present
          </button>
          <button onClick={markAllAbsent} className="inline-flex items-center gap-1.5 px-3.5 max-md:px-3 py-1.5 max-md:py-2 rounded-full text-xs max-md:text-[12px] font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all active:scale-95">
            <i className="fa-solid fa-xmark" /> All Absent
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] max-md:text-[12px] -mt-2 mb-4 max-md:mb-3 flex-wrap">
        <span className="text-[var(--color-success)] font-medium">{present} present</span>
        <span className="text-[var(--color-border-light)]">·</span>
        <span className="text-[var(--color-danger)] font-medium">{absent} absent</span>
        <span className="text-[var(--color-border-light)]">·</span>
        <span className="text-[var(--color-text-dim)]">{students.length - present - absent} unmarked</span>
      </div>

      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-md:gap-2.5">
        {students.length ? students.map((s) => {
          const todayStatus = s.attendance[todayKey] || "";
          const pct = getAttendancePct(s);
          const pctStr = pct !== null ? `${pct}% overall` : "No records";
          const pctCls = pct === null ? "" : pct >= 80 ? "text-[var(--color-success)]" : pct >= 60 ? "text-[var(--color-warning)]" : "text-[var(--color-danger)]";

          return (
            <div key={s.id}
              className={`rounded-[var(--radius-card)] border border-[var(--color-border)] p-3.5 max-md:p-3 flex items-center gap-3 max-md:gap-2.5 transition-all hover:border-[var(--color-border-light)] active:scale-[0.98] ${
                todayStatus === "present" ? "border-l-[3px] border-l-[var(--color-success)]" :
                todayStatus === "absent" ? "border-l-[3px] border-l-[var(--color-danger)]" : ""
              }`}
              style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}>
              <div className="w-[38px] h-[38px] max-md:w-9 max-md:h-9 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center text-[13px] max-md:text-[12px] font-bold flex-shrink-0">
                {getInitials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] max-md:text-[12px] font-medium truncate">{esc(s.name)}</div>
                <div className="text-[11px] max-md:text-[10px] text-[var(--color-text-muted)]">
                  Grade {s.grade} · <span className={`font-semibold ${pctCls}`}>{pctStr}</span>
                </div>
              </div>
              <div className="flex rounded-full border border-[var(--color-border)] overflow-hidden flex-shrink-0">
                <button onClick={() => handleMark(s.id, "present")}
                  className={`px-4 max-md:px-3.5 py-2 max-md:py-1.5 text-[12px] max-md:text-[11px] font-bold font-mono transition-all active:scale-95 ${
                    todayStatus === "present"
                      ? "bg-[rgba(52,211,153,0.15)] text-[var(--color-success)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]"
                  }`}>P</button>
                <button onClick={() => handleMark(s.id, "absent")}
                  className={`px-4 max-md:px-3.5 py-2 max-md:py-1.5 text-[12px] max-md:text-[11px] font-bold font-mono transition-all active:scale-95 ${
                    todayStatus === "absent"
                      ? "bg-[rgba(248,113,113,0.15)] text-[var(--color-danger)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]"
                  }`}>A</button>
              </div>
            </div>
          );
        }) : (
          <p className="text-[var(--color-text-dim)] text-sm text-center py-12 col-span-full">No students yet.</p>
        )}
      </div>
    </div>
  );
}