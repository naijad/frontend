const API_BASE_URL = "https://backend-eight-steel-35.vercel.app/api";
// for deployment, change the above to "https://backend-eight-steel-35.vercel.app/api"

export type ApiRequestOptions = RequestInit & { token?: string };

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = options.token ?? localStorage.getItem("ajora_token");
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error("Unable to connect to the Ajora server. Make sure the backend is running on port 2000.");
  }

  let data: any = null;
  try { data = await response.json(); } catch { /* empty response */ }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed with status ${response.status}.`);
  }

  return data as T;
}
