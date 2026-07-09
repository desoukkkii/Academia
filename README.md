# Academia — Student Intelligence Platform

A modern, single-page student management system built with **React 19**, **Tailwind CSS v4**, and **Vite**.

## Features

- **Dashboard** — Stats cards with animated counters, grade distribution bars, recent students, activity timeline
- **Student CRUD** — Add, edit, delete students with validation and LocalStorage persistence
- **Attendance** — Daily presence tracking with bulk mark-all actions
- **CSV Import/Export** — Download and upload student data
- **Dark/Light Theme** — Toggle with keyboard shortcut `T` or the theme icon
- **Keyboard Shortcuts** — `1-3` views, `N` new student, `?` help, `Esc` close
- **Activity Log** — Timeline of recent changes
- **Responsive** — Works on desktop and mobile

## Tech Stack

- **React 19** with Hooks and `useReducer` for state management
- **Tailwind CSS v4** with CSS custom properties for theming
- **Vite** for fast development and optimized builds
- **Font Awesome 6** for icons
- **Inter Tight / JetBrains Mono** for typography

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Seed data is loaded automatically on first visit.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── main.jsx                 — Entry point
├── index.css                — Tailwind + theme variables
├── App.jsx                  — Root component with routing
├── context/AppContext.jsx   — State management (reducer + context)
├── components/
│   ├── AddStudentForm.jsx   — Add/edit student form
│   ├── AttendanceView.jsx   — Daily attendance tracking
│   ├── BottomNav.jsx        — Mobile bottom navigation
│   ├── ConfirmModal.jsx     — Delete confirmation dialog
│   ├── Dashboard.jsx        — Overview with stats and charts
│   ├── Sidebar.jsx          — Desktop sidebar navigation
│   ├── StudentDetailModal.jsx — Student detail view
│   ├── StudentsView.jsx     — Student list with filters
│   ├── ShortcutsPanel.jsx   — Keyboard shortcuts help
│   ├── Toast.jsx            — Toast notification system
│   └── Topbar.jsx           — Top bar with search and actions
├── services/storage.js      — LocalStorage persistence
├── data/seed.js             — Sample student data
└── utils.js                 — Helper functions
```

## License

MIT
