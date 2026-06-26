import { useApp } from "../context/AppContext";
import { useToast } from "./Toast";

export default function ConfirmModal({ studentId, onClose }) {
  const { students, deleteStudent } = useApp();
  const showToast = useToast();
  const s = students.find((st) => st.id === studentId);

  if (!s) return null;

  const handleDelete = () => {
    deleteStudent(s.id);
    showToast("Student removed.", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[1000] p-0 sm:p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-[360px] rounded-t-2xl sm:rounded-2xl border border-[var(--color-border)] p-7 max-sm:px-5 max-sm:py-4 text-center animate-[fadeSlideUp_0.25s_ease]"
        style={{ background: "var(--color-bg-card)" }}>
        {/* Drag handle for mobile bottom sheet */}
        <div className="sm:hidden flex justify-center pb-3 -mt-1">
          <div className="w-9 h-1 rounded-full bg-[var(--color-border-light)]" />
        </div>
        <div className="text-[36px] max-sm:text-[32px] text-[var(--color-warning)] mb-3.5">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h3 className="text-[17px] max-sm:text-base font-bold mb-1.5">Delete Student?</h3>
        <p className="text-[13px] max-sm:text-[12px] text-[var(--color-text-muted)] mb-5 leading-relaxed">
          Remove {s.name} ({s.studentId})? This cannot be undone.
        </p>
        <div className="flex gap-2.5 justify-center">
          <button onClick={onClose} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-[11px] max-sm:py-3 text-[13px] font-medium rounded-full border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all active:scale-95">
            Cancel
          </button>
          <button onClick={handleDelete} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-[11px] max-sm:py-3 text-[13px] font-medium rounded-full bg-[var(--color-danger)] text-white hover:opacity-90 transition-all active:scale-95">
            <i className="fa-solid fa-trash-can" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}