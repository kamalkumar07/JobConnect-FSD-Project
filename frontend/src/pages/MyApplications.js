import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { getStudentApplications } from "../services/applicationService";
import { formatDate, statusClass } from "../utils";

export default function MyApplications() {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentApplications().then((d) => setApps(d.applications)).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!apps) return <Loader />;

  return (
    <>
      <h1>My Applications</h1>
      {apps.length === 0 ? (
        <div className="card empty">You have not applied for any jobs yet. <Link to="/jobs">Browse jobs</Link></div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Job Title</th><th>Company</th><th>Applied On</th><th>Status</th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td><Link to={`/jobs/${a.job_id}`}>{a.title}</Link></td>
                  <td>{a.company_name}</td>
                  <td>{formatDate(a.applied_at)}</td>
                  <td><span className={statusClass(a.status)}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
