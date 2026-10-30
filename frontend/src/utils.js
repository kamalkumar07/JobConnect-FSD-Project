export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];
export const EXPERIENCE_LEVELS = ["Fresher", "0-1 years", "1-3 years", "3+ years"];
export const STATUSES = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"];

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function statusClass(status) {
  return "badge badge-" + status.toLowerCase().replace(/\s+/g, "-");
}

export function dashboardPath(role) {
  return { student: "/student/dashboard", recruiter: "/recruiter/dashboard", admin: "/admin/dashboard" }[role] || "/";
}
