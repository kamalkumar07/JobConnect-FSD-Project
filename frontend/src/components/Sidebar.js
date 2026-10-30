import { NavLink } from "react-router-dom";

const LINKS = {
  student: [
    ["/student/dashboard", "📊 Dashboard"],
    ["/jobs", "🔍 Find Jobs"],
    ["/student/applications", "📄 My Applications"],
    ["/student/profile", "👤 My Profile"],
  ],
  recruiter: [
    ["/recruiter/dashboard", "📊 Dashboard"],
    ["/recruiter/jobs/new", "➕ Add New Job"],
    ["/recruiter/jobs", "💼 Manage Jobs"],
    ["/recruiter/applicants", "👥 Applicants"],
  ],
  admin: [["/admin/dashboard", "📊 Dashboard"]],
};

export default function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">{role.toUpperCase()} MENU</p>
      {(LINKS[role] || []).map(([to, label]) => (
        <NavLink key={to} to={to} end>{label}</NavLink>
      ))}
    </aside>
  );
}
