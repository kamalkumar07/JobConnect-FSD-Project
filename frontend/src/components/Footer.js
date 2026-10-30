import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="logo logo-light"><span className="logo-mark">JC</span> JobConnect</div>
          <p>Connecting students with their first career opportunity.</p>
        </div>
        <div className="footer-links">
          <Link to="/jobs">Find Jobs</Link>
          <Link to="/about">About Us</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} JobConnect – Student Job Portal. Academic project.</p>
    </footer>
  );
}
