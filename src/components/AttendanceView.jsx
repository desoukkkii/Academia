import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { getInitials, formatLongDate, today, getAttendancePct } from "../utils";
import { useToast } from "./Toast";

function getPctClass(pct) {
  if (pct === null) return "";
  if (pct >= 80) return "text-[var(--color-success)]";
  if (pct >= 60) return "text-[var(--color-warning)]";
  return "text-[var(--color-danger)]";
}

function StudentAttendanceCard({ student, todayKey, onMark }) {
  const todayStatus = student.attendance[todayKey] || "";
  const pct = getAttendancePct(student);
  const pctStr = pct !== null ? `${pct}%` : "—";

  const borderClass = todayStatus === "present"
    ? "border-l-[3px] border-l-[var(--color-success)]"
    : todayStatus === "absent"
      ? "border-l-[3px] border-l-[var(--color-danger)]"
      : "";

  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] p-3 md:p-3.5 flex items-center gap-3 transition-all hover:border-[var(--color-border-light)] active:scale-[0.98] ${borderClass}`}
      style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}
    >
      <div className="w-10 h-10 md:w-[38px] md:h-[38px] rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center text-sm md:text-[13px] font-bold flex-shrink-0">
        {getInitials(student.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] md:text-[13px] font-medium truncate">{student.name}</div>
        <div className="text-[11px] md:text-[11px] text-[var(--color-text-muted)]">
          Gr {student.grade} · <span className={`font-semibold ${getPctClass(pct)}`}>{pctStr}</span>
        </div>
      </div>
      <div className="flex rounded-xl border border-[var(--color-border)] overflow-hidden flex-shrink-0">
        <button
          onClick={() => onMark(student.id, "present")}
          className={`px-4 md:px-3.5 py-2.5 md:py-2 text-[13px] md:text-[12px] font-bold font-mono transition-all active:scale-95 ${
            todayStatus === "present"
              ? "bg-[rgba(52,211,153,0.15)] text-[var(--color-success)]"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]"
          }`}
        >
          P
        </button>
        <button
          onClick={() => onMark(student.id, "absent")}
          className={`px-4 md:px-3.5 py-2.5 md:py-2 text-[13px] md:text-[12px] font-bold font-mono transition-all active:scale-95 ${
            todayStatus === "absent"
              ? "bg-[rgba(248,113,113,0.15)] text-[var(--color-danger)]"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]"
          }`}
        >
          A
        </button>
      </div>
    </div>
  );
}

export default function AttendanceView() {
  const { students, markAttendance, markAllPresent, markAllAbsent } = useApp();
  const showToast = useToast();
  const todayKey = today();

  const { present, absent, unmarked } = useMemo(() => {
    let p = 0, a = 0, u = 0;
    students.forEach((s) => {
      const status = s.attendance[todayKey];
      if (status === "present") p++;
      else if (status === "absent") a++;
      else u++;
    });
    return { present: p, absent: a, unmarked: u };
  }, [students, todayKey]);

  const handleMark = (id, status) => {
    markAttendance(id, status);
    showToast("Attendance recorded.", "info");
  };

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease] max-md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4 gap-2 flex-wrap">
        <span className="text-[13px] md:text-sm text-[var(--color-text-muted)] font-medium">{formatLongDate(new Date())}</span>
        <div className="flex gap-1.5">
          <button
            onClick={markAllPresent}
            className="inline-flex items-center gap-1.5 px-3.5 md:px-4 py-2 md:py-2 rounded-full text-[11px] md:text-xs font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all active:scale-95"
          >
            <i className="fa-solid fa-check text-xs" /> All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="inline-flex items-center gap-1.5 px-3.5 md:px-4 py-2 md:py-2 rounded-full text-[11px] md:text-xs font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all active:scale-95"
          >
            <i className="fa-solid fa-xmark text-xs" /> All Absent
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 text-[12px] md:text-[13px] -mt-1 mb-3 md:mb-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span className="text-[var(--color-success)] font-semibold">{present} present</span>
        </span>
        <span className="text-[var(--color-border-light)]">·</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
          <span className="text-[var(--color-danger)] font-semibold">{absent} absent</span>
        </span>
        <span className="text-[var(--color-border-light)]">·</span>
        <span className="text-[var(--color-text-dim)]">{unmarked} unmarked</span>
      </div>

      {/* Student list */}
      <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3">
        {students.length ? (
          students.map((s) => (
            <StudentAttendanceCard
              key={s.id}
              student={s}
              todayKey={todayKey}
              onMark={handleMark}
            />
          ))
        ) : (
          <p className="text-[var(--color-text-dim)] text-sm text-center py-12 col-span-full">No students yet.</p>
        )}
      </div>
    </div>
  );
}
