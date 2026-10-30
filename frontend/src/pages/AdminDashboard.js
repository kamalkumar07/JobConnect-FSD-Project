import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import {
  deleteAdminJob, deleteAdminUser, getAdminDashboard, getAdminJobs, getAdminUsers,
} from "../services/applicationService";
import { formatDate } from "../utils";

export default function AdminDashboard() {
  const { notify } = useToast();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("users");
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([getAdminDashboard(), getAdminUsers(), getAdminJobs()])
      .then(([d, u, j]) => setData({ stats: d.stats, users: u.users, jobs: j.jobs }))
      .catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (label, action) => {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    try {
      const res = await action();
      notify(res.message);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <Loader />;
  const s = data.stats;

  return (
    <>
      <h1>Admin Dashboard</h1>
      <div className="stat-cards">
        <div className="stat-card"><span>Total Students</span><strong>{s.total_students}</strong></div>
        <div className="stat-card"><span>Total Recruiters</span><strong>{s.total_recruiters}</strong></div>
        <div className="stat-card"><span>Total Jobs</span><strong>{s.total_jobs}</strong></div>
        <div className="stat-card"><span>Total Applications</span><strong>{s.total_applications}</strong></div>
      </div>

      <div className="tabs">
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users</button>
        <button className={tab === "jobs" ? "active" : ""} onClick={() => setTab("jobs")}>Jobs</button>
      </div>

      <div className="card table-wrap">
        {tab === "users" ? (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>College / Company</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td><span className="badge badge-applied">{u.role}</span></td>
                  <td>{u.organization || "—"}</td><td>{formatDate(u.created_at)}</td>
                  <td>{u.role !== "admin" && <button className="btn btn-danger btn-sm" onClick={() => remove(u.name, () => deleteAdminUser(u.id))}>Delete</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Applicants</th><th>Posted</th><th></th></tr></thead>
            <tbody>
              {data.jobs.map((j) => (
                <tr key={j.id}>
                  <td><Link to={`/jobs/${j.id}`}>{j.title}</Link></td><td>{j.company_name}</td><td>{j.location}</td>
                  <td>{j.applicant_count}</td><td>{formatDate(j.created_at)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(j.title, () => deleteAdminJob(j.id))}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
