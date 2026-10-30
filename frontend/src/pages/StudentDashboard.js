import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { getStudentApplications } from "../services/applicationService";
import { getJobs, getJobStats } from "../services/jobService";
import { STATUSES, formatDate } from "../utils";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getJobStats(), getStudentApplications(), getJobs({ limit: 5 })])
      .then(([stats, apps, jobs]) => setData({ totalJobs: stats.jobs, applications: apps.applications, recent: jobs.jobs }))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <Loader />;

  const count = (status) => data.applications.filter((a) => a.status === status).length;

  return (
    <>
      <h1>Welcome, {user.name} 👋</h1>
      <div className="stat-cards">
        <div className="stat-card"><span>Available Jobs</span><strong>{data.totalJobs}</strong></div>
        <div className="stat-card"><span>Applications Submitted</span><strong>{data.applications.length}</strong></div>
        <div className="stat-card"><span>Shortlisted</span><strong>{count("Shortlisted")}</strong></div>
      </div>

      <div className="card">
        <h3>Application Status Overview</h3>
        <div className="status-row">
          {STATUSES.map((s) => (
            <div key={s} className="status-pill"><strong>{count(s)}</strong><span>{s}</span></div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-head"><h3>Recent Job Opportunities</h3><Link to="/jobs">See all</Link></div>
        {data.recent.map((job) => (
          <div className="list-row" key={job.id}>
            <div><strong>{job.title}</strong><p className="muted small">{job.company_name} · {job.location} · {formatDate(job.created_at)}</p></div>
            <Link className="btn btn-outline btn-sm" to={`/jobs/${job.id}`}>View</Link>
          </div>
        ))}
      </div>

      <div className="quick-links">
        <Link className="btn btn-primary" to="/jobs">Find Jobs</Link>
        <Link className="btn btn-outline" to="/student/applications">My Applications</Link>
        <Link className="btn btn-outline" to="/student/profile">Update Profile</Link>
      </div>
    </>
  );
}
