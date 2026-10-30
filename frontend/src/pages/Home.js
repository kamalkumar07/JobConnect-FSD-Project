import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";
import { getJobs, getJobStats } from "../services/jobService";

const STEPS = [
  ["1", "Create your profile", "Register as a student and add your college, skills and resume."],
  ["2", "Find the right job", "Search by title, company, location, type and experience."],
  ["3", "Apply and track", "Apply in one click and follow your application status."],
];

export default function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getJobs({ limit: 6 }), getJobStats()])
      .then(([jobData, statData]) => { setJobs(jobData.jobs); setStats(statData); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set("q", title.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate("/jobs?" + params.toString());
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find Your Dream Job</h1>
          <p>Discover internships and entry-level jobs from companies that hire students and fresh graduates.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input placeholder="Job title or keyword" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button className="btn btn-accent">Search Jobs</button>
          </form>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Featured Jobs</h2>
          <Link to="/jobs">View all jobs →</Link>
        </div>
        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}
        <div className="grid">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="center">How It Works</h2>
          <div className="grid grid-3">
            {STEPS.map(([n, head, text]) => (
              <div className="card step" key={n}>
                <div className="step-number">{n}</div>
                <h3>{head}</h3>
                <p className="muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {stats && (
        <section className="container section">
          <div className="stats">
            <div><strong>{stats.jobs}</strong><span>Jobs Posted</span></div>
            <div><strong>{stats.companies}</strong><span>Companies</span></div>
            <div><strong>{stats.students}</strong><span>Students</span></div>
            <div><strong>{stats.applications}</strong><span>Applications</span></div>
          </div>
        </section>
      )}
    </>
  );
}
