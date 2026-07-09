import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "./Toast";

const INITIAL_FORM = {
  name: "", studentId: "", email: "", grade: "", gpa: "", enrollDate: "",
};

export default function AddStudentForm() {
  const { students, editingId, addStudent, updateStudent, formError, clearFormError, setView } = useApp();
  const showToast = useToast();

  const editingStudent = editingId ? students.find((s) => s.id === editingId) : null;
  const isEdit = !!editingStudent;

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (editingStudent) {
      setForm({
        name: editingStudent.name,
        studentId: editingStudent.studentId,
        email: editingStudent.email,
        grade: String(editingStudent.grade),
        gpa: String(editingStudent.gpa),
        enrollDate: editingStudent.enrollDate,
      });
    } else {
      setForm(INITIAL_FORM);
    }
    clearFormError();
  }, [editingId]);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateStudent({ ...form, id: editingId, grade: Number(form.grade), gpa: form.gpa });
    } else {
      addStudent({ ...form, grade: Number(form.grade), gpa: form.gpa });
    }
  };

  const cancelEdit = () => {
    setView("students");
  };

  const fieldError = (field) => {
    return formError?.field === field ? formError.error : "";
  };

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease] max-md:pb-4">
      <div
        className="rounded-2xl border border-[var(--color-border)] p-5 md:p-7 max-w-[660px]"
        style={{ background: "var(--color-bg-card)" }}
      >
        <h2 className="text-base md:text-lg font-bold mb-5 md:mb-6 flex items-center gap-2">
          <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-user-plus"} text-[var(--color-primary-light)]`} />
          {isEdit ? "Edit Student" : "Add Student"}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-[18px]">
            <FormGroup label="Full Name" required value={form.name} onChange={setField("name")} error={fieldError("name")} placeholder="Emma Watson" />
            <FormGroup label="Student ID" required value={form.studentId} onChange={setField("studentId")} error={fieldError("studentId")} placeholder="STU-001" />
            <FormGroup label="Email" required type="email" value={form.email} onChange={setField("email")} error={fieldError("email")} placeholder="emma@school.edu" />
            <FormSelect label="Grade Level" required value={form.grade} onChange={setField("grade")} error={fieldError("grade")} />
            <FormGroup label="GPA (0.0–4.0)" required type="number" value={form.gpa} onChange={setField("gpa")} error={fieldError("gpa")} placeholder="3.50" step="0.01" min="0" max="4" />
            <FormGroup label="Enrollment Date" required type="date" value={form.enrollDate} onChange={setField("enrollDate")} error={fieldError("enrollDate")} />
          </div>
          <div className="mt-5 md:mt-6 flex gap-2.5 justify-end max-md:flex-col">
            {isEdit && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 md:py-[9px] rounded-xl text-[13px] font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all active:scale-95"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 md:py-[9px] rounded-xl text-[13px] font-medium text-white transition-all hover:shadow-[0_4px_20px_var(--color-primary-glow)] md:hover:-translate-y-0.5 active:scale-95"
              style={{ background: "var(--color-primary)" }}
            >
              <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-plus"}`} />
              {isEdit ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormGroup({ label, required, type = "text", value, onChange, error, placeholder, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={label.toLowerCase().replace(/\s+/g, "-")} className="text-[11px] md:text-xs font-medium text-[var(--color-text-muted)] tracking-[0.2px]">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <input
        id={label.toLowerCase().replace(/\s+/g, "-")}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-[var(--color-bg-elevated)] border ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"} rounded-xl px-3.5 py-[11px] md:py-[9px] text-[14px] md:text-[13px] outline-none transition-all w-full focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)]`}
        {...rest}
      />
      <span className="text-[11px] text-[var(--color-danger)] min-h-[16px]">{error}</span>
    </div>
  );
}

function FormSelect({ label, required, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={label.toLowerCase().replace(/\s+/g, "-")} className="text-[11px] md:text-xs font-medium text-[var(--color-text-muted)] tracking-[0.2px]">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <select
        id={label.toLowerCase().replace(/\s+/g, "-")}
        value={value}
        onChange={onChange}
        className={`bg-[var(--color-bg-elevated)] border ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"} rounded-xl px-3.5 py-[11px] md:py-[9px] text-[14px] md:text-[13px] outline-none transition-all w-full appearance-none cursor-pointer focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)]`}
      >
        <option value="">Select grade…</option>
        {[9, 10, 11, 12].map((g) => (
          <option key={g} value={g}>Grade {g}</option>
        ))}
      </select>
      <span className="text-[11px] text-[var(--color-danger)] min-h-[16px]">{error}</span>
    </div>
  );
}
