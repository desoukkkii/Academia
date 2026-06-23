/* ═════════════════════════════════════════════════════════
   Quantio — Student Intelligence Platform
   Script
═════════════════════════════════════════════════════════ */

const Quantio = (() => {
  "use strict";

  /* ═══════════════════════════════════════════════════
     Utilities
  ═══════════════════════════════════════════════════ */

  const Utils = {
    uid: () => crypto.randomUUID(),

    esc: (str) =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),

    dateStr: (d) => {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    isoDate: (d) => new Date(d).toISOString().slice(0, 10),

    today: () => new Date().toISOString().slice(0, 10),

    timeAgo: (iso) => {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    },

    formatTime: (iso) => {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  };

  /* ═══════════════════════════════════════════════════
     State
  ═══════════════════════════════════════════════════ */

  const state = {
    students: [],
    view: "dashboard",
    theme: localStorage.getItem("quantio_theme") || "dark",
    filters: { search: "", grade: "all", sort: "", dir: "asc" },
    editingId: null,
    activity: [],
    _listeners: [],

    subscribe(fn) {
      this._listeners.push(fn);
      return () => {
        this._listeners = this._listeners.filter((l) => l !== fn);
      };
    },

    notify() {
      this._listeners.forEach((fn) => fn());
    },

    setView(name) {
      this.view = name;
      this.editingId = null;
      this.notify();
    },

    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("quantio_theme", theme);
      this.notify();
    },

    toggleTheme() {
      this.setTheme(this.theme === "dark" ? "light" : "dark");
    },

    setFilters(partial) {
      Object.assign(this.filters, partial);
      this.notify();
    },

    addActivity(type, text) {
      this.activity.unshift({
        type,
        text,
        time: Utils.timeAgo(new Date().toISOString()),
        timestamp: Date.now(),
      });
      if (this.activity.length > 50) this.activity.length = 50;
      this.notify();
    },
  };

  /* ═══════════════════════════════════════════════════
     Student Model
  ═══════════════════════════════════════════════════ */

  class Student {
    constructor(data) {
      this.id = data.id || Utils.uid();
      this.name = data.name.trim();
      this.studentId = data.studentId.trim().toUpperCase();
      this.email = data.email.trim().toLowerCase();
      this.grade = Number(data.grade);
      this.gpa = parseFloat(Number(data.gpa).toFixed(2));
      this.enrollDate = data.enrollDate;
      this.attendance = data.attendance || {};
      this.createdAt = data.createdAt || new Date().toISOString();
    }

    get initials() {
      return this.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }

    get attendancePct() {
      const days = Object.values(this.attendance);
      if (!days.length) return null;
      const present = days.filter((v) => v === "present").length;
      return Math.round((present / days.length) * 100);
    }

    get gpaTier() {
      if (this.gpa >= 3.5) return "high";
      if (this.gpa >= 2.5) return "mid";
      return "low";
    }
  }

  /* ═══════════════════════════════════════════════════
     Services
  ═══════════════════════════════════════════════════ */

  const Storage = {
    _key: "quantio_students",

    load() {
      try {
        const raw = localStorage.getItem(this._key);
        return raw ? JSON.parse(raw).map((d) => new Student(d)) : [];
      } catch {
        return [];
      }
    },

    save(students) {
      try {
        localStorage.setItem(this._key, JSON.stringify(students));
      } catch (e) {
        console.error("Quantio: save failed", e);
      }
    },
  };

  const StudentManager = {
    _students: [],

    init() {
      this._students = Storage.load();
    },

    getAll() {
      return [...this._students];
    },

    getById(id) {
      return this._students.find((s) => s.id === id);
    },

    add(data) {
      const err = this._validate(data);
      if (err) return err;

      if (
        this._students.some(
          (s) => s.studentId === data.studentId.trim().toUpperCase(),
        )
      )
        return {
          ok: false,
          field: "studentId",
          error: "Student ID already exists.",
        };

      if (
        this._students.some((s) => s.email === data.email.trim().toLowerCase())
      )
        return {
          ok: false,
          field: "email",
          error: "Email already registered.",
        };

      const student = new Student(data);
      this._students.unshift(student);
      Storage.save(this._students);
      state.addActivity("success", `Added ${student.name}`);
      return { ok: true, student };
    },

    update(id, data) {
      const idx = this._students.findIndex((s) => s.id === id);
      if (idx === -1) return { ok: false, error: "Student not found." };

      const err = this._validate(data);
      if (err) return err;

      if (
        this._students.some(
          (s) =>
            s.id !== id && s.studentId === data.studentId.trim().toUpperCase(),
        )
      )
        return {
          ok: false,
          field: "studentId",
          error: "Student ID already exists.",
        };

      if (
        this._students.some(
          (s) => s.id !== id && s.email === data.email.trim().toLowerCase(),
        )
      )
        return {
          ok: false,
          field: "email",
          error: "Email already registered.",
        };

      const existing = this._students[idx];
      const updated = new Student({
        ...existing,
        ...data,
        id,
        attendance: existing.attendance,
        createdAt: existing.createdAt,
      });
      this._students[idx] = updated;
      Storage.save(this._students);
      state.addActivity("info", `Updated ${updated.name}`);
      return { ok: true, student: updated };
    },

    delete(id) {
      const s = this.getById(id);
      this._students = this._students.filter((st) => st.id !== id);
      Storage.save(this._students);
      if (s) state.addActivity("error", `Removed ${s.name}`);
    },

    markAttendance(id, status) {
      const student = this.getById(id);
      if (!student) return;
      student.attendance[Utils.today()] = status;
      Storage.save(this._students);
      state.addActivity(
        "warning",
        `${status === "present" ? "✅" : "❌"} ${student.name}: ${status}`,
      );
    },

    filter(opts = {}) {
      const { search = "", grade = "all", sort = "", dir = "asc" } = opts;
      let list = this.getAll();

      if (grade !== "all")
        list = list.filter((s) => String(s.grade) === String(grade));

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q),
        );
      }

      if (sort) {
        list.sort((a, b) => {
          let va, vb;
          if (sort === "name") {
            va = a.name.toLowerCase();
            vb = b.name.toLowerCase();
          }
          if (sort === "grade") {
            va = a.grade;
            vb = b.grade;
          }
          if (sort === "gpa") {
            va = a.gpa;
            vb = b.gpa;
          }
          if (va < vb) return dir === "asc" ? -1 : 1;
          if (va > vb) return dir === "asc" ? 1 : -1;
          return 0;
        });
      }

      return list;
    },

    stats() {
      const all = this.getAll();
      const total = all.length;
      const avgGpa = total ? all.reduce((s, st) => s + st.gpa, 0) / total : 0;
      const byGrade = { 9: 0, 10: 0, 11: 0, 12: 0 };
      all.forEach((s) => {
        byGrade[s.grade] = (byGrade[s.grade] || 0) + 1;
      });
      const topGpa = total ? Math.max(...all.map((s) => s.gpa)) : null;
      const attPcts = all.map((s) => s.attendancePct).filter((p) => p !== null);
      const avgAtt = attPcts.length
        ? Math.round(attPcts.reduce((a, b) => a + b, 0) / attPcts.length)
        : null;
      return { total, avgGpa, byGrade, topGpa, avgAtt };
    },

    exportCSV() {
      const headers = [
        "Name",
        "Student ID",
        "Email",
        "Grade",
        "GPA",
        "Enrolled",
        "Attendance %",
      ];
      const rows = this.getAll().map((s) => [
        `"${s.name}"`,
        s.studentId,
        s.email,
        s.grade,
        s.gpa,
        s.enrollDate,
        s.attendancePct !== null ? `${s.attendancePct}%` : "N/A",
      ]);
      return [headers, ...rows].map((r) => r.join(",")).join("\n");
    },

    importCSV(csv) {
      const lines = csv.trim().split("\n").filter(Boolean);
      const results = { added: 0, skipped: 0, errors: [] };
      if (lines.length < 2) {
        results.errors.push("CSV has no data rows.");
        return results;
      }

      const firstLine = lines[0].toLowerCase();
      const startIdx =
        firstLine.includes("name") || firstLine.includes("student") ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i]
          .split(",")
          .map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 5) {
          results.skipped++;
          continue;
        }
        const res = this.add({
          name: cols[0],
          studentId: cols[1],
          email: cols[2],
          grade: cols[3],
          gpa: cols[4],
          enrollDate: cols[5] || Utils.today(),
        });
        if (res.ok) results.added++;
        else {
          results.skipped++;
          results.errors.push(`Row ${i + 1}: ${res.error}`);
        }
      }

      if (results.added > 0)
        state.addActivity("info", `Imported ${results.added} students`);
      return results;
    },

    _validate(data) {
      if (!data.name?.trim())
        return { ok: false, field: "name", error: "Full name is required." };
      if (!data.studentId?.trim())
        return {
          ok: false,
          field: "studentId",
          error: "Student ID is required.",
        };
      if (!data.email?.trim())
        return { ok: false, field: "email", error: "Email is required." };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        return { ok: false, field: "email", error: "Invalid email format." };
      if (!data.grade || ![9, 10, 11, 12].includes(Number(data.grade)))
        return { ok: false, field: "grade", error: "Select a valid grade." };
      const gpa = parseFloat(data.gpa);
      if (isNaN(gpa) || gpa < 0 || gpa > 4)
        return {
          ok: false,
          field: "gpa",
          error: "GPA must be between 0.0 and 4.0.",
        };
      if (!data.enrollDate)
        return {
          ok: false,
          field: "enrollDate",
          error: "Enrollment date is required.",
        };
      return null;
    },
  };

  /* ═══════════════════════════════════════════════════
     Seed Data
  ═══════════════════════════════════════════════════ */

  function seedData() {
    if (StudentManager.getAll().length > 0) return;

    const samples = [
      {
        name: "Emma Watson",
        studentId: "STU-001",
        email: "emma.watson@school.edu",
        grade: 12,
        gpa: 3.8,
        enrollDate: "2021-09-01",
      },
      {
        name: "James Wilson",
        studentId: "STU-002",
        email: "james.wilson@school.edu",
        grade: 11,
        gpa: 3.2,
        enrollDate: "2022-09-01",
      },
      {
        name: "Sophia Lee",
        studentId: "STU-003",
        email: "sophia.lee@school.edu",
        grade: 10,
        gpa: 3.9,
        enrollDate: "2023-09-01",
      },
      {
        name: "Michael Brown",
        studentId: "STU-004",
        email: "michael.brown@school.edu",
        grade: 12,
        gpa: 2.8,
        enrollDate: "2021-09-01",
      },
      {
        name: "Olivia Chen",
        studentId: "STU-005",
        email: "olivia.chen@school.edu",
        grade: 9,
        gpa: 3.5,
        enrollDate: "2024-09-01",
      },
    ];

    const today = new Date();
    samples.forEach((data) => {
      const result = StudentManager.add(data);
      if (!result.ok || !result.student) return;
      for (let d = 10; d >= 1; d--) {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - d);
        const key = Utils.isoDate(dt);
        const status = Math.random() > 0.15 ? "present" : "absent";
        result.student.attendance[key] = status;
      }
    });
    Storage.save(StudentManager.getAll());
    state.activity.length = 0;
  }

  /* ═══════════════════════════════════════════════════
     UI — Rendering
  ═══════════════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function renderLayout() {
    const app = $("#app");
    app.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon"><i class="fa-solid fa-atom"></i></div>
          <div>
            <div class="sidebar-brand-name">Quantio</div>
            <div class="sidebar-brand-sub">Student Intelligence</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="nav-item active" data-view="dashboard"><i class="fa-solid fa-chart-pie"></i><span>Dashboard</span></a>
          <a href="#" class="nav-item" data-view="students"><i class="fa-solid fa-users"></i><span>Students</span></a>
          <a href="#" class="nav-item" data-view="attendance"><i class="fa-solid fa-calendar-check"></i><span>Attendance</span></a>
          <a href="#" class="nav-item" data-view="add"><i class="fa-solid fa-user-plus"></i><span>Add Student</span></a>
        </nav>
        <div class="sidebar-footer">
          <button class="sidebar-btn" id="exportBtn"><i class="fa-solid fa-file-arrow-down"></i><span>Export CSV</span></button>
          <label class="sidebar-btn" for="importInput"><i class="fa-solid fa-file-arrow-up"></i><span>Import CSV</span></label>
          <input type="file" id="importInput" accept=".csv" style="display:none" />
        </div>
      </aside>

      <div class="main" id="main">
        <header class="topbar">
          <div class="topbar-left">
            <button class="hamburger" id="hamburger"><i class="fa-solid fa-bars"></i></button>
            <h1 class="page-title" id="pageTitle">Dashboard</h1>
          </div>
          <div class="topbar-right">
            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="searchInput" placeholder="Search name or ID…" />
              <button class="search-clear" id="searchClear"><i class="fa-solid fa-xmark"></i></button>
              <span class="search-hint">/</span>
            </div>
            <button class="icon-btn" id="themeToggle" title="Toggle theme"><i class="fa-solid fa-moon"></i></button>
            <button class="icon-btn" id="shortcutsToggle" title="Keyboard shortcuts"><i class="fa-solid fa-keyboard"></i></button>
            <div class="avatar-btn">Q</div>
          </div>
        </header>

        <section class="view active" id="view-dashboard"></section>
        <section class="view" id="view-students"></section>
        <section class="view" id="view-attendance"></section>
        <section class="view" id="view-add"></section>
      </div>

      <div class="modal-overlay" id="detailOverlay">
        <div class="modal">
          <button class="modal-close" id="detailClose"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-detail-header">
            <div class="detail-avatar" id="detailAvatar"></div>
            <div>
              <h2 class="detail-name" id="detailName"></h2>
              <span class="detail-id" id="detailId"></span>
            </div>
          </div>
          <div class="detail-grid" id="detailGrid"></div>
        </div>
      </div>

      <div class="modal-overlay" id="confirmOverlay">
        <div class="modal modal-sm">
          <div class="confirm-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h3 class="confirm-title">Delete Student?</h3>
          <p class="confirm-msg" id="confirmMsg"></p>
          <div class="confirm-actions">
            <button class="btn-ghost btn-sm" id="confirmCancel">Cancel</button>
            <button class="btn-danger btn-sm" id="confirmOk">Delete</button>
          </div>
        </div>
      </div>

      <div class="shortcuts-panel" id="shortcutsPanel">
        <h3>Keyboard Shortcuts</h3>
        <div class="shortcut-row"><span>Dashboard</span><kbd>1</kbd></div>
        <div class="shortcut-row"><span>Students</span><kbd>2</kbd></div>
        <div class="shortcut-row"><span>Attendance</span><kbd>3</kbd></div>
        <div class="shortcut-row"><span>Add Student</span><kbd>N</kbd></div>
        <div class="shortcut-row"><span>Search</span><kbd>/</kbd></div>
        <div class="shortcut-row"><span>Toggle Theme</span><kbd>T</kbd></div>
        <div class="shortcut-row"><span>Close Modal</span><kbd>Esc</kbd></div>
      </div>

      <div class="toast-container" id="toastContainer"></div>
    `;

    state.setTheme(state.theme);
  }

  /* ─── Dashboard ─── */

  function renderDashboard() {
    const el = $("#view-dashboard");
    const s = StudentManager.stats();
    const recent = StudentManager.getAll().slice(0, 5);
    const all = StudentManager.getAll();

    const avgAtt = s.avgAtt !== null ? s.avgAtt : 0;
    const ringDash = 226.2 - (226.2 * avgAtt) / 100;

    el.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon accent-primary"><i class="fa-solid fa-users"></i></div>
          <div>
            <span class="stat-label">Total Students</span>
            <span class="stat-value" id="statTotal">${s.total}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon accent-secondary"><i class="fa-solid fa-star"></i></div>
          <div>
            <span class="stat-label">Average GPA</span>
            <span class="stat-value" id="statAvg">${s.avgGpa.toFixed(2)}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon accent-accent"><i class="fa-solid fa-trophy"></i></div>
          <div>
            <span class="stat-label">Top GPA</span>
            <span class="stat-value" id="statTop">${s.topGpa !== null ? s.topGpa.toFixed(2) : "—"}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon accent-warning"><i class="fa-solid fa-calendar-check"></i></div>
          <div>
            <span class="stat-label">Avg. Attendance</span>
            <span class="stat-value" id="statAtt">${s.avgAtt !== null ? s.avgAtt + "%" : "—"}</span>
          </div>
        </div>
      </div>

      <div class="dash-row">
        <div class="dash-card">
          <h3 class="dash-card-title"><i class="fa-solid fa-chart-column"></i> Students by Grade</h3>
          <div class="grade-bars">
            ${[9, 10, 11, 12]
              .map(
                (g) => `
              <div class="grade-bar-row">
                <span class="grade-bar-label">Grade ${g}</span>
                <div class="grade-bar-track">
                  <div class="grade-bar-fill" style="width:${Math.max((s.byGrade[g] / Math.max(...Object.values(s.byGrade), 1)) * 100, 0)}%"></div>
                </div>
                <span class="grade-bar-count">${s.byGrade[g]}</span>
              </div>`,
              )
              .join("")}
          </div>
        </div>

        <div class="dash-card">
          <h3 class="dash-card-title"><i class="fa-solid fa-clock-rotate-left"></i> Recently Added</h3>
          <ul class="recent-ul">
            ${
              recent.length
                ? recent
                    .map(
                      (st) => `
                <li class="recent-li" data-id="${st.id}">
                  <div class="recent-li-avatar">${Utils.esc(st.initials)}</div>
                  <div>
                    <div class="recent-li-name">${Utils.esc(st.name)}</div>
                    <div class="recent-li-sub">Grade ${st.grade}</div>
                  </div>
                  <span class="recent-li-gpa">${st.gpa.toFixed(2)}</span>
                </li>`,
                    )
                    .join("")
                : '<li style="color:var(--text-dim);font-size:13px;padding:12px 0">No students yet. <a href="#" data-view="add" style="color:var(--primary-light)">Add one</a>.</li>'
            }
          </ul>
        </div>
      </div>

      <div class="activity-timeline" id="activityTimeline">
        <h3 class="activity-title"><i class="fa-solid fa-bolt"></i> Recent Activity</h3>
        <div class="activity-list">
          ${
            state.activity.length
              ? state.activity
                  .slice(0, 10)
                  .map(
                    (a) => `
                <div class="activity-item">
                  <span class="activity-dot ${a.type}"></span>
                  <span class="activity-text">${Utils.esc(a.text)}</span>
                  <span class="activity-time">${a.time}</span>
                </div>`,
                  )
                  .join("")
              : '<div style="color:var(--text-dim);font-size:13px;padding:8px 0">No activity yet.</div>'
          }
        </div>
      </div>
    `;

    animateValue("statTotal", s.total);
    animateValue("statAvg", s.avgGpa);
  }

  function animateValue(id, target) {
    const el = document.getElementById(id);
    if (!el || target === 0) return;
    const start = performance.now();
    const from = 0;
    const dur = 500;

    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const v = from + (target - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = id === "statAvg" ? v.toFixed(2) : Math.round(v);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ─── Students View ─── */

  function renderStudentsView() {
    const el = $("#view-students");
    const { search, grade, sort, dir } = state.filters;
    const list = StudentManager.filter({ search, grade, sort, dir });

    el.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="filter-chips" id="filterChips">
            <button class="chip ${grade === "all" ? "active" : ""}" data-grade="all">All</button>
            <button class="chip ${grade === "9" ? "active" : ""}" data-grade="9">Grade 9</button>
            <button class="chip ${grade === "10" ? "active" : ""}" data-grade="10">Grade 10</button>
            <button class="chip ${grade === "11" ? "active" : ""}" data-grade="11">Grade 11</button>
            <button class="chip ${grade === "12" ? "active" : ""}" data-grade="12">Grade 12</button>
          </div>
        </div>
        <span class="student-count">${list.length} student${list.length !== 1 ? "s" : ""}</span>
      </div>

      <div class="table-wrap">
        <table class="students-table" id="studentsTable">
          <thead>
            <tr>
              <th class="sortable ${sort === "name" ? (dir === "asc" ? "sort-asc" : "sort-desc") : ""}" data-sort="name">
                Name <i class="fa-solid ${sort === "name" ? `fa-sort-${dir === "asc" ? "up" : "down"}` : "fa-sort"}"></i>
              </th>
              <th>Student ID</th>
              <th>Email</th>
              <th class="sortable ${sort === "grade" ? (dir === "asc" ? "sort-asc" : "sort-desc") : ""}" data-sort="grade">
                Grade <i class="fa-solid ${sort === "grade" ? `fa-sort-${dir === "asc" ? "up" : "down"}` : "fa-sort"}"></i>
              </th>
              <th class="sortable ${sort === "gpa" ? (dir === "asc" ? "sort-asc" : "sort-desc") : ""}" data-sort="gpa">
                GPA <i class="fa-solid ${sort === "gpa" ? `fa-sort-${dir === "asc" ? "up" : "down"}` : "fa-sort"}"></i>
              </th>
              <th>Enrolled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="studentsBody">
            ${list.length ? list.map(renderStudentRow).join("") : ""}
          </tbody>
        </table>
        <div class="empty-state ${list.length ? "" : "visible"}">
          <div class="empty-icon"><i class="fa-solid fa-users-slash"></i></div>
          <h3>No students found</h3>
          <p>Try adjusting your search or add a new student.</p>
          <button class="btn-primary btn-sm" data-view="add"><i class="fa-solid fa-plus"></i> Add Student</button>
        </div>
      </div>
    `;
  }

  function renderStudentRow(s) {
    const pct = s.attendancePct;
    const date = s.enrollDate ? Utils.dateStr(s.enrollDate) : "—";
    return `
      <tr data-id="${s.id}">
        <td>
          <div class="td-name">
            <div class="td-avatar">${Utils.esc(s.initials)}</div>
            ${Utils.esc(s.name)}
          </div>
        </td>
        <td><span class="td-id">${Utils.esc(s.studentId)}</span></td>
        <td><span class="td-email">${Utils.esc(s.email)}</span></td>
        <td><span class="grade-badge g${s.grade}">Grade ${s.grade}</span></td>
        <td><span class="gpa-cell ${s.gpaTier}">${s.gpa.toFixed(2)}</span></td>
        <td><span class="td-date">${date}</span></td>
        <td class="actions-cell">
          <button class="btn-icon edit" data-action="edit" data-id="${s.id}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-icon delete" data-action="delete" data-id="${s.id}" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `;
  }

  /* ─── Attendance View ─── */

  function renderAttendanceView() {
    const el = $("#view-attendance");
    const today = new Date();
    const todayK = Utils.today();
    const all = StudentManager.getAll();
    const present = all.filter(
      (s) => s.attendance[todayK] === "present",
    ).length;
    const absent = all.filter((s) => s.attendance[todayK] === "absent").length;

    el.innerHTML = `
      <div class="attendance-header">
        <span class="att-date">${today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        <div class="att-actions">
          <button class="btn-ghost btn-sm" id="markAllPresent"><i class="fa-solid fa-check"></i> All Present</button>
          <button class="btn-ghost btn-sm" id="markAllAbsent"><i class="fa-solid fa-xmark"></i> All Absent</button>
        </div>
      </div>
      <div class="attendance-header" style="margin-top:-8px">
        <div class="att-summary">
          <span class="present-count">${present} present</span>
          <span class="att-divider">·</span>
          <span class="absent-count">${absent} absent</span>
          <span class="att-divider">·</span>
          <span style="color:var(--text-dim);font-size:13px">${all.length - present - absent} unmarked</span>
        </div>
      </div>
      <div class="attendance-grid" id="attendanceGrid">
        ${
          all.length
            ? all
                .map((s) => {
                  const todayStatus = s.attendance[todayK] || "";
                  const pct = s.attendancePct;
                  const pctStr =
                    pct !== null ? `${pct}% overall` : "No records";
                  const pctCls =
                    pct === null
                      ? ""
                      : pct >= 80
                        ? "high"
                        : pct >= 60
                          ? "mid"
                          : "low";
                  return `
                  <div class="att-card ${todayStatus}" data-id="${s.id}">
                    <div class="att-card-avatar">${Utils.esc(s.initials)}</div>
                    <div class="att-card-info">
                      <div class="att-card-name">${Utils.esc(s.name)}</div>
                      <div class="att-card-sub">Grade ${s.grade} · <span class="att-pct ${pctCls}">${pctStr}</span></div>
                    </div>
                    <div class="att-toggle">
                      <button class="att-btn ${todayStatus === "present" ? "active-p" : ""}" data-action="present" data-id="${s.id}">P</button>
                      <button class="att-btn ${todayStatus === "absent" ? "active-a" : ""}" data-action="absent" data-id="${s.id}">A</button>
                    </div>
                  </div>`;
                })
                .join("")
            : '<p style="color:var(--text-dim);font-size:14px;grid-column:1/-1;text-align:center;padding:48px 0">No students yet.</p>'
        }
      </div>
    `;
  }

  /* ─── Form View ─── */

  function renderFormView() {
    const el = $("#view-add");
    const editId = state.editingId;
    const s = editId ? StudentManager.getById(editId) : null;
    const isEdit = !!s;

    el.innerHTML = `
      <div class="form-card">
        <h2 class="form-title"><i class="fa-solid ${isEdit ? "fa-floppy-disk" : "fa-user-plus"}"></i> ${isEdit ? "Edit Student" : "Add Student"}</h2>
        <form id="studentForm" novalidate>
          <input type="hidden" id="editingId" value="${editId || ""}" />
          <div class="form-grid">
            <div class="form-group">
              <label for="fName">Full Name <span class="req">*</span></label>
              <input type="text" id="fName" placeholder="Emma Watson" value="${isEdit ? Utils.esc(s.name) : ""}" />
              <span class="form-error" id="errName"></span>
            </div>
            <div class="form-group">
              <label for="fId">Student ID <span class="req">*</span></label>
              <input type="text" id="fId" placeholder="STU-001" value="${isEdit ? Utils.esc(s.studentId) : ""}" />
              <span class="form-error" id="errId"></span>
            </div>
            <div class="form-group">
              <label for="fEmail">Email <span class="req">*</span></label>
              <input type="email" id="fEmail" placeholder="emma@school.edu" value="${isEdit ? Utils.esc(s.email) : ""}" />
              <span class="form-error" id="errEmail"></span>
            </div>
            <div class="form-group">
              <label for="fGrade">Grade Level <span class="req">*</span></label>
              <select id="fGrade">
                <option value="">Select grade…</option>
                ${[9, 10, 11, 12]
                  .map(
                    (g) =>
                      `<option value="${g}" ${isEdit && s.grade === g ? "selected" : ""}>Grade ${g}</option>`,
                  )
                  .join("")}
              </select>
              <span class="form-error" id="errGrade"></span>
            </div>
            <div class="form-group">
              <label for="fGpa">GPA (0.0–4.0) <span class="req">*</span></label>
              <input type="number" id="fGpa" placeholder="3.50" step="0.01" min="0" max="4" value="${isEdit ? s.gpa : ""}" />
              <span class="form-error" id="errGpa"></span>
            </div>
            <div class="form-group">
              <label for="fDate">Enrollment Date <span class="req">*</span></label>
              <input type="date" id="fDate" value="${isEdit ? s.enrollDate : ""}" />
              <span class="form-error" id="errDate"></span>
            </div>
          </div>
          <div class="form-actions">
            ${isEdit ? '<button type="button" class="btn-ghost btn-sm" id="cancelEdit">Cancel</button>' : ""}
            <button type="submit" class="btn-primary btn-sm">
              <i class="fa-solid ${isEdit ? "fa-floppy-disk" : "fa-plus"}"></i> ${isEdit ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════
     UI — Event Handling
  ═══════════════════════════════════════════════════ */

  function bindEvents() {
    // Navigation
    document.addEventListener("click", (ev) => {
      const item = ev.target.closest(".nav-item");
      if (item) {
        ev.preventDefault();
        switchView(item.dataset.view);
        if (window.innerWidth <= 860) $("#sidebar").classList.remove("open");
      }
    });

    // Hamburger
    $("#hamburger").addEventListener("click", () => {
      $("#sidebar").classList.toggle("open");
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener("click", (ev) => {
      if (
        window.innerWidth <= 860 &&
        !$("#sidebar").contains(ev.target) &&
        !$("#hamburger").contains(ev.target)
      ) {
        $("#sidebar").classList.remove("open");
      }
    });

    // Search
    $("#searchInput").addEventListener("input", (ev) => {
      state.setFilters({ search: ev.target.value });
      const clear = $("#searchClear");
      clear.classList.toggle("visible", !!ev.target.value);
      if (state.view !== "students") switchView("students");
      else renderStudentsView();
    });

    $("#searchClear").addEventListener("click", () => {
      const input = $("#searchInput");
      input.value = "";
      state.setFilters({ search: "" });
      $("#searchClear").classList.remove("visible");
      if (state.view !== "students") switchView("students");
      else renderStudentsView();
    });

    // Filter chips (delegated)
    $("#view-students").addEventListener("click", (ev) => {
      const chip = ev.target.closest(".chip");
      if (!chip) return;
      $$(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.setFilters({ grade: chip.dataset.grade });
      renderStudentsView();
    });

    // Sort columns (delegated)
    $("#view-students").addEventListener("click", (ev) => {
      const th = ev.target.closest("th.sortable");
      if (!th) return;
      const col = th.dataset.sort;
      const { sort, dir } = state.filters;
      if (sort === col) {
        state.filters.dir = dir === "asc" ? "desc" : "asc";
      } else {
        state.filters.sort = col;
        state.filters.dir = "asc";
      }
      renderStudentsView();
    });

    // Student row click -> detail
    $("#view-students").addEventListener("click", (ev) => {
      const row = ev.target.closest("tr[data-id]");
      if (!row || ev.target.closest(".actions-cell")) return;
      openDetail(row.dataset.id);
    });

    // Action buttons (edit/delete)
    $("#view-students").addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === "edit") {
        state.editingId = id;
        state.view = "add";
        renderCurrentView();
        updateNavAndTitle();
        renderFormView();
        bindFormEvents();
      }
      if (btn.dataset.action === "delete") {
        openConfirm(id);
      }
    });

    // Attendance marking (delegated)
    $("#view-attendance").addEventListener("click", (ev) => {
      const btn = ev.target.closest(".att-btn[data-action]");
      if (!btn) return;
      StudentManager.markAttendance(btn.dataset.id, btn.dataset.action);
      renderAttendanceView();
      showToast("Attendance recorded.", "info");
    });

    // Recent student click
    document.addEventListener("click", (ev) => {
      const li = ev.target.closest(".recent-li[data-id]");
      if (li) openDetail(li.dataset.id);
    });

    // Link to add student from empty state
    document.addEventListener("click", (ev) => {
      const link = ev.target.closest("[data-view]");
      if (link && link.tagName === "A") {
        ev.preventDefault();
        switchView(link.dataset.view);
      }
    });

    // Empty state add button
    document.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".empty-state .btn-primary[data-view]");
      if (btn) switchView(btn.dataset.view);
    });

    // Theme toggle
    $("#themeToggle").addEventListener("click", () => {
      state.toggleTheme();
      $("#themeToggle i").className =
        `fa-solid ${state.theme === "dark" ? "fa-moon" : "fa-sun"}`;
    });

    // Shortcuts panel
    $("#shortcutsToggle").addEventListener("click", () => {
      $("#shortcutsPanel").classList.toggle("open");
    });

    document.addEventListener("click", (ev) => {
      const panel = $("#shortcutsPanel");
      if (
        panel.classList.contains("open") &&
        !ev.target.closest("#shortcutsPanel") &&
        !ev.target.closest("#shortcutsToggle")
      ) {
        panel.classList.remove("open");
      }
    });

    // Modal close
    $("#detailClose").addEventListener("click", () =>
      closeModal("detailOverlay"),
    );
    $("#detailOverlay").addEventListener("click", (ev) => {
      if (ev.target === $("#detailOverlay")) closeModal("detailOverlay");
    });

    $("#confirmCancel").addEventListener("click", () =>
      closeModal("confirmOverlay"),
    );
    $("#confirmOk").addEventListener("click", () => {
      const id = $("#confirmOverlay").dataset.deleteId;
      if (id) {
        StudentManager.delete(id);
        delete $("#confirmOverlay").dataset.deleteId;
        closeModal("confirmOverlay");
        renderAll();
        showToast("Student removed.", "success");
      }
    });

    // Export
    $("#exportBtn").addEventListener("click", () => {
      const csv = StudentManager.exportCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quantio-students-${Utils.today()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Export downloaded.", "success");
    });

    // Import
    $("#importInput").addEventListener("change", (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = StudentManager.importCSV(e.target.result);
        renderAll();
        showToast(
          `Import: ${result.added} added, ${result.skipped} skipped.`,
          result.errors.length ? "error" : "success",
        );
      };
      reader.readAsText(file);
      ev.target.value = "";
    });

    // &mdash;
    // Bulk attendance
    document.addEventListener("click", (ev) => {
      if (ev.target.id === "markAllPresent") {
        StudentManager.getAll().forEach((s) =>
          StudentManager.markAttendance(s.id, "present"),
        );
        renderAttendanceView();
        showToast("All marked present.", "success");
      }
      if (ev.target.id === "markAllAbsent") {
        StudentManager.getAll().forEach((s) =>
          StudentManager.markAttendance(s.id, "absent"),
        );
        renderAttendanceView();
        showToast("All marked absent.", "info");
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (ev) => {
      if (
        ev.target.tagName === "INPUT" ||
        ev.target.tagName === "SELECT" ||
        ev.target.tagName === "TEXTAREA"
      )
        return;

      switch (ev.key) {
        case "1":
          if (!ev.ctrlKey && !ev.metaKey) {
            switchView("dashboard");
            ev.preventDefault();
          }
          break;
        case "2":
          if (!ev.ctrlKey && !ev.metaKey) {
            switchView("students");
            ev.preventDefault();
          }
          break;
        case "3":
          if (!ev.ctrlKey && !ev.metaKey) {
            switchView("attendance");
            ev.preventDefault();
          }
          break;
        case "n":
        case "N":
          switchView("add");
          ev.preventDefault();
          break;
        case "/":
          $("#searchInput").focus();
          ev.preventDefault();
          break;
        case "t":
        case "T":
          state.toggleTheme();
          $("#themeToggle i").className =
            `fa-solid ${state.theme === "dark" ? "fa-moon" : "fa-sun"}`;
          ev.preventDefault();
          break;
        case "Escape":
          if ($("#detailOverlay").classList.contains("open"))
            closeModal("detailOverlay");
          if ($("#confirmOverlay").classList.contains("open"))
            closeModal("confirmOverlay");
          if ($("#shortcutsPanel").classList.contains("open"))
            $("#shortcutsPanel").classList.remove("open");
          ev.preventDefault();
          break;
        case "?":
          $("#shortcutsPanel").classList.toggle("open");
          ev.preventDefault();
          break;
      }
    });

    // Form submit delegation (must rebind on each form render)
    bindFormEvents();
  }

  function bindFormEvents() {
    const form = $("#studentForm");
    if (!form) return;

    // Remove old listener by cloning
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      handleFormSubmit(newForm);
    });

    const cancelBtn = newForm.querySelector("#cancelEdit");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        state.editingId = null;
        state.view = "students";
        renderCurrentView();
        updateNavAndTitle();
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     Form Logic
  ═══════════════════════════════════════════════════ */

  function handleFormSubmit(form) {
    clearErrors();

    const data = {
      name: form.querySelector("#fName").value,
      studentId: form.querySelector("#fId").value,
      email: form.querySelector("#fEmail").value,
      grade: form.querySelector("#fGrade").value,
      gpa: form.querySelector("#fGpa").value,
      enrollDate: form.querySelector("#fDate").value,
    };

    const editId = form.querySelector("#editingId").value;
    const result = editId
      ? StudentManager.update(editId, data)
      : StudentManager.add(data);

    if (!result.ok) {
      showFieldError(result.field, result.error);
      return;
    }

    showToast(
      `${result.student.name} ${editId ? "updated" : "added"} successfully!`,
      "success",
    );
    state.editingId = null;
    switchView("students");
  }

  function showFieldError(field, msg) {
    const map = {
      name: "errName",
      studentId: "errId",
      email: "errEmail",
      grade: "errGrade",
      gpa: "errGpa",
      enrollDate: "errDate",
    };
    const inputMap = {
      name: "fName",
      studentId: "fId",
      email: "fEmail",
      grade: "fGrade",
      gpa: "fGpa",
      enrollDate: "fDate",
    };
    if (map[field]) $(`#${map[field]}`).textContent = msg;
    if (inputMap[field]) $(`#${inputMap[field]}`).classList.add("invalid");
  }

  function clearErrors() {
    ["errName", "errId", "errEmail", "errGrade", "errGpa", "errDate"].forEach(
      (id) => {
        const el = $(`#${id}`);
        if (el) el.textContent = "";
      },
    );
    ["fName", "fId", "fEmail", "fGrade", "fGpa", "fDate"].forEach((id) => {
      const el = $(`#${id}`);
      if (el) el.classList.remove("invalid");
    });
  }

  /* ═══════════════════════════════════════════════════
     Modal Helpers
  ═══════════════════════════════════════════════════ */

  function openDetail(id) {
    const s = StudentManager.getById(id);
    if (!s) return;

    $("#detailAvatar").textContent = s.initials;
    $("#detailName").textContent = s.name;
    $("#detailId").textContent = s.studentId;

    const pct = s.attendancePct;
    const date = s.enrollDate
      ? new Date(s.enrollDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

    $("#detailGrid").innerHTML = `
      <div class="detail-item"><span class="detail-item-label">Email</span><span class="detail-item-value">${Utils.esc(s.email)}</span></div>
      <div class="detail-item"><span class="detail-item-label">Grade Level</span><span class="detail-item-value">Grade ${s.grade}</span></div>
      <div class="detail-item"><span class="detail-item-label">GPA</span><span class="detail-item-value" style="color:${s.gpaTier === "high" ? "var(--success)" : s.gpaTier === "low" ? "var(--danger)" : "var(--warning)"}">${s.gpa.toFixed(2)}</span></div>
      <div class="detail-item"><span class="detail-item-label">Enrolled</span><span class="detail-item-value">${date}</span></div>
      <div class="detail-item"><span class="detail-item-label">Attendance</span><span class="detail-item-value">${pct !== null ? pct + "%" : "No records"}</span></div>
      <div class="detail-item"><span class="detail-item-label">Days Recorded</span><span class="detail-item-value">${Object.keys(s.attendance).length}</span></div>
    `;

    $("#detailOverlay").classList.add("open");
  }

  function openConfirm(id) {
    const s = StudentManager.getById(id);
    if (!s) return;
    $("#confirmOverlay").dataset.deleteId = id;
    $("#confirmMsg").textContent =
      `Remove ${s.name} (${s.studentId})? This cannot be undone.`;
    $("#confirmOverlay").classList.add("open");
  }

  function closeModal(id) {
    $(`#${id}`).classList.remove("open");
  }

  /* ═══════════════════════════════════════════════════
     Toast
  ═══════════════════════════════════════════════════ */

  function showToast(msg, type = "info") {
    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-xmark",
      info: "fa-circle-info",
      warning: "fa-triangle-exclamation",
    };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${Utils.esc(msg)}</span>`;
    $("#toastContainer").appendChild(toast);

    setTimeout(() => {
      toast.classList.add("removing");
      toast.addEventListener("animationend", () => toast.remove(), {
        once: true,
      });
    }, 3000);
  }

  /* ═══════════════════════════════════════════════════
     View Routing
  ═══════════════════════════════════════════════════ */

  function switchView(name) {
    state.view = name;
    state.editingId = null;
    renderCurrentView();
    updateNavAndTitle();
  }

  function renderCurrentView() {
    $$(".view").forEach((v) => v.classList.remove("active"));

    const viewMap = {
      dashboard: "view-dashboard",
      students: "view-students",
      attendance: "view-attendance",
      add: "view-add",
    };

    const target = $(`#${viewMap[state.view]}`);
    if (target) target.classList.add("active");

    switch (state.view) {
      case "dashboard":
        renderDashboard();
        break;
      case "students":
        renderStudentsView();
        break;
      case "attendance":
        renderAttendanceView();
        break;
      case "add":
        renderFormView();
        bindFormEvents();
        break;
    }
  }

  function updateNavAndTitle() {
    const titles = {
      dashboard: "Dashboard",
      students: "Students",
      attendance: "Attendance",
      add: "Add Student",
    };

    $$(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.view === state.view);
    });

    if (state.view === "add" && state.editingId) {
      $("#pageTitle").textContent = "Edit Student";
    } else {
      $("#pageTitle").textContent = titles[state.view] || "";
    }
  }

  function renderAll() {
    renderCurrentView();
    if (state.view === "dashboard") renderDashboard();
  }

  /* ═══════════════════════════════════════════════════
     Init
  ═══════════════════════════════════════════════════ */

  function init() {
    StudentManager.init();
    seedData();

    // Initial state sync from theme
    state.setTheme(state.theme);

    renderLayout();
    bindEvents();
    renderDashboard();
    updateNavAndTitle();

    // Restore theme icon
    $("#themeToggle i").className =
      `fa-solid ${state.theme === "dark" ? "fa-moon" : "fa-sun"}`;

    // Remove activity from seeding
    state.activity.length = 0;

    // Expose for debugging
    window.Quantio = { state, StudentManager, switchView, showToast };
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { switchView, showToast };
})();
