import { useApp } from "../context/AppContext";
import { useState, useRef, useEffect } from "react";

const TITLES = {
  dashboard: "Dashboard",
  students: "Students",
  attendance: "Attendance",
  add: "Add Student",
};

export default function Topbar({ onShortcutsToggle }) {
  const { view, editingId, theme, toggleTheme, setFilters, setView } = useApp();
  const [searchVal, setSearchVal] = useState("");
  const inputRef = useRef(null);
  const title = editingId && view === "add" ? "Edit Student" : TITLES[view] || "";

  useEffect(() => {
    if (view !== "students") setSearchVal("");
  }, [view]);

  const handleSearch = (val) => {
    setSearchVal(val);
    setFilters({ search: val });
    if (view !== "students") setView("students");
  };

  return (
    <header className="h-16 max-sm:h-14 flex items-center justify-between px-5 max-sm:px-3 sticky top-0 z-100 border-b border-[var(--color-border)]"
      style={{ background: "color-mix(in oklab, var(--color-bg-elevated) 70%, transparent)", backdropFilter: "blur(20px) saturate(160%)" }}>
      <div className="flex items-center gap-3">
        <h1 className="text-[17px] max-md:text-[16px] font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full px-3.5 py-1.5 transition-all duration-[0.22s] focus-within:border-[var(--color-primary)]"
          style={{ background: "color-mix(in oklab, var(--color-bg-elevated) 80%, transparent)" }}>
          <i className="fa-solid fa-magnifying-glass text-[var(--color-text-dim)] text-[13px]" />
          <input
            ref={inputRef}
            type="text"
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search name or ID…"
            className="bg-transparent border-none outline-none text-[13px] w-[170px] max-sm:w-[110px] max-[400px]:w-[80px] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)]"
          />
          {searchVal && (
            <button onClick={() => handleSearch("")} className="text-[var(--color-text-dim)] text-xs p-0.5 rounded-full hover:text-[var(--color-text)] hover:bg-[var(--color-surface-1)]">
              <i className="fa-solid fa-xmark" />
            </button>
          )}
          <span className="text-[10px] text-[var(--color-text-dim)] bg-[var(--color-surface-1)] px-1.5 py-0.5 rounded hidden focus-within:inline">/</span>
        </div>

        <button onClick={toggleTheme} className="hidden sm:inline-flex w-[34px] h-[34px] rounded-full items-center justify-center text-[15px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text)] transition-all" title="Toggle theme">
          <i className={`fa-solid ${theme === "dark" ? "fa-moon" : "fa-sun"}`} />
        </button>
        <button onClick={onShortcutsToggle} className="hidden md:inline-flex w-[34px] h-[34px] rounded-full items-center justify-center text-[15px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text)] transition-all" title="Keyboard shortcuts">
          <i className="fa-solid fa-keyboard" />
        </button>
        <div className="w-8 h-8 max-sm:w-7 max-sm:h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", boxShadow: "0 6px 20px -6px var(--color-primary-glow), 0 0 0 1px rgba(255,255,255,0.08) inset" }}>
          Q
        </div>
      </div>
    </header>
  );
}
