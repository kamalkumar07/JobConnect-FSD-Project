import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { deleteJob, getMyJobs } from "../services/jobService";
import { formatDate } from "../utils";

export default function ManageJobs() {
  const { notify } = useToast();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  const load = () => getMyJobs().then((d) => setJobs(d.jobs)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? Its applications will also be removed.`)) return;
    try {
      const data = await deleteJob(job.id);
      notify(data.message);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!jobs) return <Loader />;

  return (
    <>
      <div className="section-head">
        <h1>Manage Jobs</h1>
        <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">➕ Add New Job</Link>
      </div>
      {jobs.length === 0 ? <div className="card empty">You have not posted any jobs yet.</div> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Location</th><th>Type</th><th>Posted</th><th>Applicants</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td><Link to={`/jobs/${job.id}`}>{job.title}</Link></td>
                  <td>{job.location}</td>
                  <td>{job.employment_type}</td>
                  <td>{formatDate(job.created_at)}</td>
                  <td>{job.applicant_count}</td>
                  <td className="actions">
                    <Link className="btn btn-outline btn-sm" to={`/recruiter/applicants/${job.id}`}>Applicants</Link>
                    <Link className="btn btn-outline btn-sm" to={`/recruiter/jobs/${job.id}/edit`}>Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
