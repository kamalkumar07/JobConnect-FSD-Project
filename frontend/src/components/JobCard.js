import { Link } from "react-router-dom";
import { formatDate } from "../utils";

export default function JobCard({ job }) {
  return (
    <div className="card job-card">
      <div className="job-card-top">
        <div className="company-avatar">{job.company_name.charAt(0).toUpperCase()}</div>
        <div>
          <h3>{job.title}</h3>
          <p className="muted">{job.company_name}</p>
        </div>
      </div>
      <div className="tags">
        <span className="tag">📍 {job.location}</span>
        <span className="tag">{job.employment_type}</span>
        <span className="tag">{job.experience_level}</span>
      </div>
      <p className="salary">{job.salary || "Salary not disclosed"}</p>
      <div className="job-card-bottom">
        <span className="muted small">Posted {formatDate(job.created_at)}</span>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">View Details</Link>
      </div>
    </div>
  );
}
