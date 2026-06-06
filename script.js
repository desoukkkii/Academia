/**
 * EduTrack — Student Management System
 * script.js
 *
 * Architecture:
 *  - Student         : data model
 *  - AttendanceRecord: per-day presence tracking
 *  - StudentManager  : CRUD + LocalStorage persistence
 *  - UI              : rendering + event wiring
 */

"use strict";

/* ════════════════════════════════════════════════
   1. Student Model
════════════════════════════════════════════════ */
class Student {
  /**
   * @param {object} data
   * @param {string} data.id        – unique internal key (auto-generated)
   * @param {string} data.name      – full name
   * @param {string} data.studentId – human-readable student ID (e.g. STU-001)
   * @param {string} data.email
   * @param {number} data.grade     – 9 | 10 | 11 | 12
   * @param {number} data.gpa       – 0.0 – 4.0
   * @param {string} data.enrollDate – ISO date string
   * @param {object} data.attendance – { "YYYY-MM-DD": "present"|"absent", … }
   * @param {string} data.createdAt  – ISO date string
   */
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name.trim();
    this.studentId = data.studentId.trim().toUpperCase();
    this.email = data.email.trim().toLowerCase();
    this.grade = Number(data.grade);
    this.gpa = parseFloat(Number(data.gpa).toFixed(2));
    this.enrollDate = data.enrollDate;
    this.attendance = data.attendance || {};
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /** Initials for avatar rendering */
  get initials() {
    return this.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  /** Attendance percentage across all recorded days */
  get attendancePercentage() {
    const days = Object.values(this.attendance);
    if (!days.length) return null;
    const present = days.filter((v) => v === "present").length;
    return Math.round((present / days.length) * 100);
  }

  /** GPA tier string: 'high' | 'mid' | 'low' */
  get gpaTier() {
    if (this.gpa >= 3.5) return "high";
    if (this.gpa >= 2.5) return "mid";
    return "low";
  }
}

/* ════════════════════════════════════════════════
   2. StudentManager
════════════════════════════════════════════════ */
class StudentManager {
  static STORAGE_KEY = "edutrack_students";

  constructor() {
    /** @type {Student[]} */
    this._students = [];
    this._load();
  }

  /* ── Persistence ── */

  _load() {
    try {
      const raw = localStorage.getItem(StudentManager.STORAGE_KEY);
      if (raw) {
        this._students = JSON.parse(raw).map((d) => new Student(d));
      }
    } catch (e) {
      console.error("EduTrack: failed to load from storage", e);
      this._students = [];
    }
  }

  _save() {
    try {
      localStorage.setItem(
        StudentManager.STORAGE_KEY,
        JSON.stringify(this._students),
      );
    } catch (e) {
      console.error("EduTrack: failed to save to storage", e);
    }
  }

  /* ── CRUD ── */

  /** @returns {Student[]} */
  getAll() {
    return [...this._students];
  }

  /** @param {string} id @returns {Student|undefined} */
  getById(id) {
    return this._students.find((s) => s.id === id);
  }

  /**
   * Add a new student.
   * @param {object} data
   * @returns {{ ok: boolean, error?: string, student?: Student }}
   */
  add(data) {
    const validation = this._validate(data);
    if (!validation.ok) return validation;

    // Unique student ID check
    if (
      this._students.some(
        (s) => s.studentId === data.studentId.trim().toUpperCase(),
      )
    ) {
      return {
        ok: false,
        field: "studentId",
        error: "Student ID already exists.",
      };
    }
    // Unique email check
    if (
      this._students.some((s) => s.email === data.email.trim().toLowerCase())
    ) {
      return { ok: false, field: "email", error: "Email already registered." };
    }

    const student = new Student(data);
    this._students.unshift(student); // newest first
    this._save();
    return { ok: true, student };
  }

