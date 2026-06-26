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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-sm w-full max-w-[360px] rounded-2xl border border-[var(--color-border)] p-7 text-center"
        style={{ background: "var(--color-bg-card)" }}>
        <div className="text-[36px] text-[var(--color-warning)] mb-3.5">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h3 className="text-[17px] font-bold mb-1.5">Delete Student?</h3>
        <p className="text-[13px] text-[var(--color-text-muted)] mb-5 leading-relaxed">
          Remove {s.name} ({s.studentId})? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-center">
          <button onClick={onClose} className="btn-ghost btn-sm inline-flex items-center gap-1.5 px-5 py-[9px] text-[13px] font-medium rounded-full border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all">Cancel</button>
          <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-5 py-[9px] text-[13px] font-medium rounded-full bg-[var(--color-danger)] text-white hover:opacity-90 transition-all">
            <i className="fa-solid fa-trash-can" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
