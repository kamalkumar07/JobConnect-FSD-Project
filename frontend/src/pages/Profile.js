import { useEffect, useRef, useState } from "react";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { getProfile, updateProfile, uploadResume } from "../services/applicationService";

export default function Profile() {
  const { notify } = useToast();
  const fileInput = useRef(null);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => getProfile().then((d) => setForm(d.profile)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (!form) return error ? <div className="alert alert-error">{error}</div> : <Loader />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await updateProfile(form);
      notify(data.message);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    const file = fileInput.current.files[0];
    if (!file) return notify("Please choose a PDF file first.", "error");
    if (!file.name.toLowerCase().endsWith(".pdf")) return notify("Only PDF files are allowed.", "error");
    if (file.size > 2 * 1024 * 1024) return notify("File is too large. Maximum size is 2 MB.", "error");
    try {
      const data = await uploadResume(file);
      notify(data.message);
      fileInput.current.value = "";
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const field = (label, name, type = "text") => (
    <div>
      <label>{label}</label>
      <input type={type} name={name} value={form[name] || ""} onChange={handleChange} disabled={!editing || name === "email"} />
    </div>
  );

  return (
    <>
      <div className="section-head">
        <h1>My Profile</h1>
        {!editing && <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <form className="card" onSubmit={handleSave}>
        <h3>Personal Information</h3>
        <div className="form-grid">
          {field("Full Name", "name")}
          {field("Email", "email")}
          {field("Phone Number", "phone")}
          {field("College Name", "college")}
          {field("Course", "course")}
          {field("Graduation Year", "graduation_year", "number")}
          <div className="full">
            <label>Skills (comma separated)</label>
            <textarea name="skills" rows="2" value={form.skills || ""} onChange={handleChange} disabled={!editing} />
          </div>
        </div>
        {editing && (
          <div className="quick-links">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save Changes"}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setEditing(false); load(); }}>Cancel</button>
          </div>
        )}
      </form>

      <div className="card">
        <h3>Resume</h3>
        <p className="muted">{form.has_resume ? "✓ A resume is uploaded. Upload a new PDF to replace it." : "No resume uploaded yet. You need one to apply for jobs."}</p>
        <div className="upload-row">
          <input type="file" accept="application/pdf,.pdf" ref={fileInput} />
          <button className="btn btn-accent btn-sm" onClick={handleUpload}>Upload PDF</button>
        </div>
        <p className="muted small">PDF only, maximum 2 MB.</p>
      </div>
    </>
  );
}
