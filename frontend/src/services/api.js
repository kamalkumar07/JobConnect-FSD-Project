// One small wrapper around fetch(). Every service uses it.
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function request(path, { method = "GET", body, formData } = {}) {
  const options = { method, credentials: "include", headers: {} }; // credentials: send the session cookie
  if (formData) {
    options.body = formData; // the browser sets the multipart header itself
  } else if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch (err) {
    throw new Error("Cannot reach the server. Is the Flask backend running?");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const apiUrl = API_URL;
