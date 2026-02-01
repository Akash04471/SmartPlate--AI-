const API_BASE = "http://127.0.0.1:5050/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // 🔥 IMPORTANT: handle non-JSON responses safely
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON:\n${text}`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");

  return data;
}
