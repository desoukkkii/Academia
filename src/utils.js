export function uid() {
  return crypto.randomUUID();
}

export function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function dateStr(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isoDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatLongDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAttendancePct(student) {
  const days = Object.values(student.attendance);
  if (!days.length) return null;
  const present = days.filter((v) => v === "present").length;
  return Math.round((present / days.length) * 100);
}

export function getGpaTier(gpa) {
  if (gpa >= 3.5) return "high";
  if (gpa >= 2.5) return "mid";
  return "low";
}
