import { useApp } from "../context/AppContext";
import { getInitials, dateStr } from "../utils";

export default function StudentDetailModal({ studentId, onClose }) {
  const { students, getAttendancePct, getGpaTier } = useApp();
  const s = students.find((st) => st.id === studentId);
  if (!s) return null;

  const pct = getAttendancePct(s);
  const daysRecorded = Object.keys(s.attendance).length;
  const enrollDate = s.enrollDate ? dateStr(s.enrollDate) : "—";
  const gpaTier = getGpaTier(s.gpa);
  const gpaColor = gpaTier === "high" ? "var(--color-success)" : gpaTier === "low" ? "var(--color-danger)" : "var(--color-warning)";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[1000] p-0 sm:p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-[480px] rounded-t-2xl sm:rounded-2xl border border-[var(--color-border)] p-7 max-sm:px-4 max-sm:py-4 relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-[fadeSlideUp_0.25s_ease]"
        style={{ background: "var(--color-bg-card)" }}>
        {/* Drag handle for mobile bottom sheet */}
        <div className="sm:hidden flex justify-center pb-2 -mt-1">
          <div className="w-9 h-1 rounded-full bg-[var(--color-border-light)]" />
        </div>
        <button onClick={onClose} className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[var(--color-surface-1)] text-[var(--color-text-muted)] flex items-center justify-center text-sm hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all">
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="flex items-center gap-3.5 pb-[18px] mb-5 border-b border-[var(--color-border)]">
          <div className="w-[50px] h-[50px] rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary-light)] text-lg font-extrabold flex items-center justify-center flex-shrink-0">
            {getInitials(s.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg max-sm:text-base font-bold truncate">{s.name}</h2>
            <span className="text-xs text-[var(--color-text-muted)] font-mono">{s.studentId}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5">
          <DetailItem label="Email" value={s.email} />
          <DetailItem label="Grade Level" value={`Grade ${s.grade}`} />
          <DetailItem label="GPA" value={s.gpa.toFixed(2)} valueColor={gpaColor} />
          <DetailItem label="Enrolled" value={enrollDate} />
          <DetailItem label="Attendance" value={pct !== null ? `${pct}%` : "No records"} />
          <DetailItem label="Days Recorded" value={String(daysRecorded)} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, valueColor }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-[0.5px]">{label}</span>
      <span className="text-sm max-sm:text-[13px] font-medium" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  );
}