export default function About() {
  return (
    <div className="container section narrow">
      <h1>About JobConnect</h1>
      <p>
        JobConnect is a student job portal built as a full stack academic project. Students can discover jobs,
        upload a resume, apply and track their status. Recruiters can post jobs, review applicants and update
        application results.
      </p>
      <div className="grid grid-3">
        <div className="card"><h3>🎓 For Students</h3><p className="muted">Search and filter jobs, apply with one click and follow every application.</p></div>
        <div className="card"><h3>🏢 For Recruiters</h3><p className="muted">Post openings, manage applicants and download resumes in one place.</p></div>
        <div className="card"><h3>🛡️ For Admins</h3><p className="muted">Monitor users, jobs and platform activity from a single dashboard.</p></div>
      </div>
    </div>
  );
}
