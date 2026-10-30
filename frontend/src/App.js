import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import StudentDashboard from "./pages/StudentDashboard";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ManageApplicants from "./pages/ManageApplicants";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const student = (page) => <ProtectedRoute roles={["student"]}>{page}</ProtectedRoute>;
const recruiter = (page) => <ProtectedRoute roles={["recruiter"]}>{page}</ProtectedRoute>;
const admin = (page) => <ProtectedRoute roles={["admin"]}>{page}</ProtectedRoute>;

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route path="/student/dashboard" element={student(<StudentDashboard />)} />
          <Route path="/student/applications" element={student(<MyApplications />)} />
          <Route path="/student/profile" element={student(<Profile />)} />

          <Route path="/recruiter/dashboard" element={recruiter(<RecruiterDashboard />)} />
          <Route path="/recruiter/jobs" element={recruiter(<ManageJobs />)} />
          <Route path="/recruiter/jobs/new" element={recruiter(<AddJob />)} />
          <Route path="/recruiter/jobs/:id/edit" element={recruiter(<AddJob />)} />
          <Route path="/recruiter/applicants" element={recruiter(<ManageApplicants />)} />
          <Route path="/recruiter/applicants/:jobId" element={recruiter(<ManageApplicants />)} />

          <Route path="/admin/dashboard" element={admin(<AdminDashboard />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
