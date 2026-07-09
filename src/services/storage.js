const KEY = "quantio_students";

export function loadStudents() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudents(students) {
  try {
    localStorage.setItem(KEY, JSON.stringify(students));
  } catch (e) {
    console.warn("Quantio: save failed", e);
  }
}
