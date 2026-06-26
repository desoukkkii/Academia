import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import StudentsView from "./components/StudentsView";
import AttendanceView from "./components/AttendanceView";
import AddStudentForm from "./components/AddStudentForm";
import StudentDetailModal from "./components/StudentDetailModal";
import ConfirmModal from "./components/ConfirmModal";
import ShortcutsPanel from "./components/ShortcutsPanel";

function AppContent() {
  const { view, theme, toggleTheme, setView, setEditing, setFilters } = useApp();
  const [detailId, setDetailId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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

  return (
    <div className="flex min-h-screen min-h-dvh"
      style={{
        backgroundImage: "radial-gradient(1200px 600px at 12% -10%, var(--color-primary-glow), transparent 60%), radial-gradient(900px 500px at 100% 0%, var(--color-secondary-glow), transparent 55%)",
        backgroundAttachment: "fixed",
      }}>
      {/* Sidebar: md+ only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[232px]">
        <Topbar
          onShortcutsToggle={() => setShortcutsOpen((p) => !p)}
        />

        <main className="flex-1 p-6 max-md:px-4 max-md:pt-4 max-md:pb-[88px] lg:p-6" id="main">
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

      {/* Bottom Navigation: mobile only */}
      <BottomNav />

      {detailId && <StudentDetailModal studentId={detailId} onClose={() => setDetailId(null)} />}
      {confirmId && <ConfirmModal studentId={confirmId} onClose={() => setConfirmId(null)} />}
      <ShortcutsPanel open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}