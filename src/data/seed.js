import { uid } from "../utils";

const SAMPLE_STUDENTS = [
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

function buildAttendance(daysBack = 10) {
  const attendance = {};
  const now = new Date();
  for (let d = daysBack; d >= 1; d--) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    attendance[dt.toISOString().slice(0, 10)] =
      Math.random() > 0.15 ? "present" : "absent";
  }
  return attendance;
}

export function getSeedStudents() {
  return SAMPLE_STUDENTS.map((s) => ({
    id: uid(),
    name: s.name.trim(),
    studentId: s.studentId.trim().toUpperCase(),
    email: s.email.trim().toLowerCase(),
    grade: Number(s.grade),
    gpa: Number(Number(s.gpa).toFixed(2)),
    enrollDate: s.enrollDate,
    attendance: buildAttendance(),
    createdAt: new Date().toISOString(),
  }));
}
