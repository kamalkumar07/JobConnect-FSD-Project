import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";
import { getJobs } from "../services/jobService";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "../utils";

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const initial = {
    q: searchParams.get("q") || "",
    company: searchParams.get("company") || "",
    location: searchParams.get("location") || "",
    employment_type: "",
    experience_level: "",
  };
  const [filters, setFilters] = useState(initial);
  const [applied, setApplied] = useState(initial); // filters currently used for the search
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getJobs(applied)
      .then((data) => setJobs(data.jobs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [applied]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSearch = (e) => { e.preventDefault(); setApplied(filters); };
  const handleClear = () => {
    const empty = { q: "", company: "", location: "", employment_type: "", experience_level: "" };
    setFilters(empty);
    setApplied(empty);
  };

  return (
    <div className="container section">
      <h1>Find Jobs</h1>
      <form className="card filters" onSubmit={handleSearch}>
        <input name="q" placeholder="Job title" value={filters.q} onChange={handleChange} />
        <input name="company" placeholder="Company" value={filters.company} onChange={handleChange} />
        <input name="location" placeholder="Location" value={filters.location} onChange={handleChange} />
        <select name="employment_type" value={filters.employment_type} onChange={handleChange}>
          <option value="">All job types</option>
          {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select name="experience_level" value={filters.experience_level} onChange={handleChange}>
          <option value="">All experience</option>
          {EXPERIENCE_LEVELS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-outline" onClick={handleClear}>Clear</button>
      </form>

      {loading && <Loader text="Loading jobs..." />}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && (
        <>
          <p className="muted">{jobs.length} job(s) found</p>
          {jobs.length === 0 ? <div className="card empty">No jobs match your search.</div> :
            <div className="grid">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>}
        </>
      )}
    </div>
  );
}
