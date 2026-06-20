# Quantio — Student Intelligence Platform

A modern, single-page student management system built with vanilla JavaScript.

## Features

- **Dashboard** — Stats cards, grade distribution bars, recent students, activity timeline
- **Student CRUD** — Add, edit, delete students with validation and LocalStorage persistence
- **Attendance** — Daily presence tracking with bulk mark-all actions
- **CSV Import/Export** — Download and upload student data
- **Dark/Light Theme** — Toggle with keyboard shortcut `T` or the moon icon
- **Keyboard Shortcuts** — `1-3` views, `N` new student, `/` search, `?` help, `Esc` close
- **Activity Log** — Timeline of recent changes
- **Responsive** — Works on desktop and mobile

## Architecture

```
├── index.html    — Minimal skeleton (23 lines)
├── style.css     — Complete design with CSS custom properties, glassmorphism, themes
└── script.js     — Component-based architecture with state management
```

- **State**: Observable store with subscriptions
- **Services**: Storage (LocalStorage), StudentManager (CRUD + queries), Activity tracking
- **UI**: Pure function-based rendering with template literals, event delegation

## Usage

Open `index.html` in a browser (or serve with any HTTP server). Seed data is loaded automatically on first visit.
