import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { applyForJob } from "../services/applicationService";
import { getJob } from "../services/jobService";
import { formatDate } from "../utils";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getJob(id)
      .then((data) => setJob(data.job))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleApply = async () => {
    if (!user) return navigate("/login", { state: { from: `/jobs/${id}` } });
    setBusy(true);
    try {
      const data = await applyForJob(id);
      notify(data.message);
      setJob({ ...job, has_applied: true });
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="container section"><div className="alert alert-error">{error}</div><Link to="/jobs">← Back to jobs</Link></div>;

  const canApply = !user || user.role === "student";

  return (
    <div className="container section narrow-wide">
      <Link to="/jobs">← Back to jobs</Link>
      <div className="card detail-head">
        <div className="company-avatar big">{job.company_name.charAt(0).toUpperCase()}</div>
        <div className="grow">
          <h1>{job.title}</h1>
          <p className="muted">{job.company_name} · Posted {formatDate(job.created_at)}</p>
          <div className="tags">
            <span className="tag">📍 {job.location}</span>
            <span className="tag">💰 {job.salary || "Not disclosed"}</span>
            <span className="tag">{job.employment_type}</span>
            <span className="tag">{job.experience_level}</span>
          </div>
        </div>
        {canApply && (
          <button className="btn btn-primary" onClick={handleApply} disabled={busy || job.has_applied}>
            {job.has_applied ? "✓ Applied" : busy ? "Applying..." : "Apply Now"}
          </button>
        )}
      </div>

      <div className="card detail-body">
        <h3>Job Description</h3><p className="pre">{job.description}</p>
        <h3>Required Skills</h3>
        <div className="tags">{job.required_skills.split(",").map((s) => <span className="tag tag-blue" key={s}>{s.trim()}</span>)}</div>
        {job.eligibility && (<><h3>Eligibility Criteria</h3><p className="pre">{job.eligibility}</p></>)}
        <h3>Experience</h3><p>{job.experience_level}</p>
        {job.company_description && (<><h3>About {job.company_name}</h3><p className="pre">{job.company_description}</p></>)}
      </div>
    </div>
  );
}