  /**
   * Update an existing student.
   * @param {string} id
   * @param {object} data
   * @returns {{ ok: boolean, error?: string, student?: Student }}
   */
  update(id, data) {
    const idx = this._students.findIndex((s) => s.id === id);
    if (idx === -1) return { ok: false, error: "Student not found." };

    const validation = this._validate(data);
    if (!validation.ok) return validation;

    // Unique checks excluding current student
    if (
      this._students.some(
        (s) =>
          s.id !== id && s.studentId === data.studentId.trim().toUpperCase(),
      )
    ) {
      return {
        ok: false,
        field: "studentId",
        error: "Student ID already exists.",
      };
    }
    if (
      this._students.some(
        (s) => s.id !== id && s.email === data.email.trim().toLowerCase(),
      )
    ) {
      return { ok: false, field: "email", error: "Email already registered." };
    }

    const existing = this._students[idx];
    const updated = new Student({
      ...existing,
      ...data,
      id,
      attendance: existing.attendance,
      createdAt: existing.createdAt,
    });
    this._students[idx] = updated;
    this._save();
    return { ok: true, student: updated };
  }

  /**
   * Delete a student by internal id.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const before = this._students.length;
    this._students = this._students.filter((s) => s.id !== id);
    if (this._students.length < before) {
      this._save();
      return true;
    }
    return false;
  }

  /**
   * Record today's attendance for a student.
   * @param {string} id
   * @param {'present'|'absent'} status
   */
  markAttendance(id, status) {
    const student = this.getById(id);
    if (!student) return;
    const today = new Date().toISOString().slice(0, 10);
    student.attendance[today] = status;
    this._save();
  }

  /* ── Queries ── */

  /**
   * Filter & sort.
   * @param {{ search?: string, grade?: string, sort?: string, dir?: 'asc'|'desc' }} opts
   * @returns {Student[]}
   */
  filter({ search = "", grade = "all", sort = "", dir = "asc" } = {}) {
    let list = this.getAll();

    // Grade filter
    if (grade !== "all") {
      list = list.filter((s) => String(s.grade) === String(grade));
    }

    // Text search (name or student ID)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q),
      );
    }

    // Sort
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
  }

  /** Dashboard statistics */
  stats() {
    const all = this.getAll();
    const total = all.length;
    const avgGpa = total ? all.reduce((s, st) => s + st.gpa, 0) / total : 0;
    const byGrade = { 9: 0, 10: 0, 11: 0, 12: 0 };
    all.forEach((s) => {
      byGrade[s.grade] = (byGrade[s.grade] || 0) + 1;
    });
    const topGpa = total ? Math.max(...all.map((s) => s.gpa)) : null;

    const attPcts = all
      .map((s) => s.attendancePercentage)
      .filter((p) => p !== null);
    const avgAtt = attPcts.length
      ? Math.round(attPcts.reduce((a, b) => a + b, 0) / attPcts.length)
      : null;

    return { total, avgGpa, byGrade, topGpa, avgAtt };
  }

  /* ── Validation ── */

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      return { ok: false, field: "email", error: "Invalid email format." };
    }
    if (!data.grade || ![9, 10, 11, 12].includes(Number(data.grade))) {
      return { ok: false, field: "grade", error: "Select a valid grade." };
    }
    const gpa = parseFloat(data.gpa);
    if (isNaN(gpa) || gpa < 0 || gpa > 4) {
      return {
        ok: false,
        field: "gpa",
        error: "GPA must be between 0.0 and 4.0.",
      };
    }
    if (!data.enrollDate)
      return {
        ok: false,
        field: "enrollDate",
        error: "Enrollment date is required.",
      };
    return { ok: true };
  }

  /* ── CSV I/O ── */

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
      s.attendancePercentage !== null ? `${s.attendancePercentage}%` : "N/A",
    ]);
    return [headers, ...rows].map((r) => r.join(",")).join("\n");
  }

  /**
   * Import students from CSV text.
   * Expected columns: Name, Student ID, Email, Grade, GPA, Enrolled
   * @param {string} csv
   * @returns {{ added: number, skipped: number, errors: string[] }}
   */
  importCSV(csv) {
    const lines = csv.trim().split("\n").filter(Boolean);
    const results = { added: 0, skipped: 0, errors: [] };
    if (lines.length < 2) {
      results.errors.push("CSV has no data rows.");
      return results;
    }

    // Detect and skip header row
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

      const data = {
        name: cols[0],
        studentId: cols[1],
        email: cols[2],
        grade: cols[3],
        gpa: cols[4],
        enrollDate: cols[5] || new Date().toISOString().slice(0, 10),
      };

      const res = this.add(data);
      if (res.ok) results.added++;
      else {
        results.skipped++;
        results.errors.push(`Row ${i + 1}: ${res.error}`);
      }
    }
    return results;
  }
}

