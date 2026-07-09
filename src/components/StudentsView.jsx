import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { getInitials } from "../utils";

const GRADES = ["all", 9, 10, 11, 12];

const GRADE_COLORS = {
  g9: "bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.25)] text-[var(--color-warning)]",
  g10: "bg-[rgba(34,211,238,0.1)] border-[rgba(34,211,238,0.25)] text-[var(--color-secondary)]",
  g11: "bg-[rgba(124,92,252,0.1)] border-[rgba(124,92,252,0.25)] text-[var(--color-primary-light)]",
  g12: "bg-[rgba(244,114,182,0.1)] border-[rgba(244,114,182,0.25)] text-[var(--color-accent)]",
};

function useGpaColor(gpa) {
  return useMemo(() => {
    if (gpa >= 3.5) return "text-[var(--color-success)]";
    if (gpa >= 2.5) return "text-[var(--color-warning)]";
    return "text-[var(--color-danger)]";
  }, [gpa]);
}

function StudentCard({ student, onDetail, onEdit, onDelete }) {
  const gpaColor = useGpaColor(student.gpa);
  const gradeClass = `g${student.grade}`;

  return (
    <div
      onClick={() => onDetail(student.id)}
      className="rounded-2xl border border-[var(--color-border)] p-3.5 flex items-center gap-3 cursor-pointer transition-all active:scale-[0.98] hover:border-[var(--color-border-light)]"
      style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}
    >
      <div className="w-11 h-11 rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary-light)] text-sm font-bold flex items-center justify-center flex-shrink-0">
        {getInitials(student.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium leading-tight truncate">{student.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border leading-tight ${GRADE_COLORS[gradeClass]}`}>
            {student.grade}
          </span>
          <span className={`font-bold text-sm tabular-nums ${gpaColor}`}>{student.gpa.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onEdit(student.id)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary-light)] transition-all active:scale-90"
        >
          <i className="fa-solid fa-pen-to-square" />
        </button>
        <button
          onClick={() => onDelete(student.id)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm text-[var(--color-text-muted)] hover:bg-[rgba(248,113,113,0.15)] hover:text-[var(--color-danger)] transition-all active:scale-90"
        >
          <i className="fa-solid fa-trash-can" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      <div className="text-5xl text-[var(--color-text-dim)] mb-4 opacity-40">
        <i className="fa-solid fa-users-slash" />
      </div>
      <h3 className="text-base font-semibold mb-1 text-[var(--color-text-muted)]">No students found</h3>
      <p className="text-[13px] text-[var(--color-text-dim)] mb-5">Try adjusting your search or add a new student.</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all active:scale-95"
        style={{ background: "var(--color-primary)" }}
      >
        <i className="fa-solid fa-plus" /> Add Student
      </button>
    </div>
  );
}

export default function StudentsView({ onDetail, onEdit, onDelete }) {
  const { filteredStudents: list, filters, setFilters, setView } = useApp();
  const { search, grade, sort, dir } = filters;

  const handleSort = (col) => {
    if (sort === col) {
      setFilters({ dir: dir === "asc" ? "desc" : "asc" });
    } else {
      setFilters({ sort: col, dir: "asc" });
    }
  };

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease] max-md:pb-4">
      {/* Grade filter pills */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex gap-1 flex-wrap">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setFilters({ grade: String(g) })}
              className={`px-3 md:px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-medium border transition-all active:scale-95 ${
                String(grade) === String(g)
                  ? "text-white border-transparent font-semibold"
                  : "border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
              }`}
              style={String(grade) === String(g) ? {
                background: "linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 60%, var(--color-accent)))",
                boxShadow: "0 4px 12px -4px var(--color-primary-glow)",
              } : undefined}
            >
              {g === "all" ? "All" : `${g}`}
            </button>
          ))}
        </div>
        <span className="text-[11px] md:text-xs text-[var(--color-text-dim)] whitespace-nowrap tabular-nums">
          {list.length}
        </span>
      </div>

      {/* Mobile: Card Layout */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {list.length ? (
          list.map((s) => (
            <StudentCard key={s.id} student={s} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
          ))
        ) : (
          <EmptyState onAdd={() => setView("add")} />
        )}
      </div>

      {/* Desktop/Tablet: Table Layout */}
      <div
        className="hidden md:block rounded-2xl border border-[var(--color-border)] overflow-hidden"
        style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr style={{ background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)" }}>
                <Th sortable col="name" currentSort={sort} dir={dir} onClick={() => handleSort("name")}>Name</Th>
                <Th className="hidden md:table-cell">Student ID</Th>
                <Th className="hidden md:table-cell">Email</Th>
                <Th sortable col="grade" currentSort={sort} dir={dir} onClick={() => handleSort("grade")}>Grade</Th>
                <Th sortable col="gpa" currentSort={sort} dir={dir} onClick={() => handleSort("gpa")}>GPA</Th>
                <Th className="hidden lg:table-cell">Enrolled</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.length ? (
                list.map((s) => (
                  <StudentRow key={s.id} student={s} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState onAdd={() => setView("add")} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentRow({ student, onDetail, onEdit, onDelete }) {
  const gpaColor = useGpaColor(student.gpa);
  const gradeClass = `g${student.grade}`;

  return (
    <tr
      onClick={() => onDetail(student.id)}
      className="border-b border-[var(--color-border)] last:border-b-0 transition-all hover:bg-[var(--color-surface-2)] cursor-pointer"
    >
      <td className="p-3 align-middle">
        <div className="flex items-center gap-2.5 font-medium">
          <div className="w-7 h-7 rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary-light)] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
            {getInitials(student.name)}
          </div>
          {student.name}
        </div>
      </td>
      <td className="p-3 align-middle hidden md:table-cell"><span className="font-mono text-xs text-[var(--color-text-muted)]">{student.studentId}</span></td>
      <td className="p-3 align-middle hidden md:table-cell"><span className="text-xs text-[var(--color-text-muted)]">{student.email}</span></td>
      <td className="p-3 align-middle">
        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${GRADE_COLORS[gradeClass]}`}>
          {student.grade}
        </span>
      </td>
      <td className="p-3 align-middle"><span className={`font-bold text-[13px] tabular-nums ${gpaColor}`}>{student.gpa.toFixed(2)}</span></td>
      <td className="p-3 align-middle hidden lg:table-cell"><span className="text-xs text-[var(--color-text-muted)]">{student.enrollDate}</span></td>
      <td className="p-3 align-middle">
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(student.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary-light)] transition-all">
            <i className="fa-solid fa-pen-to-square" />
          </button>
          <button onClick={() => onDelete(student.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:bg-[rgba(248,113,113,0.15)] hover:text-[var(--color-danger)] transition-all">
            <i className="fa-solid fa-trash-can" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Th({ children, sortable, col, currentSort, dir, onClick, className = "" }) {
  const isActive = currentSort === col;
  return (
    <th
      className={`p-3 text-left text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-muted)] whitespace-nowrap ${sortable ? "cursor-pointer select-none hover:text-[var(--color-text)]" : ""} ${className}`}
      onClick={sortable ? onClick : undefined}
    >
      {children}
      {sortable && (
        <i className={`fa-solid ${isActive ? (dir === "asc" ? "fa-sort-up" : "fa-sort-down") : "fa-sort"} ml-1 text-[10px] ${isActive ? "opacity-100 text-[var(--color-primary-light)]" : "opacity-40"}`} />
      )}
    </th>
  );
}
