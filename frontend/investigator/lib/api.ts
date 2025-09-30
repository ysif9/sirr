import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests
});

// Response Interceptor for handling 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // A 401 error is expected for login or OTP attempts with bad credentials.
    // We only want to trigger a global logout for 401s that occur *after*
    // a user is already authenticated, indicating an expired session.
    if (error.response && error.response.status === 401) {
      const isLoginAttempt = originalRequest.url.endsWith('/token/');
      const isOtpAttempt = originalRequest.url.endsWith('/token/verify-totp/');
      
      if (!isLoginAttempt && !isOtpAttempt) {
        console.error("Authentication Error: Your session may have expired.", error.response.data);
        // Dispatch a global event that the AuthContext can listen for to trigger a logout
        window.dispatchEvent(new Event('auth-error'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;