/* ════════════════════════════════════════════════
   3. UI Controller
════════════════════════════════════════════════ */
class UI {
  constructor(manager) {
    /** @type {StudentManager} */
    this.manager = manager;

    // State
    this.currentView = "dashboard";
    this.currentFilter = "all";
    this.searchQuery = "";
    this.sortCol = "";
    this.sortDir = "asc";
    this.pendingDeleteId = null;

    this._bindElements();
    this._bindEvents();
    this.switchView("dashboard");
  }

  /* ── Element refs ── */
  _bindElements() {
    this.$ = (id) => document.getElementById(id);
    this.e = {
      // sidebar
      navItems: document.querySelectorAll(".nav-item"),
      hamburger: this.$("hamburger"),
      sidebar: this.$("sidebar"),
      exportBtn: this.$("exportBtn"),
      importInput: this.$("importInput"),
      pageTitle: this.$("pageTitle"),

      // views
      views: document.querySelectorAll(".view"),

      // dashboard
      statTotal: this.$("statTotal"),
      statAvgGpa: this.$("statAvgGpa"),
      statAttendance: this.$("statAttendance"),
      statTopGpa: this.$("statTopGpa"),
      gradeBars: this.$("gradeBars"),
      recentStudents: this.$("recentStudents"),

      // students
      searchInput: this.$("searchInput"),
      searchClear: this.$("searchClear"),
      filterChips: this.$("filterChips"),
      studentCount: this.$("studentCount"),
      studentsBody: this.$("studentsBody"),
      studentsTable: this.$("studentsTable"),
      emptyState: this.$("emptyState"),

      // attendance
      attDate: this.$("attDate"),
      attPresent: this.$("attPresent"),
      attAbsent: this.$("attAbsent"),
      attendanceGrid: this.$("attendanceGrid"),

      // form
      studentForm: this.$("studentForm"),
      editingId: this.$("editingId"),
      formTitle: this.$("formTitle"),
      submitBtn: this.$("submitBtn"),
      cancelEdit: this.$("cancelEdit"),
      fName: this.$("fName"),
      fId: this.$("fId"),
      fEmail: this.$("fEmail"),
      fGrade: this.$("fGrade"),
      fGpa: this.$("fGpa"),
      fDate: this.$("fDate"),

      // modals
      detailOverlay: this.$("detailOverlay"),
      detailClose: this.$("detailClose"),
      detailAvatar: this.$("detailAvatar"),
      detailName: this.$("detailName"),
      detailId: this.$("detailId"),
      detailGrid: this.$("detailGrid"),
      confirmOverlay: this.$("confirmOverlay"),
      confirmMsg: this.$("confirmMsg"),
      confirmCancel: this.$("confirmCancel"),
      confirmOk: this.$("confirmOk"),

      toastContainer: this.$("toastContainer"),
    };
  }

