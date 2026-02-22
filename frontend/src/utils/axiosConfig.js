import axios from 'axios';

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// Setup interceptor immediately on module load
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If status is 401 (Unauthorized), user's session has expired or token is invalid
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized - session expired or invalid token');
      
      // Clear localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      
      // Clear sessionStorage
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      // Redirect to login by reloading with login path
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Setup axios interceptor to handle 401 responses
 * This function can still be called from components if needed for advanced setup
 * @deprecated Use axiosInstance directly - interceptor is now initialized on module load
 */
export const setupAxiosInterceptor = (navigate, dispatch) => {
  // Interceptor is already set up on module load
  // This function is kept for backwards compatibility
};
