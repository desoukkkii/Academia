# Academia

> A modern, single-page student intelligence platform for managing students, tracking attendance, and visualizing academic data.

**[Live Demo](https://academia-beta-swart.vercel.app/)**

---

## Highlights

- **Dashboard** — animated stat counters, grade distribution bars, recent students, and a live activity timeline
- **Student Management** — full CRUD with inline validation, duplicate checks, and LocalStorage persistence
- **Attendance Tracking** — daily present/absent marking with bulk "mark all" actions and per-student attendance percentages
- **CSV Import & Export** — download student data as CSV or bulk-import from a file with validation and duplicate detection
- **Dark / Light Theme** — instant toggle via UI button or the `T` keyboard shortcut; preference persists across sessions
- **Keyboard Shortcuts** — navigate views, open forms, and toggle theme without leaving the keyboard
- **Responsive Design** — card layout on mobile, table layout on desktop, bottom nav on small screens, sidebar on larger ones

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19 (Hooks + `useReducer`) |
| Styling | Tailwind CSS v4 with CSS custom properties |
| Build | Vite 8 |
| Icons | Font Awesome 6 |
| Typography | Inter Tight / JetBrains Mono |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Seed data is loaded automatically on first visit.

## Build & Preview

```bash
npm run build
npm run preview
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Dashboard |
| `2` | Students |
| `3` | Attendance |
| `N` | New student |
| `T` | Toggle theme |
| `?` | Toggle shortcuts panel |
| `Esc` | Close modal / panel |

## Project Structure

```
src/
├── main.jsx                     Entry point
├── index.css                    Tailwind + theme variables
├── App.jsx                      Root component with routing
├── context/AppContext.jsx       State management (reducer + context)
├── components/
│   ├── AddStudentForm.jsx       Add / edit student form
│   ├── AttendanceView.jsx       Daily attendance tracking
│   ├── BottomNav.jsx            Mobile bottom navigation
│   ├── ConfirmModal.jsx         Delete confirmation dialog
│   ├── Dashboard.jsx            Overview with stats and charts
│   ├── Sidebar.jsx              Desktop sidebar navigation
│   ├── ShortcutsPanel.jsx       Keyboard shortcuts help
│   ├── StudentDetailModal.jsx   Student detail view
│   ├── StudentsView.jsx         Student list with filters
│   ├── Toast.jsx                Toast notification system
│   └── Topbar.jsx               Top bar with search and actions
├── services/storage.js          LocalStorage persistence
├── data/seed.js                 Sample student data
└── utils.js                     Helper functions
```

## License

[MIT](LICENSE) &mdash; Mohammed Desouki, 2026
