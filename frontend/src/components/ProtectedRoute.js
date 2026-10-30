import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
import Sidebar from "./Sidebar";
import { dashboardPath } from "../utils";

// Only lets logged-in users with the right role see a page.
// With `sidebar`, the page is shown inside the dashboard layout.
export default function ProtectedRoute({ roles, sidebar = true, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={dashboardPath(user.role)} replace />;

  if (!sidebar) return children;
  return (
    <div className="container dash">
      <Sidebar role={user.role} />
      <main className="dash-main">{children}</main>
    </div>
  );
}