  /* ── Event wiring ── */
  _bindEvents() {
    const e = this.e;

    // Nav
    e.navItems.forEach((item) => {
      item.addEventListener("click", (ev) => {
        ev.preventDefault();
        this.switchView(item.dataset.view);
        // Auto-close sidebar on mobile
        if (window.innerWidth <= 860) e.sidebar.classList.remove("open");
      });
    });

    // Hamburger
    e.hamburger.addEventListener("click", () =>
      e.sidebar.classList.toggle("open"),
    );
    document.addEventListener("click", (ev) => {
      if (
        window.innerWidth <= 860 &&
        !e.sidebar.contains(ev.target) &&
        !e.hamburger.contains(ev.target)
      ) {
        e.sidebar.classList.remove("open");
      }
    });

    // Search
    e.searchInput.addEventListener("input", () => {
      this.searchQuery = e.searchInput.value;
      e.searchClear.style.display = this.searchQuery ? "block" : "none";
      this._renderStudentsTable();
    });
    e.searchClear.addEventListener("click", () => {
      e.searchInput.value = "";
      this.searchQuery = "";
      e.searchClear.style.display = "none";
      this._renderStudentsTable();
    });

    // Filter chips
    e.filterChips.addEventListener("click", (ev) => {
      const chip = ev.target.closest(".chip");
      if (!chip) return;
      e.filterChips
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      this.currentFilter = chip.dataset.grade;
      this._renderStudentsTable();
    });

    // Sort columns
    e.studentsTable.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const col = th.dataset.sort;
        if (this.sortCol === col) {
          this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
        } else {
          this.sortCol = col;
          this.sortDir = "asc";
        }
        this._updateSortIcons();
        this._renderStudentsTable();
      });
    });

    // Form submit
    e.studentForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      this._handleFormSubmit();
    });

    // Cancel edit
    e.cancelEdit.addEventListener("click", () => this._resetForm());

    // Export
    e.exportBtn.addEventListener("click", () => this._exportCSV());

    // Import
    e.importInput.addEventListener("change", (ev) => this._importCSV(ev));

    // Detail modal close
    e.detailClose.addEventListener("click", () =>
      this._closeModal(e.detailOverlay),
    );
    e.detailOverlay.addEventListener("click", (ev) => {
      if (ev.target === e.detailOverlay) this._closeModal(e.detailOverlay);
    });

    // Confirm modal
    e.confirmCancel.addEventListener("click", () =>
      this._closeModal(e.confirmOverlay),
    );
    e.confirmOk.addEventListener("click", () => {
      if (this.pendingDeleteId) {
        const s = this.manager.getById(this.pendingDeleteId);
        this.manager.delete(this.pendingDeleteId);
        this.pendingDeleteId = null;
        this._closeModal(e.confirmOverlay);
        this._renderAll();
        this.showToast(`${s?.name || "Student"} removed.`, "success");
      }
    });

    // Keyboard: close modals on Escape
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        if (e.detailOverlay.classList.contains("open"))
          this._closeModal(e.detailOverlay);
        if (e.confirmOverlay.classList.contains("open"))
          this._closeModal(e.confirmOverlay);
      }
    });
  }

  /* ════════════════════════════════════
     View switching
  ════════════════════════════════════ */
  switchView(name) {
    this.currentView = name;

    // Update nav
    this.e.navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.view === name);
    });

    // Show view
    this.e.views.forEach((v) => {
      v.classList.toggle("active", v.id === `view-${name}`);
    });

    // Page title
    const titles = {
      dashboard: "Dashboard",
      students: "Students",
      attendance: "Attendance",
      add: "Add Student",
    };
    this.e.pageTitle.textContent = titles[name] || "";

    // Render the relevant view
    if (name === "dashboard") this._renderDashboard();
    if (name === "students") this._renderStudentsTable();
    if (name === "attendance") this._renderAttendance();
  }

  /* ════════════════════════════════════
     Dashboard
  ════════════════════════════════════ */
  _renderDashboard() {
    const s = this.manager.stats();
    const e = this.e;

    // Stat cards
    this._animateValue(e.statTotal, 0, s.total, 600, (v) => v);
    this._animateValue(e.statAvgGpa, 0, s.avgGpa, 600, (v) => v.toFixed(2));
    e.statAttendance.textContent = s.avgAtt !== null ? `${s.avgAtt}%` : "—";
    e.statTopGpa.textContent = s.topGpa !== null ? s.topGpa.toFixed(2) : "—";

    // Grade bars
    const maxCount = Math.max(...Object.values(s.byGrade), 1);
    e.gradeBars.innerHTML = [9, 10, 11, 12]
      .map(
        (g) => `
      <div class="grade-bar-row">
        <span class="grade-bar-label">Grade ${g}</span>
        <div class="grade-bar-track">
          <div class="grade-bar-fill" style="width:${(s.byGrade[g] / maxCount) * 100}%"></div>
        </div>
        <span class="grade-bar-count">${s.byGrade[g]}</span>
      </div>
    `,
      )
      .join("");

    // Recent students (last 5)
    const recent = this.manager.getAll().slice(0, 5);
    e.recentStudents.innerHTML = recent.length
      ? recent
          .map(
            (st) => `
          <li class="recent-li" onclick="app.openDetailModal('${st.id}')">
            <div class="recent-li-avatar">${this._escHtml(st.initials)}</div>
            <div>
              <div class="recent-li-name">${this._escHtml(st.name)}</div>
              <div class="recent-li-grade">Grade ${st.grade}</div>
            </div>
            <span class="recent-li-gpa">${st.gpa.toFixed(2)}</span>
          </li>
        `,
          )
          .join("")
      : '<li style="color:var(--text-dim);font-size:14px;padding:10px 0">No students yet.</li>';
  }

  /** Animate a number from 0 to target */
  _animateValue(el, from, to, ms, fmt) {
    if (to === 0) {
      el.textContent = fmt(0);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / ms, 1);
      const v = from + (to - from) * this._easeOut(p);
      el.textContent = fmt(v);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  _easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ════════════════════════════════════
     Students Table
  ════════════════════════════════════ */
  _renderStudentsTable() {
    const list = this.manager.filter({
      search: this.searchQuery,
      grade: this.currentFilter,
      sort: this.sortCol,
      dir: this.sortDir,
    });

    this.e.studentCount.textContent = `${list.length} student${list.length !== 1 ? "s" : ""}`;

    if (!list.length) {
      this.e.studentsBody.innerHTML = "";
      this.e.emptyState.classList.add("visible");
      return;
    }
    this.e.emptyState.classList.remove("visible");

    this.e.studentsBody.innerHTML = list
      .map((s) => this._renderRow(s))
      .join("");
  }

  _renderRow(s) {
    const pct = s.attendancePercentage;
    const pctStr = pct !== null ? `${pct}%` : "—";
    const date = s.enrollDate
      ? new Date(s.enrollDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

    return `
      <tr onclick="app.openDetailModal('${s.id}')">
        <td>
          <div class="td-name">
            <div class="td-avatar">${this._escHtml(s.initials)}</div>
            ${this._escHtml(s.name)}
          </div>
        </td>
        <td><span class="td-id">${this._escHtml(s.studentId)}</span></td>
        <td><span class="td-email">${this._escHtml(s.email)}</span></td>
        <td><span class="grade-badge g${s.grade}">Grade ${s.grade}</span></td>
        <td><span class="gpa-cell ${s.gpaTier}">${s.gpa.toFixed(2)}</span></td>
        <td><span class="td-date">${date}</span></td>
        <td class="actions-cell" onclick="event.stopPropagation()">
          <button class="btn-icon edit" title="Edit" onclick="app.openEdit('${s.id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon delete" title="Delete" onclick="app.confirmDelete('${s.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }

  _updateSortIcons() {
    this.e.studentsTable.querySelectorAll("th.sortable").forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
      const icon = th.querySelector("i");
      icon.className = "fa-solid fa-sort";
      if (th.dataset.sort === this.sortCol) {
        th.classList.add(this.sortDir === "asc" ? "sort-asc" : "sort-desc");
        icon.className = `fa-solid fa-sort-${this.sortDir === "asc" ? "up" : "down"}`;
      }
    });
  }

  /* ════════════════════════════════════
     Attendance
  ════════════════════════════════════ */
  _renderAttendance() {
    const today = new Date();
    const todayK = today.toISOString().slice(0, 10);
    this.e.attDate.textContent = today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const all = this.manager.getAll();
    const present = all.filter(
      (s) => s.attendance[todayK] === "present",
    ).length;
    const absent = all.filter((s) => s.attendance[todayK] === "absent").length;

    this.e.attPresent.textContent = `${present} present`;
    this.e.attAbsent.textContent = `${absent} absent`;

    if (!all.length) {
      this.e.attendanceGrid.innerHTML =
        '<p style="color:var(--text-dim);font-size:14px">No students yet.</p>';
      return;
    }

    this.e.attendanceGrid.innerHTML = all
      .map((s) => {
        const todayStatus = s.attendance[todayK] || "";
        const pct = s.attendancePercentage;
        const pctStr = pct !== null ? `${pct}% overall` : "No records";
        const pctClass =
          pct === null ? "" : pct >= 80 ? "high" : pct >= 60 ? "mid" : "low";

        return `
        <div class="att-card ${todayStatus}" data-sid="${s.id}">
          <div class="att-card-avatar">${this._escHtml(s.initials)}</div>
          <div class="att-card-info">
            <div class="att-card-name">${this._escHtml(s.name)}</div>
            <div class="att-card-sub">Grade ${s.grade} &middot; <span class="att-pct ${pctClass}">${pctStr}</span></div>
          </div>
          <div class="att-toggle">
            <button class="att-btn ${todayStatus === "present" ? "active-p" : ""}"
              onclick="app.markAtt('${s.id}','present')">P</button>
            <button class="att-btn ${todayStatus === "absent" ? "active-a" : ""}"
              onclick="app.markAtt('${s.id}','absent')">A</button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  /* ════════════════════════════════════
     Form (Add / Edit)
  ════════════════════════════════════ */
  _handleFormSubmit() {
    this._clearFormErrors();
    const data = {
      name: this.e.fName.value,
      studentId: this.e.fId.value,
      email: this.e.fEmail.value,
      grade: this.e.fGrade.value,
      gpa: this.e.fGpa.value,
      enrollDate: this.e.fDate.value,
    };

    const editId = this.e.editingId.value;
    const result = editId
      ? this.manager.update(editId, data)
      : this.manager.add(data);

    if (!result.ok) {
      this._showFormError(result.field, result.error);
      return;
    }

    const action = editId ? "updated" : "added";
    this.showToast(`${result.student.name} ${action} successfully!`, "success");
    this._resetForm();
    this._renderAll();
    if (editId) this.switchView("students");
  }

  _showFormError(field, msg) {
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
    if (map[field]) document.getElementById(map[field]).textContent = msg;
    if (inputMap[field])
      document.getElementById(inputMap[field]).classList.add("invalid");
  }

  _clearFormErrors() {
    ["errName", "errId", "errEmail", "errGrade", "errGpa", "errDate"].forEach(
      (id) => {
        document.getElementById(id).textContent = "";
      },
    );
    ["fName", "fId", "fEmail", "fGrade", "fGpa", "fDate"].forEach((id) => {
      document.getElementById(id).classList.remove("invalid");
    });
  }

  _resetForm() {
    this.e.studentForm.reset();
    this._clearFormErrors();
    this.e.editingId.value = "";
    this.e.formTitle.textContent = "Add New Student";
    this.e.submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Student';
    this.e.cancelEdit.style.display = "none";
    this.e.pageTitle.textContent = "Add Student";
  }

  openEdit(id) {
    const s = this.manager.getById(id);
    if (!s) return;

    this.switchView("add");
    this.e.editingId.value = id;
    this.e.formTitle.textContent = "Edit Student";
    this.e.pageTitle.textContent = "Edit Student";
    this.e.submitBtn.innerHTML =
      '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
    this.e.cancelEdit.style.display = "inline-flex";

    this.e.fName.value = s.name;
    this.e.fId.value = s.studentId;
    this.e.fEmail.value = s.email;
    this.e.fGrade.value = s.grade;
    this.e.fGpa.value = s.gpa;
    this.e.fDate.value = s.enrollDate;
  }

  /* ════════════════════════════════════
     Detail Modal
  ════════════════════════════════════ */
  openDetailModal(id) {
    const s = this.manager.getById(id);
    if (!s) return;

    this.e.detailAvatar.textContent = s.initials;
    this.e.detailName.textContent = s.name;
    this.e.detailId.textContent = s.studentId;

    const pct = s.attendancePercentage;
    const date = s.enrollDate
      ? new Date(s.enrollDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

    this.e.detailGrid.innerHTML = `
      <div class="detail-item"><span class="detail-item-label">Email</span><span class="detail-item-value">${this._escHtml(s.email)}</span></div>
      <div class="detail-item"><span class="detail-item-label">Grade Level</span><span class="detail-item-value">Grade ${s.grade}</span></div>
      <div class="detail-item"><span class="detail-item-label">GPA</span><span class="detail-item-value ${s.gpaTier === "high" ? "gpa-high" : s.gpaTier === "low" ? "gpa-low" : "gpa-mid"}">${s.gpa.toFixed(2)}</span></div>
      <div class="detail-item"><span class="detail-item-label">Enrolled</span><span class="detail-item-value">${date}</span></div>
      <div class="detail-item"><span class="detail-item-label">Attendance</span><span class="detail-item-value">${pct !== null ? pct + "%" : "No records"}</span></div>
      <div class="detail-item"><span class="detail-item-label">Days Recorded</span><span class="detail-item-value">${Object.keys(s.attendance).length}</span></div>
    `;

    this.e.detailOverlay.classList.add("open");
  }

  /* ════════════════════════════════════
     Delete Confirm Modal
  ════════════════════════════════════ */
  confirmDelete(id) {
    const s = this.manager.getById(id);
    if (!s) return;
    this.pendingDeleteId = id;
    this.e.confirmMsg.textContent = `Are you sure you want to permanently remove ${s.name} (${s.studentId})? This cannot be undone.`;
    this.e.confirmOverlay.classList.add("open");
  }

  _closeModal(overlay) {
    overlay.classList.remove("open");
  }

  /* ════════════════════════════════════
     Attendance marking
  ════════════════════════════════════ */
  markAtt(id, status) {
    this.manager.markAttendance(id, status);
    this._renderAttendance();
    this._renderDashboard();
    this.showToast(`Attendance recorded.`, "info");
  }

  /* ════════════════════════════════════
     CSV Export / Import
  ════════════════════════════════════ */
  _exportCSV() {
    const csv = this.manager.exportCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edutrack-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("Export downloaded.", "success");
  }

  _importCSV(ev) {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = this.manager.importCSV(e.target.result);
      this._renderAll();
      const msg = `Import complete: ${result.added} added, ${result.skipped} skipped.`;
      this.showToast(msg, result.errors.length ? "error" : "success");
      if (result.errors.length) console.warn("Import errors:", result.errors);
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    ev.target.value = "";
  }

  /* ════════════════════════════════════
     Toast Notifications
  ════════════════════════════════════ */
  showToast(msg, type = "info") {
    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-xmark",
      info: "fa-circle-info",
    };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${this._escHtml(msg)}</span>`;
    this.e.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("removing");
      toast.addEventListener("animationend", () => toast.remove(), {
        once: true,
      });
    }, 3200);
  }

  /* ════════════════════════════════════
     Helpers
  ════════════════════════════════════ */
  _renderAll() {
    if (this.currentView === "dashboard") this._renderDashboard();
    if (this.currentView === "students") this._renderStudentsTable();
    if (this.currentView === "attendance") this._renderAttendance();
    // Also refresh dashboard stats silently when on other views
    if (this.currentView !== "dashboard") {
      const s = this.manager.stats();
      this.e.statTotal.textContent = s.total;
      this.e.statAvgGpa.textContent = s.avgGpa.toFixed(2);
      this.e.statAttendance.textContent =
        s.avgAtt !== null ? `${s.avgAtt}%` : "—";
      this.e.statTopGpa.textContent =
        s.topGpa !== null ? s.topGpa.toFixed(2) : "—";
    }
  }

  /** Escape HTML to prevent XSS */
  _escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

/* ════════════════════════════════════════════════
   4. Bootstrap — seed data + launch
════════════════════════════════════════════════ */

/** Seed 5 sample students if storage is empty */
function seedSampleData(manager) {
  if (manager.getAll().length > 0) return; // already has data

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

  // Seed some historical attendance
  const today = new Date();
  samples.forEach((data, i) => {
    const result = manager.add(data);
    if (!result.ok || !result.student) return;
    const id = result.student.id;
    // Add 10 days of random attendance history
    for (let d = 10; d >= 1; d--) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - d);
      const key = dt.toISOString().slice(0, 10);
      const status = Math.random() > 0.15 ? "present" : "absent";
      manager.markAttendance(id, status);
      // Manually set the date key since markAttendance uses today
      const s = manager.getById(id);
      if (s) {
        const todayKey = new Date().toISOString().slice(0, 10);
        s.attendance[key] = status;
        delete s.attendance[todayKey]; // remove the "today" key just set
      }
    }
    manager._save();
  });
}

/* ── Init ── */
const manager = new StudentManager();
seedSampleData(manager);

// Expose to global so inline onclick handlers can reach it
const app = new UI(manager);
