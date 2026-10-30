import { request } from "./api";

const toQuery = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => value && params.append(key, value));
  const text = params.toString();
  return text ? "?" + text : "";
};

export const getJobs = (filters) => request("/jobs/search" + toQuery(filters));
export const getJob = (id) => request(`/jobs/${id}`);
export const getJobStats = () => request("/jobs/stats");
export const getMyJobs = () => request("/jobs/mine");
export const createJob = (data) => request("/jobs", { method: "POST", body: data });
export const updateJob = (id, data) => request(`/jobs/${id}`, { method: "PUT", body: data });
export const deleteJob = (id) => request(`/jobs/${id}`, { method: "DELETE" });
