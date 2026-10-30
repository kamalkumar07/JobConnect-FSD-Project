import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useToast } from "../context/ToastContext";

const EMPTY = {
  name: "", email: "", password: "", phone: "", role: "student",
  college: "", course: "", graduation_year: "", company_name: "", company_description: "",
};

export default function Register() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (form.name.trim().length < 2) return "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Please enter a valid email.";
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      return "Password needs 8+ characters with letters and numbers.";
    if (!/^\+?[0-9]{10,15}$/.test(form.phone)) return "Phone number must contain 10 to 15 digits.";
    if (form.role === "student") {
      if (!form.college.trim() || !form.course.trim()) return "College and course are required.";
      const year = Number(form.graduation_year);
      if (!year || year < 2000 || year > 2100) return "Please enter a valid graduation year.";
    } else if (!form.company_name.trim()) {
      return "Company name is required.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    setBusy(true);
    try {
      await registerUser(form);
      notify("Registration successful. Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card wide" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="role-switch">
          {["student", "recruiter"].map((r) => (
            <button type="button" key={r} className={form.role === r ? "active" : ""} onClick={() => setForm({ ...form, role: r })}>
              {r === "student" ? "🎓 Student" : "🏢 Recruiter"}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <div><label>Full Name</label><input name="name" value={form.name} onChange={handleChange} /></div>
          <div><label>Phone Number</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" /></div>
          <div><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} /></div>
          <div><label>Password</label><input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" /></div>
          {form.role === "student" ? (
            <>
              <div><label>College Name</label><input name="college" value={form.college} onChange={handleChange} /></div>
              <div><label>Course</label><input name="course" value={form.course} onChange={handleChange} placeholder="B.Tech CSE" /></div>
              <div><label>Graduation Year</label><input type="number" name="graduation_year" value={form.graduation_year} onChange={handleChange} placeholder="2027" /></div>
            </>
          ) : (
            <>
              <div><label>Company Name</label><input name="company_name" value={form.company_name} onChange={handleChange} /></div>
              <div className="full"><label>Company Description</label><textarea name="company_description" rows="3" value={form.company_description} onChange={handleChange} /></div>
            </>
          )}
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Creating account..." : "Register"}</button>
        <p className="center muted">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
