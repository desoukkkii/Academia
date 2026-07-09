import { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import { loadStudents, saveStudents } from "../services/storage";
import { getSeedStudents } from "../data/seed";
import { uid, today, getAttendancePct, getGpaTier } from "../utils";

const AppContext = createContext(null);
const THEME_KEY = "quantio_theme";

function createStudent(data) {
  return {
    id: data.id || uid(),
    name: data.name.trim(),
    studentId: data.studentId.trim().toUpperCase(),
    email: data.email.trim().toLowerCase(),
    grade: Number(data.grade),
    gpa: parseFloat(Number(data.gpa).toFixed(2)),
    enrollDate: data.enrollDate,
    attendance: data.attendance || {},
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function getStats(students) {
  const total = students.length;
  const avgGpa = total ? students.reduce((s, st) => s + st.gpa, 0) / total : 0;
  const byGrade = { 9: 0, 10: 0, 11: 0, 12: 0 };
  students.forEach((s) => {
    byGrade[s.grade] = (byGrade[s.grade] || 0) + 1;
  });
  const topGpa = total ? Math.max(...students.map((s) => s.gpa)) : null;
  const attPcts = students.map(getAttendancePct).filter((p) => p !== null);
  const avgAtt = attPcts.length
    ? Math.round(attPcts.reduce((a, b) => a + b, 0) / attPcts.length)
    : null;
  return { total, avgGpa, byGrade, topGpa, avgAtt };
}

function validate(data) {
  if (!data.name?.trim())
    return { ok: false, field: "name", error: "Full name is required." };
  if (!data.studentId?.trim())
    return { ok: false, field: "studentId", error: "Student ID is required." };
  if (!data.email?.trim())
    return { ok: false, field: "email", error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    return { ok: false, field: "email", error: "Invalid email format." };
  if (!data.grade || ![9, 10, 11, 12].includes(Number(data.grade)))
    return { ok: false, field: "grade", error: "Select a valid grade." };
  const gpa = parseFloat(data.gpa);
  if (isNaN(gpa) || gpa < 0 || gpa > 4)
    return { ok: false, field: "gpa", error: "GPA must be between 0.0 and 4.0." };
  if (!data.enrollDate)
    return { ok: false, field: "enrollDate", error: "Enrollment date is required." };
  return null;
}

function exportCSV(students) {
  const headers = ["Name", "Student ID", "Email", "Grade", "GPA", "Enrolled", "Attendance %"];
  const rows = students.map((s) => [
    `"${s.name}"`,
    s.studentId,
    s.email,
    s.grade,
    s.gpa,
    s.enrollDate,
    getAttendancePct(s) !== null ? `${getAttendancePct(s)}%` : "N/A",
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}

function importCSV(csv, currentStudents) {
  const lines = csv.trim().split("\n").filter(Boolean);
  const results = { added: 0, skipped: 0, errors: [] };
  if (lines.length < 2) {
    results.errors.push("CSV has no data rows.");
    return { students: currentStudents, results };
  }
  const firstLine = lines[0].toLowerCase();
  const startIdx = firstLine.includes("name") || firstLine.includes("student") ? 1 : 0;
  const newStudents = [...currentStudents];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 5) { results.skipped++; continue; }
    const err = validate({
      name: cols[0], studentId: cols[1], email: cols[2],
      grade: cols[3], gpa: cols[4], enrollDate: cols[5] || today(),
    });
    if (err) { results.skipped++; results.errors.push(`Row ${i + 1}: ${err.error}`); continue; }
    const exists = newStudents.some(
      (s) => s.studentId === cols[1].trim().toUpperCase()
    );
    if (exists) { results.skipped++; continue; }
    newStudents.unshift(createStudent({
      name: cols[0], studentId: cols[1], email: cols[2],
      grade: cols[3], gpa: cols[4], enrollDate: cols[5] || today(),
    }));
    results.added++;
  }

  if (results.added > 0) saveStudents(newStudents);
  return { students: newStudents, results };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.payload, editingId: null };
    case "SET_THEME":
      localStorage.setItem(THEME_KEY, action.payload);
      return { ...state, theme: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_EDITING":
      return { ...state, editingId: action.payload };
    case "SET_STUDENTS":
      return { ...state, students: action.payload };
    case "ADD_STUDENT": {
      const err = validate(action.payload);
      if (err) return { ...state, formError: err };
      const dupId = state.students.some(
        (s) => s.studentId === action.payload.studentId.trim().toUpperCase()
      );
      if (dupId) return { ...state, formError: { ok: false, field: "studentId", error: "Student ID already exists." } };
      const dupEmail = state.students.some(
        (s) => s.email === action.payload.email.trim().toLowerCase()
      );
      if (dupEmail) return { ...state, formError: { ok: false, field: "email", error: "Email already registered." } };
      const student = createStudent(action.payload);
      const newStudents = [student, ...state.students];
      saveStudents(newStudents);
      return {
        ...state,
        students: newStudents,
        formError: null,
        view: "students",
        activity: [{ type: "success", text: `Added ${student.name}`, time: "just now" }, ...state.activity].slice(0, 50),
      };
    }
    case "UPDATE_STUDENT": {
      const idx = state.students.findIndex((s) => s.id === action.payload.id);
      if (idx === -1) return state;
      const err = validate(action.payload);
      if (err) return { ...state, formError: err };
      const dupId = state.students.some(
        (s) => s.id !== action.payload.id && s.studentId === action.payload.studentId.trim().toUpperCase()
      );
      if (dupId) return { ...state, formError: { ok: false, field: "studentId", error: "Student ID already exists." } };
      const dupEmail = state.students.some(
        (s) => s.id !== action.payload.id && s.email === action.payload.email.trim().toLowerCase()
      );
      if (dupEmail) return { ...state, formError: { ok: false, field: "email", error: "Email already registered." } };
      const existing = state.students[idx];
      const updated = createStudent({ ...existing, ...action.payload, id: action.payload.id, attendance: existing.attendance, createdAt: existing.createdAt });
      const newStudents = [...state.students];
      newStudents[idx] = updated;
      saveStudents(newStudents);
      return {
        ...state,
        students: newStudents,
        formError: null,
        editingId: null,
        view: "students",
        activity: [{ type: "info", text: `Updated ${updated.name}`, time: "just now" }, ...state.activity].slice(0, 50),
      };
    }
    case "DELETE_STUDENT": {
      const s = state.students.find((st) => st.id === action.payload);
      const newStudents = state.students.filter((st) => st.id !== action.payload);
      saveStudents(newStudents);
      return {
        ...state,
        students: newStudents,
        activity: [{ type: "error", text: `Removed ${s?.name}`, time: "just now" }, ...state.activity].slice(0, 50),
      };
    }
    case "MARK_ATTENDANCE": {
      const { id, status } = action.payload;
      const newStudents = state.students.map((s) => {
        if (s.id !== id) return s;
        return { ...s, attendance: { ...s.attendance, [today()]: status } };
      });
      saveStudents(newStudents);
      return { ...state, students: newStudents };
    }
    case "MARK_ALL_ATTENDANCE": {
      const status = action.payload;
      const todayKey = today();
      const newStudents = state.students.map((s) => ({
        ...s,
        attendance: { ...s.attendance, [todayKey]: status },
      }));
      saveStudents(newStudents);
      return { ...state, students: newStudents };
    }
    case "CLEAR_FORM_ERROR":
      return { ...state, formError: null };
    case "ADD_ACTIVITY":
      return {
        ...state,
        activity: [{ type: action.payload.type, text: action.payload.text, time: "just now" }, ...state.activity].slice(0, 50),
      };
    default:
      return state;
  }
}

function getFilteredStudents(students, filters) {
  const { search, grade, sort, dir } = filters;
  let list = [...students];
  if (grade !== "all") list = list.filter((s) => String(s.grade) === String(grade));
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q));
  }
  if (sort) {
    list.sort((a, b) => {
      let va, vb;
      if (sort === "name") { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (sort === "grade") { va = a.grade; vb = b.grade; }
      else if (sort === "gpa") { va = a.gpa; vb = b.gpa; }
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }
  return list;
}

function loadInitialState() {
  let students = loadStudents();
  if (!students.length) {
    students = getSeedStudents();
    saveStudents(students);
  }
  return {
    students,
    view: "dashboard",
    theme: localStorage.getItem(THEME_KEY) || "dark",
    filters: { search: "", grade: "all", sort: "", dir: "asc" },
    editingId: null,
    formError: null,
    activity: [],
  };
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadInitialState);

  const setView = useCallback((view) => dispatch({ type: "SET_VIEW", payload: view }), []);
  const setTheme = useCallback((theme) => dispatch({ type: "SET_THEME", payload: theme }), []);
  const toggleTheme = useCallback(() => {
    dispatch({ type: "SET_THEME", payload: state.theme === "dark" ? "light" : "dark" });
  }, [state.theme]);
  const setFilters = useCallback((f) => dispatch({ type: "SET_FILTERS", payload: f }), []);
  const setEditing = useCallback((id) => dispatch({ type: "SET_EDITING", payload: id }), []);
  const addStudent = useCallback((data) => dispatch({ type: "ADD_STUDENT", payload: data }), []);
  const updateStudent = useCallback((data) => dispatch({ type: "UPDATE_STUDENT", payload: data }), []);
  const deleteStudent = useCallback((id) => dispatch({ type: "DELETE_STUDENT", payload: id }), []);
  const markAttendance = useCallback((id, status) => dispatch({ type: "MARK_ATTENDANCE", payload: { id, status } }), []);
  const clearFormError = useCallback(() => dispatch({ type: "CLEAR_FORM_ERROR" }), []);
  const addActivity = useCallback((type, text) => dispatch({ type: "ADD_ACTIVITY", payload: { type, text } }), []);

  const filteredStudents = useMemo(
    () => getFilteredStudents(state.students, state.filters),
    [state.students, state.filters]
  );

  const stats = useMemo(() => getStats(state.students), [state.students]);

  const markAllPresent = useCallback(() => {
    dispatch({ type: "MARK_ALL_ATTENDANCE", payload: "present" });
  }, []);

  const markAllAbsent = useCallback(() => {
    dispatch({ type: "MARK_ALL_ATTENDANCE", payload: "absent" });
  }, []);

  const handleExportCSV = useCallback(() => {
    const csv = exportCSV(state.students);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quantio-students-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.students]);

  const handleImportCSV = useCallback((csvText) => {
    const { students, results } = importCSV(csvText, state.students);
    dispatch({ type: "SET_STUDENTS", payload: students });
    return results;
  }, [state.students]);

  const value = useMemo(() => ({
    students: state.students,
    view: state.view,
    theme: state.theme,
    filters: state.filters,
    editingId: state.editingId,
    formError: state.formError,
    activity: state.activity,
    filteredStudents,
    stats,
    setView,
    setTheme,
    toggleTheme,
    setFilters,
    setEditing,
    addStudent,
    updateStudent,
    deleteStudent,
    markAttendance,
    clearFormError,
    addActivity,
    markAllPresent,
    markAllAbsent,
    handleExportCSV,
    handleImportCSV,
  }), [
    state.students, state.view, state.theme, state.filters,
    state.editingId, state.formError, state.activity,
    filteredStudents, stats,
    setView, setTheme, toggleTheme, setFilters, setEditing,
    addStudent, updateStudent, deleteStudent, markAttendance,
    clearFormError, addActivity, markAllPresent, markAllAbsent,
    handleExportCSV, handleImportCSV,
  ]);

  return <AppContext value={value}>{children}</AppContext>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
