import { useApp } from "../context/AppContext";
import { getInitials, esc, dateStr } from "../utils";

export default function StudentsView({ onDetail, onEdit, onDelete }) {
  const { filteredStudents: list, filters, setFilters, setView, getAttendancePct, getGpaTier } = useApp();
  const { search, grade, sort, dir } = filters;

  const grades = ["all", 9, 10, 11, 12];

  const handleSort = (col) => {
    if (sort === col) {
      setFilters({ dir: dir === "asc" ? "desc" : "asc" });
    } else {
      setFilters({ sort: col, dir: "asc" });
    }
  };

  const sortIcon = (col) => {
    if (sort !== col) return "fa-sort";
    return dir === "asc" ? "fa-sort-up" : "fa-sort-down";
  };

  const gradeColors = {
    g9: "bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.25)] text-[var(--color-warning)]",
    g10: "bg-[rgba(34,211,238,0.1)] border-[rgba(34,211,238,0.25)] text-[var(--color-secondary)]",
    g11: "bg-[rgba(124,92,252,0.1)] border-[rgba(124,92,252,0.25)] text-[var(--color-primary-light)]",
    g12: "bg-[rgba(244,114,182,0.1)] border-[rgba(244,114,182,0.25)] text-[var(--color-accent)]",
  };

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease]">
      <div className="flex items-center justify-between mb-4 gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {grades.map((g) => (
              <button key={g}
                onClick={() => setFilters({ grade: String(g) })}
                className={`px-3.5 max-sm:px-2.5 py-1.5 rounded-full text-xs max-sm:text-[11px] border transition-all ${
                  String(grade) === String(g)
                    ? "text-white font-medium border-transparent"
                    : "border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                }`}
                style={String(grade) === String(g) ? {
                  background: "linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 60%, var(--color-accent)))",
                  boxShadow: "0 6px 18px -6px var(--color-primary-glow)",
                } : undefined}>
                {g === "all" ? "All" : `Grade ${g}`}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-[var(--color-text-dim)] whitespace-nowrap">
          {list.length} student{list.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Mobile: Card Layout */}
      <div className="hidden max-sm:flex flex-col gap-2.5">
        {list.map((s) => {
          const gpaTier = getGpaTier(s.gpa);
          const gpaColor = gpaTier === "high" ? "text-[var(--color-success)]" : gpaTier === "low" ? "text-[var(--color-danger)]" : "text-[var(--color-warning)]";
          const gradeClass = `g${s.grade}`;

          return (
            <div key={s.id}
              onClick={() => onDetail(s.id)}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-3.5 flex items-center gap-3 cursor-pointer transition-all hover:border-[var(--color-border-light)] active:scale-[0.98]"
              style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}>
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary-light)] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {getInitials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium leading-tight truncate">{esc(s.name)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border leading-tight ${gradeColors[gradeClass]}`}>
                    Gr {s.grade}
                  </span>
                  <span className={`font-bold text-[13px] tabular-nums ${gpaColor}`}>{s.gpa.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onEdit(s.id)}
                  className="w-9 h-9 rounded-[var(--radius-xs)] flex items-center justify-center text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary-light)] transition-all active:scale-90">
                  <i className="fa-solid fa-pen-to-square" />
                </button>
                <button onClick={() => onDelete(s.id)}
                  className="w-9 h-9 rounded-[var(--radius-xs)] flex items-center justify-center text-sm text-[var(--color-text-muted)] hover:bg-[rgba(248,113,113,0.15)] hover:text-[var(--color-danger)] transition-all active:scale-90">
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            </div>
          );
        })}
        {!list.length && (
          <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
            <div className="text-[42px] text-[var(--color-text-dim)] mb-3.5 opacity-50">
              <i className="fa-solid fa-users-slash" />
            </div>
            <h3 className="text-base font-semibold mb-1.5 text-[var(--color-text-muted)]">No students found</h3>
            <p className="text-[13px] text-[var(--color-text-dim)] mb-[18px]">Try adjusting your search or add a new student.</p>
            <button onClick={() => setView("add")} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-white transition-all"
              style={{ background: "var(--color-primary)" }}>
              <i className="fa-solid fa-plus" /> Add Student
            </button>
          </div>
        )}
      </div>

      {/* Desktop/Tablet: Table Layout */}
      <div className="hidden sm:block rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden"
        style={{ background: "linear-gradient(180deg, var(--color-surface-1), transparent 60%), var(--color-bg-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr style={{ background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)" }}>
                <Th sortable col="name" currentSort={sort} dir={dir} onClick={() => handleSort("name")}>Name</Th>
                <Th className="hidden sm:table-cell">Student ID</Th>
                <Th className="hidden sm:table-cell">Email</Th>
                <Th sortable col="grade" currentSort={sort} dir={dir} onClick={() => handleSort("grade")}>Grade</Th>
                <Th sortable col="gpa" currentSort={sort} dir={dir} onClick={() => handleSort("gpa")}>GPA</Th>
                <Th className="hidden lg:table-cell">Enrolled</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const pct = getAttendancePct(s);
                const date = s.enrollDate ? dateStr(s.enrollDate) : "—";
                const gpaTier = getGpaTier(s.gpa);
                const gpaColor = gpaTier === "high" ? "text-[var(--color-success)]" : gpaTier === "low" ? "text-[var(--color-danger)]" : "text-[var(--color-warning)]";
                const gradeClass = `g${s.grade}`;

                return (
                  <tr key={s.id}
                    onClick={() => onDetail(s.id)}
                    className="border-b border-[var(--color-border)] last:border-b-0 transition-all hover:bg-[var(--color-surface-2)] cursor-pointer">
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-2.5 font-medium">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary-light)] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {getInitials(s.name)}
                        </div>
                        {esc(s.name)}
                      </div>
                    </td>
                    <td className="p-3 align-middle hidden sm:table-cell"><span className="font-mono text-xs text-[var(--color-text-muted)]">{esc(s.studentId)}</span></td>
                    <td className="p-3 align-middle hidden sm:table-cell"><span className="text-xs text-[var(--color-text-muted)]">{esc(s.email)}</span></td>
                    <td className="p-3 align-middle">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${gradeColors[gradeClass]}`}>
                        Grade {s.grade}
                      </span>
                    </td>
                    <td className="p-3 align-middle"><span className={`font-bold text-[13px] tabular-nums ${gpaColor}`}>{s.gpa.toFixed(2)}</span></td>
                    <td className="p-3 align-middle hidden lg:table-cell"><span className="text-xs text-[var(--color-text-muted)]">{date}</span></td>
                    <td className="p-3 align-middle">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => onEdit(s.id)} className="w-7 h-7 rounded-[var(--radius-xs)] flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary-light)] transition-all">
                          <i className="fa-solid fa-pen-to-square" />
                        </button>
                        <button onClick={() => onDelete(s.id)} className="w-7 h-7 rounded-[var(--radius-xs)] flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:bg-[rgba(248,113,113,0.15)] hover:text-[var(--color-danger)] transition-all">
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!list.length && (
          <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
            <div className="text-[42px] text-[var(--color-text-dim)] mb-3.5 opacity-50">
              <i className="fa-solid fa-users-slash" />
            </div>
            <h3 className="text-base font-semibold mb-1.5 text-[var(--color-text-muted)]">No students found</h3>
            <p className="text-[13px] text-[var(--color-text-dim)] mb-[18px]">Try adjusting your search or add a new student.</p>
            <button onClick={() => setView("add")} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-white transition-all"
              style={{ background: "var(--color-primary)" }}>
              <i className="fa-solid fa-plus" /> Add Student
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children, sortable, col, currentSort, dir, onClick, className = "" }) {
  const isActive = currentSort === col;
  return (
    <th className={`p-3 text-left text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-muted)] whitespace-nowrap ${sortable ? "cursor-pointer select-none hover:text-[var(--color-text)]" : ""} ${className}`}
      onClick={sortable ? onClick : undefined}>
      {children}
      {sortable && (
        <i className={`fa-solid ml-1 text-[10px] ${isActive ? "text-[var(--color-primary-light)] opacity-100" : "opacity-40"}`}
          style={isActive ? { color: "var(--color-primary-light)" } : undefined}>
        </i>
      )}
      {sortable && (
        <i className={`fa-solid ${isActive ? (dir === "asc" ? "fa-sort-up" : "fa-sort-down") : "fa-sort"} ml-1 text-[10px] ${isActive ? "opacity-100 text-[var(--color-primary-light)]" : "opacity-40"}`} />
      )}
    </th>
  );
}