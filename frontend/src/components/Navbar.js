import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { dashboardPath } from "../utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    notify("You have been logged out.");
    setOpen(false);
    navigate("/");
  };

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-mark">JC</span> JobConnect
        </Link>
        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <nav className={"nav-links" + (open ? " open" : "")}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/jobs" onClick={close}>Find Jobs</NavLink>
          <NavLink to="/about" onClick={close}>About Us</NavLink>
          {user ? (
            <>
              <NavLink to={dashboardPath(user.role)} onClick={close}>Dashboard</NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
