import { request, apiUrl } from "./api";

export const applyForJob = (jobId) => request(`/applications/${jobId}`, { method: "POST" });
export const getStudentApplications = () => request("/applications/student");
export const getRecruiterApplications = (jobId) =>
  request("/applications/recruiter" + (jobId ? `?job_id=${jobId}` : ""));
export const updateApplicationStatus = (id, status) =>
  request(`/applications/${id}/status`, { method: "PUT", body: { status } });
export const resumeUrl = (applicationId) => `${apiUrl}/applications/${applicationId}/resume`;

// Student profile + resume
export const getProfile = () => request("/students/profile");
export const updateProfile = (data) => request("/students/profile", { method: "PUT", body: data });
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return request("/students/resume", { method: "POST", formData });
};

// Dashboards
export const getRecruiterDashboard = () => request("/recruiters/dashboard");
export const getAdminDashboard = () => request("/admin/dashboard");
export const getAdminUsers = () => request("/admin/users");
export const getAdminJobs = () => request("/admin/jobs");
export const deleteAdminUser = (id) => request(`/admin/users/${id}`, { method: "DELETE" });
export const deleteAdminJob = (id) => request(`/admin/jobs/${id}`, { method: "DELETE" });
