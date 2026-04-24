// Centralized API wrapper for SmartPlate backend.
// All authenticated requests go through `apiFetch` which automatically
// attaches the JWT token from localStorage.

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return `http://${host}:5051/api`;
  }
  return "http://localhost:5051/api";
};
const API_BASE = getApiBase();

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sp_token");
}

export function setToken(token: string) {
  localStorage.setItem("sp_token", token);
}

export function clearToken() {
  localStorage.removeItem("sp_token");
}

export function getUser(): { id: string; name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sp_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: { id: string; name: string; email: string }) {
  localStorage.setItem("sp_user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("sp_user");
}

// Generic fetch wrapper that adds auth headers
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Handle 401 → redirect to login
  if (res.status === 401) {
    clearToken();
    clearUser();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  // 204 No Content (e.g. DELETE)
  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `API error ${res.status}`);
  }
  return json;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signup(name: string, email: string, password: string) {
  return apiFetch<{ message: string; email: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function verifySignup(email: string, code: string) {
  const res = await apiFetch<{ user: any; token: string }>("/auth/verify-signup", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
  setToken(res.token);
  setUser(res.user);
  return res;
}

export async function login(email: string, password: string) {
  return apiFetch<{ mfaRequired?: boolean; user?: any; token?: string; message?: string; email?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function verify2FA(email: string, code: string) {
  const res = await apiFetch<{ user: any; token: string }>("/auth/verify-2fa", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
  setToken(res.token);
  setUser(res.user);
  return res;
}

export function logout() {
  clearToken();
  clearUser();
  if (typeof window !== "undefined") window.location.href = "/auth/login";
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile() {
  return apiFetch<{ data: any }>("/profile");
}

export async function upsertProfile(data: Record<string, any>) {
  return apiFetch<{ data: any }>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── Meals ───────────────────────────────────────────────────────────────────

export async function getMealLogs(page = 1, limit = 20, date?: string, includeItems = true) {
  const d = date ? `&date=${date}` : "";
  const items = includeItems ? `&includeItems=true` : "";
  return apiFetch<{ data: any[]; meta: any }>(`/meal-logs?page=${page}&limit=${limit}${d}${items}`);
}


export async function createMealLog(mealType: string, notes?: string) {
  return apiFetch<{ data: any }>("/meal-logs", {
    method: "POST",
    body: JSON.stringify({ mealType, notes }),
  });
}

export async function addMealLogItem(logId: string, item: {
  foodName: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
}) {
  return apiFetch<{ data: any }>(`/meal-logs/${logId}/items`, {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function deleteMealLog(logId: string) {
  return apiFetch(`/meal-logs/${logId}`, { method: "DELETE" });
}

export async function deleteMealLogItem(logId: string, itemId: string) {
  return apiFetch(`/meal-logs/${logId}/items/${itemId}`, { method: "DELETE" });
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getDailyStats(date?: string) {
  const q = date ? `?date=${date}` : "";
  return apiFetch<{ data: any }>(`/meal-logs/stats/daily${q}`);
}

export async function getWeeklyStats(startDate?: string) {
  const q = startDate ? `?startDate=${startDate}` : "";
  return apiFetch<{ data: any[]; meta: any }>(`/meal-logs/stats/weekly${q}`);
}

// ─── Nutrition ───────────────────────────────────────────────────────────────

export async function searchNutrition(query: string) {
  return apiFetch<any[]>(`/nutrition/search?q=${encodeURIComponent(query)}`);
}

export async function interpretMeal(text: string) {
  return apiFetch<{ data: any[] }>("/nutrition/interpret", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}


// ─── Progress ───────────────────────────────────────────────────────────────

export async function logWeight(weightKg: number) {
  return apiFetch("/progress/weight", {
    method: "POST",
    body: JSON.stringify({ weightKg }),
  });
}

export async function getWeightHistory() {
  return apiFetch<any[]>("/progress/weight-history");
}

export async function getAdherenceStats() {
  return apiFetch<{ 
    totalPoints: number; 
    weeklyAwardCount: number; 
    recentAdherence: any[]; 
    awards: any[] 
  }>("/progress/adherence");
}

// ─── AI Coach ────────────────────────────────────────────────────────────────

export async function getCoachInsights() {
  return apiFetch<{ 
    enabled: boolean; 
    data?: {
      intake: { calories: number; protein: number; carbs: number; fat: number };
      targets: { calories: number; protein: number; carbs: number; fat: number };
      advice: string;
      suggestion: { type: string; amount: number; unit: string } | null;
    };
    message?: string;
  }>("/coach/insights");
}

export async function chatWithCoach(message: string, history: { role: 'user' | 'model'; content: string }[] = []) {
  return apiFetch<{ message: string }>("/coach/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

// ─── Social Tribes ─────────────────────────────────────────────────────────

export async function listTribes() {
  return apiFetch<{ data: any[] }>("/tribes");
}

export async function joinTribe(slug: string) {
  return apiFetch(`/tribes/${slug}/join`, { method: "POST" });
}

export async function getLeaderboard(slug: string) {
  return apiFetch<{ tribe: string; data: any[] }>(`/tribes/${slug}/leaderboard`);
}

export async function seedTribes() {
  return apiFetch("/tribes/seed", { method: "POST" });
}

// ─── Health Protocols ────────────────────────────────────────────────────────
export async function getProtocols(status?: string) {
  const q = status ? `?status=${status}` : "";
  return apiFetch<{ data: any[] }>(`/protocols${q}`);
}

export async function getProtocolById(id: string) {
  return apiFetch<{ data: any }>(`/protocols/${id}`);
}

export async function createProtocol(data: any) {
  return apiFetch<{ data: any }>("/protocols", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProtocol(id: string, data: any) {
  return apiFetch<{ data: any }>(`/protocols/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProtocol(id: string) {
  return apiFetch(`/protocols/${id}`, { method: "DELETE" });
}

export async function getProtocolSummary() {
  return apiFetch<{ 
    data: { 
      activeProtocols: any[]; 
      todayStats: any; 
      date: string 
    } 
  }>("/protocols/summary");
}

// ─── AI Vision ──────────────────────────────────────────────────────────────

export async function analyzeImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const token = getToken();
  const res = await fetch(`${API_BASE}/nutrition/analyze-image`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Vision analysis failed");
  }

  return res.json();
}




