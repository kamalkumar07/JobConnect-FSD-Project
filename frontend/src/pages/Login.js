import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { dashboardPath } from "../utils";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) return setError("Please enter your email and password.");
    setBusy(true);
    try {
      const user = await login(form);
      notify(`Welcome back, ${user.name}!`);
      navigate(location.state?.from || dashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="muted">Log in to your JobConnect account.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Your password" />
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Logging in..." : "Login"}</button>
        <p className="center muted">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
