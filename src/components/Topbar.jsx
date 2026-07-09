import { useApp } from "../context/AppContext";
import { useState, useRef, useEffect } from "react";

const TITLES = {
  dashboard: "Dashboard",
  students: "Students",
  attendance: "Attendance",
  add: "Add Student",
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

function SearchInput({ value, onChange, onClear, placeholder, ref }) {
  return (
    <>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-[13px] flex-1 min-w-0 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)]"
      />
      {value && (
        <button
          onClick={onClear}
          className="flex-shrink-0 text-[var(--color-text-dim)] text-xs p-0.5 rounded-full hover:text-[var(--color-text)]"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </>
  );
}

export default function Topbar({ onShortcutsToggle }) {
  const { view, editingId, theme, toggleTheme, setFilters, setView } = useApp();
  const [searchVal, setSearchVal] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileInputRef = useRef(null);
  const desktopInputRef = useRef(null);
  const isMobile = useIsMobile();
  const title = editingId && view === "add" ? "Edit Student" : TITLES[view] || "";

  useEffect(() => {
    if (view !== "students") setSearchVal("");
  }, [view]);

  useEffect(() => {
    const input = isMobile ? mobileInputRef.current : desktopInputRef.current;
    if (searchOpen && input) {
      input.focus();
    }
  }, [searchOpen, isMobile]);

  const handleSearch = (val) => {
    setSearchVal(val);
    setFilters({ search: val });
    if (view !== "students") setView("students");
  };

  const clearSearch = () => {
    handleSearch("");
    setSearchOpen(false);
  };

  return (
    <header
      className="h-14 md:h-16 flex items-center justify-between px-4 md:px-5 sticky top-0 z-100 border-b border-[var(--color-border)]"
      style={{
        background: "color-mix(in oklab, var(--color-bg-elevated) 72%, transparent)",
        backdropFilter: "blur(24px) saturate(160%)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <h1 className="text-[16px] md:text-[17px] font-semibold tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2.5 flex-shrink-0">
        {/* Mobile: search toggle */}
        <div
          className={`md:hidden flex items-center transition-all duration-300 overflow-hidden ${
            searchOpen ? "w-[200px] max-sm:w-[160px]" : "w-9"
          }`}
        >
          <div
            className={`flex items-center gap-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full transition-all duration-300 w-full ${
              searchOpen ? "px-3 py-1.5" : "px-0 py-0"
            }`}
            style={searchOpen ? { background: "color-mix(in oklab, var(--color-bg-elevated) 80%, transparent)" } : {}}
          >
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`flex-shrink-0 flex items-center justify-center transition-all ${
                searchOpen ? "w-4" : "w-9 h-9 rounded-full hover:bg-[var(--color-surface-1)]"
              }`}
            >
              <i className="fa-solid fa-magnifying-glass text-[var(--color-text-dim)] text-sm" />
            </button>
            {searchOpen && (
              <SearchInput
                ref={mobileInputRef}
                value={searchVal}
                onChange={handleSearch}
                onClear={clearSearch}
                placeholder="Search..."
              />
            )}
          </div>
        </div>

        {/* Desktop search */}
        <div
          className="hidden md:flex items-center gap-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full px-3.5 py-1.5 transition-all duration-[0.22s] focus-within:border-[var(--color-primary)]"
          style={{ background: "color-mix(in oklab, var(--color-bg-elevated) 80%, transparent)" }}
        >
          <i className="fa-solid fa-magnifying-glass text-[var(--color-text-dim)] text-[13px]" />
          <SearchInput
            ref={desktopInputRef}
            value={searchVal}
            onChange={handleSearch}
            onClear={() => handleSearch("")}
            placeholder="Search name or ID…"
          />
          {searchVal && (
            <button onClick={() => handleSearch("")} className="text-[var(--color-text-dim)] text-xs p-0.5 rounded-full hover:text-[var(--color-text)] hover:bg-[var(--color-surface-1)]">
              <i className="fa-solid fa-xmark" />
            </button>
          )}
          <span className="text-[10px] text-[var(--color-text-dim)] bg-[var(--color-surface-1)] px-1.5 py-0.5 rounded hidden focus-within:inline">/</span>
        </div>

        <button
          onClick={toggleTheme}
          className="hidden md:inline-flex w-9 h-9 rounded-full items-center justify-center text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text)] transition-all"
          title="Toggle theme"
        >
          <i className={`fa-solid ${theme === "dark" ? "fa-moon" : "fa-sun"}`} />
        </button>
        <button
          onClick={onShortcutsToggle}
          className="hidden md:inline-flex w-9 h-9 rounded-full items-center justify-center text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text)] transition-all"
          title="Keyboard shortcuts"
        >
          <i className="fa-solid fa-keyboard" />
        </button>
        <div
          className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            boxShadow: "0 4px 16px -4px var(--color-primary-glow), 0 0 0 1px rgba(255,255,255,0.08) inset",
          }}
        >
          Q
        </div>
      </div>
    </header>
  );
}
