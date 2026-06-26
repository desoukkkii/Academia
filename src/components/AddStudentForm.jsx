import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "./Toast";
import { esc } from "../utils";

export default function AddStudentForm() {
  const { students, editingId, setEditing, addStudent, updateStudent, formError, clearFormError, setView } = useApp();
  const showToast = useToast();

  const editingStudent = editingId ? students.find((s) => s.id === editingId) : null;
  const isEdit = !!editingStudent;

  const [form, setForm] = useState({
    name: "", studentId: "", email: "", grade: "", gpa: "", enrollDate: "",
  });

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
      setForm({ name: "", studentId: "", email: "", grade: "", gpa: "", enrollDate: "" });
    }
    clearFormError();
  }, [editingId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id.replace("f", "").toLowerCase()]: e.target.value }));
  };

  // Map field IDs to form state keys
  const fieldMap = {
    fName: "name", fId: "studentId", fEmail: "email", fGrade: "grade", fGpa: "gpa", fDate: "enrollDate",
  };
  const handleFieldChange = (e) => {
    const key = fieldMap[e.target.id];
    if (key) setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      studentId: form.studentId,
      email: form.email,
      grade: form.grade,
      gpa: form.gpa,
      enrollDate: form.enrollDate,
    };

    if (isEdit) {
      updateStudent({ ...data, id: editingId });
    } else {
      addStudent(data);
    }
  };

  useEffect(() => {
    if (formError === null && editingId !== null && !students.find((s) => s.id === editingId)) {
      showToast(`Student ${isEdit ? "updated" : "added"} successfully!`, "success");
    }
  }, [students, editingId]);

  useEffect(() => {
    if (formError === null && !editingId && !isEdit) {
      // After add, check if form was submitted and redirected
    }
  }, [editingId]);

  const cancelEdit = () => {
    setEditing(null);
    setView("students");
  };

  const fieldError = (field) => {
    if (formError && formError.field === field) return formError.error;
    return "";
  };

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease]">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-7 max-w-[660px]"
        style={{ background: "var(--color-bg-card)" }}>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-user-plus"} text-[var(--color-primary-light)]`} />
          {isEdit ? "Edit Student" : "Add Student"}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            <FormGroup label="Full Name" required id="fName" value={form.name} onChange={handleFieldChange} error={fieldError("name")} placeholder="Emma Watson" />
            <FormGroup label="Student ID" required id="fId" value={form.studentId} onChange={handleFieldChange} error={fieldError("studentId")} placeholder="STU-001" />
            <FormGroup label="Email" required id="fEmail" type="email" value={form.email} onChange={handleFieldChange} error={fieldError("email")} placeholder="emma@school.edu" />
            <FormSelect label="Grade Level" required id="fGrade" value={form.grade} onChange={handleFieldChange} error={fieldError("grade")} />
            <FormGroup label="GPA (0.0–4.0)" required id="fGpa" type="number" value={form.gpa} onChange={handleFieldChange} error={fieldError("gpa")} placeholder="3.50" step="0.01" min="0" max="4" />
            <FormGroup label="Enrollment Date" required id="fDate" type="date" value={form.enrollDate} onChange={handleFieldChange} error={fieldError("enrollDate")} />
          </div>
          <div className="mt-6 flex gap-2.5 justify-end">
            {isEdit && (
              <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1.5 px-5 py-[9px] rounded-full text-[13px] font-medium border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all">
                Cancel
              </button>
            )}
            <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-[9px] rounded-full text-[13px] font-medium text-white transition-all hover:shadow-[0_4px_20px_var(--color-primary-glow)] hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "var(--color-primary)" }}>
              <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-plus"}`} />
              {isEdit ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormGroup({ label, required, id, type = "text", value, onChange, error, placeholder, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-text-muted)] tracking-[0.2px]">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-[var(--color-bg-elevated)] border ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"} rounded-[var(--radius-sm)] px-3 py-[9px] text-[13px] outline-none transition-all w-full focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)]`}
        {...rest}
      />
      <span className="text-[11px] text-[var(--color-danger)] min-h-[15px]">{error}</span>
    </div>
  );
}

function FormSelect({ label, required, id, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-text-muted)] tracking-[0.2px]">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`bg-[var(--color-bg-elevated)] border ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"} rounded-[var(--radius-sm)] px-3 py-[9px] text-[13px] outline-none transition-all w-full appearance-none cursor-pointer focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)]`}>
        <option value="">Select grade…</option>
        {[9, 10, 11, 12].map((g) => (
          <option key={g} value={g}>Grade {g}</option>
        ))}
      </select>
      <span className="text-[11px] text-[var(--color-danger)] min-h-[15px]">{error}</span>
    </div>
  );
}
