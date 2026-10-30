import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { getRecruiterDashboard } from "../services/applicationService";
import { getMyJobs } from "../services/jobService";
import { formatDate, statusClass } from "../utils";

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getRecruiterDashboard(), getMyJobs()])
      .then(([dash, jobs]) => setData({ ...dash, jobs: jobs.jobs }))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <Loader />;

  return (
    <>
      <h1>Recruiter Dashboard</h1>
      <div className="stat-cards">
        <div className="stat-card"><span>Total Jobs Posted</span><strong>{data.stats.total_jobs}</strong></div>
        <div className="stat-card"><span>Applications Received</span><strong>{data.stats.total_applications}</strong></div>
        <div className="stat-card"><span>Active Job Postings</span><strong>{data.jobs.length}</strong></div>
        <div className="stat-card"><span>Shortlisted Candidates</span><strong>{data.stats.shortlisted}</strong></div>
      </div>

      <div className="quick-links">
        <Link className="btn btn-primary" to="/recruiter/jobs/new">➕ Add New Job</Link>
        <Link className="btn btn-outline" to="/recruiter/jobs">Manage Jobs</Link>
        <Link className="btn btn-outline" to="/recruiter/applicants">View Applicants</Link>
      </div>

      <div className="card">
        <h3>Recent Applications</h3>
        {data.recent.length === 0 ? <p className="muted">No applications yet.</p> : data.recent.map((a) => (
          <div className="list-row" key={a.id}>
            <div><strong>{a.name}</strong><p className="muted small">{a.job_title} · {formatDate(a.applied_at)}</p></div>
            <span className={statusClass(a.status)}>{a.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
