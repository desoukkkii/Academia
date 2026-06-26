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
    <div className="animate-[fadeSlideIn_0.3s_ease]">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <span className="text-sm text-[var(--color-text-muted)] font-medium">{formatLongDate(new Date())}</span>
        <div className="flex gap-1.5">
          <button onClick={markAllPresent} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all">
            <i className="fa-solid fa-check" /> All Present
          </button>
          <button onClick={markAllAbsent} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all">
            <i className="fa-solid fa-xmark" /> All Absent
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] -mt-2 mb-4">
        <span className="text-[var(--color-success)] font-medium">{present} present</span>
        <span className="text-[var(--color-border-light)]">·</span>
        <span className="text-[var(--color-danger)] font-medium">{absent} absent</span>
        <span className="text-[var(--color-border-light)]">·</span>
        <span className="text-[var(--color-text-dim)] text-[13px]">{students.length - present - absent} unmarked</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-sm:gap-2">
        {students.length ? students.map((s) => {
          const todayStatus = s.attendance[todayKey] || "";
          const pct = getAttendancePct(s);
          const pctStr = pct !== null ? `${pct}% overall` : "No records";
          const pctCls = pct === null ? "" : pct >= 80 ? "text-[var(--color-success)]" : pct >= 60 ? "text-[var(--color-warning)]" : "text-[var(--color-danger)]";

          return (
            <div key={s.id}
              className={`rounded-[var(--radius-card)] border border-[var(--color-border)] p-3.5 flex items-center gap-3 transition-all hover:border-[var(--color-border-light)] ${
                todayStatus === "present" ? "border-l-[3px] border-l-[var(--color-success)]" :
                todayStatus === "absent" ? "border-l-[3px] border-l-[var(--color-danger)]" : ""
              }`}
              style={{ background: "var(--color-bg-card)" }}>
              <div className="w-[38px] h-[38px] rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center text-[13px] font-bold flex-shrink-0">
                {getInitials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{esc(s.name)}</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">
                  Grade {s.grade} · <span className={`font-semibold text-[11px] ${pctCls}`}>{pctStr}</span>
                </div>
              </div>
              <div className="flex rounded-full border border-[var(--color-border)] overflow-hidden flex-shrink-0">
                <button onClick={() => handleMark(s.id, "present")}
                  className={`px-2.5 py-1 text-[11px] font-semibold font-mono transition-all ${
                    todayStatus === "present"
                      ? "bg-[rgba(52,211,153,0.15)] text-[var(--color-success)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]"
                  }`}>P</button>
                <button onClick={() => handleMark(s.id, "absent")}
                  className={`px-2.5 py-1 text-[11px] font-semibold font-mono transition-all ${
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
