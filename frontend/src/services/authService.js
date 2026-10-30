import { request } from "./api";

export const registerUser = (data) => request("/auth/register", { method: "POST", body: data });
export const loginUser = (data) => request("/auth/login", { method: "POST", body: data });
export const logoutUser = () => request("/auth/logout", { method: "POST" });
export const getCurrentUser = () => request("/auth/me");
