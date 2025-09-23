import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for error handling (e.g., token refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // NOTE: Token refresh logic can be added here in the future.
    // For now, if a 401 occurs, we'll rely on the AuthContext to log the user out.
    if (error.response && error.response.status === 401) {
       console.error("Authentication Error:", error.response.data);
       // This could trigger a logout event
       window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;