import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { createJob, getJob, updateJob } from "../services/jobService";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "../utils";

const EMPTY = {
  title: "", company_name: "", description: "", location: "", salary: "",
  employment_type: "Full-time", experience_level: "Fresher", required_skills: "", eligibility: "",
};

// Used for both "Add Job" and "Edit Job" (when the URL contains an id).
export default function AddJob() {
  const { id } = useParams();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    getJob(id)
      .then((d) => setForm({ ...EMPTY, ...d.job }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const f of ["title", "company_name", "description", "location", "required_skills"]) {
      if (!String(form[f]).trim()) return setError(`${f.replace("_", " ")} is required.`);
    }
    setError("");
    setBusy(true);
    try {
      const data = id ? await updateJob(id, form) : await createJob(form);
      notify(data.message);
      navigate("/recruiter/jobs");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <h1>{id ? "Edit Job" : "Add New Job"}</h1>
      <form className="card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <div><label>Job Title *</label><input name="title" value={form.title} onChange={handleChange} /></div>
          <div><label>Company Name *</label><input name="company_name" value={form.company_name} onChange={handleChange} /></div>
          <div><label>Location *</label><input name="location" value={form.location} onChange={handleChange} /></div>
          <div><label>Salary Range</label><input name="salary" value={form.salary} onChange={handleChange} placeholder="₹4 - 6 LPA" /></div>
          <div>
            <label>Employment Type</label>
            <select name="employment_type" value={form.employment_type} onChange={handleChange}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Experience Level</label>
            <select name="experience_level" value={form.experience_level} onChange={handleChange}>
              {EXPERIENCE_LEVELS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="full"><label>Required Skills * (comma separated)</label><input name="required_skills" value={form.required_skills} onChange={handleChange} /></div>
          <div className="full"><label>Job Description *</label><textarea name="description" rows="5" value={form.description} onChange={handleChange} /></div>
          <div className="full"><label>Eligibility Criteria</label><textarea name="eligibility" rows="3" value={form.eligibility || ""} onChange={handleChange} /></div>
        </div>
        <div className="quick-links">
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : id ? "Update Job" : "Post Job"}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/recruiter/jobs")}>Cancel</button>
        </div>
      </form>
    </>
  );
}
