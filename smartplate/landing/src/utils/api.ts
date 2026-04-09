// Centralized API wrapper for SmartPlate backend.
// All authenticated requests go through `apiFetch` which automatically
// attaches the JWT token from localStorage.

const API_BASE = "http://127.0.0.1:5051/api";

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
  const res = await apiFetch<{ user: any; token: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  setToken(res.token);
  setUser(res.user);
  return res;
}

export async function login(email: string, password: string) {
  const res = await apiFetch<{ user: any; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
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


