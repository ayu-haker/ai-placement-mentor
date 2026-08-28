const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ai-placement-mentor-wtvo.onrender.com/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

function clearToken(): void {
  localStorage.removeItem("auth_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }
    const error = await response.json().catch(() => ({
      error: "An unexpected error occurred",
    }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  setToken,
  clearToken,
  getToken,

  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getProfile: () => request("/auth/profile"),
    updateProfile: (data: any) =>
      request("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    getAllUsers: () => request("/auth/users"),
  },

  resumes: {
    upload: (formData: FormData) =>
      request("/resumes/upload", {
        method: "POST",
        body: formData,
      }),
    getAll: () => request("/resumes"),
    getById: (id: string) => request(`/resumes/${id}`),
    delete: (id: string) =>
      request(`/resumes/${id}`, { method: "DELETE" }),
  },

  interviews: {
    start: (data: { mode: string; skills?: string[] }) =>
      request("/interviews/start", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    submitAnswer: (data: {
      interviewId: string;
      questionId: string;
      answer: string;
    }) =>
      request("/interviews/answer", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    complete: (id: string) =>
      request(`/interviews/${id}/complete`, { method: "POST" }),
    getAll: () => request("/interviews"),
    getById: (id: string) => request(`/interviews/${id}`),
  },

  skills: {
    analyze: (data: { targetRole: string }) =>
      request("/skills/analyze", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getAll: () => request("/skills"),
    getById: (id: string) => request(`/skills/${id}`),
  },

  roadmaps: {
    generate: (data: { targetRole: string; durationWeeks?: number }) =>
      request("/roadmaps/generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getAll: () => request("/roadmaps"),
    getById: (id: string) => request(`/roadmaps/${id}`),
    updateProgress: (id: string, data: { weekNumber: number; completed: boolean }) =>
      request(`/roadmaps/${id}/progress`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  counselor: {
    sendMessage: (message: string) =>
      request("/counselor/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    getHistory: () => request("/counselor/history"),
    clearHistory: () =>
      request("/counselor/history", { method: "DELETE" }),
  },

  dashboard: {
    get: () => request("/dashboard"),
    getAdmin: () => request("/dashboard/admin"),
  },
};
