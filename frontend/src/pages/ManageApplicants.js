import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { getRecruiterApplications, resumeUrl, updateApplicationStatus } from "../services/applicationService";
import { STATUSES, formatDate, statusClass } from "../utils";

export default function ManageApplicants() {
  const { jobId } = useParams();
  const { notify } = useToast();
  const [apps, setApps] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setApps(null);
    getRecruiterApplications(jobId).then((d) => setApps(d.applications)).catch((e) => setError(e.message));
  }, [jobId]);

  const handleStatus = async (app, status) => {
    try {
      await updateApplicationStatus(app.id, status);
      setApps(apps.map((a) => (a.id === app.id ? { ...a, status } : a)));
      notify(`Status changed to ${status}.`);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!apps) return <Loader />;

  return (
    <>
      <div className="section-head">
        <h1>{jobId ? "Applicants for this Job" : "All Applicants"}</h1>
        {jobId && <Link to="/recruiter/applicants">View all applicants</Link>}
      </div>
      {apps.length === 0 ? <div className="card empty">No applications received yet.</div> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Applicant</th><th>Job</th><th>College / Course</th><th>Skills</th><th>Applied</th><th>Resume</th><th>Status</th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong><br /><span className="muted small">{a.email}</span></td>
                  <td>{a.job_title}</td>
                  <td>{a.college}<br /><span className="muted small">{a.course}</span></td>
                  <td className="small">{a.skills || "—"}</td>
                  <td>{formatDate(a.applied_at)}</td>
                  <td><a className="btn btn-outline btn-sm" href={resumeUrl(a.id)}>Download</a></td>
                  <td>
                    <span className={statusClass(a.status)}>{a.status}</span>
                    <select value={a.status} onChange={(e) => handleStatus(a, e.target.value)} className="status-select">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
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
