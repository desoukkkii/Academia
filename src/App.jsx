import { useState, useEffect, useCallback } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import StudentsView from "./components/StudentsView";
import AttendanceView from "./components/AttendanceView";
import AddStudentForm from "./components/AddStudentForm";
import StudentDetailModal from "./components/StudentDetailModal";
import ConfirmModal from "./components/ConfirmModal";
import ShortcutsPanel from "./components/ShortcutsPanel";

const VIEW_COMPONENTS = {
  dashboard: Dashboard,
  students: StudentsView,
  attendance: AttendanceView,
  add: AddStudentForm,
};

function AppContent() {
  const { view, theme, toggleTheme, setView, setEditing, setFilters } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const showToast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (ev) => {
      if (ev.target.tagName === "INPUT" || ev.target.tagName === "SELECT" || ev.target.tagName === "TEXTAREA") return;
      switch (ev.key) {
        case "1": setView("dashboard"); ev.preventDefault(); break;
        case "2": setView("students"); ev.preventDefault(); break;
        case "3": setView("attendance"); ev.preventDefault(); break;
        case "n": case "N": setView("add"); ev.preventDefault(); break;
        case "/": document.querySelector("#searchInput")?.focus(); ev.preventDefault(); break;
        case "t": case "T": toggleTheme(); ev.preventDefault(); break;
        case "Escape":
          setDetailId(null); setConfirmId(null); setShortcutsOpen(false);
          ev.preventDefault(); break;
        case "?": setShortcutsOpen((p) => !p); ev.preventDefault(); break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleTheme, setView]);

  const ViewComponent = VIEW_COMPONENTS[view] || Dashboard;

  return (
    <div className="flex min-h-screen min-h-dvh"
      style={{
        backgroundImage: "radial-gradient(1200px 600px at 12% -10%, var(--color-primary-glow), transparent 60%), radial-gradient(900px 500px at 100% 0%, var(--color-secondary-glow), transparent 55%)",
        backgroundAttachment: "fixed",
      }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[232px]">
        <Topbar
          onMenuToggle={() => setSidebarOpen((p) => !p)}
          onShortcutsToggle={() => setShortcutsOpen((p) => !p)}
        />

        <main className="flex-1 p-6 max-sm:p-3 max-sm:pb-9" id="main">
          {view === "dashboard" && <Dashboard onStudentClick={(id) => setDetailId(id)} />}
          {view === "students" && (
            <StudentsView
              onDetail={(id) => setDetailId(id)}
              onEdit={(id) => { setEditing(id); setView("add"); }}
              onDelete={(id) => setConfirmId(id)}
            />
          )}
          {view === "attendance" && <AttendanceView />}
          {view === "add" && <AddStudentForm />}
        </main>
      </div>

      {detailId && <StudentDetailModal studentId={detailId} onClose={() => setDetailId(null)} />}
      {confirmId && <ConfirmModal studentId={confirmId} onClose={() => setConfirmId(null)} />}
      <ShortcutsPanel open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <div className="fixed bottom-5 right-5 max-sm:right-3 max-sm:bottom-3 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-border)] animate-[toastSlideIn_0.3s_ease] max-w-[300px] ${
              t.type === "success" ? "border-l-[3px] border-l-[var(--color-success)]" :
              t.type === "error" ? "border-l-[3px] border-l-[var(--color-danger)]" :
              "border-l-[3px] border-l-[var(--color-info)]"
            }`}
            style={{ background: "var(--color-bg-card)", boxShadow: "var(--shadow-lg)" }}>
            <i className={`fa-solid fa-${
              t.type === "success" ? "circle-check" :
              t.type === "error" ? "circle-xmark" :
              "circle-info"
            } text-sm flex-shrink-0 ${
              t.type === "success" ? "text-[var(--color-success)]" :
              t.type === "error" ? "text-[var(--color-danger)]" :
              "text-[var(--color-info)]"
            }`} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
