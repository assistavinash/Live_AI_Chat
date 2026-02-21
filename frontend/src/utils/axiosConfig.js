import axios from 'axios';

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

/**
 * Setup axios interceptor to handle 401 responses
 * When a 401 is received, clear auth data and redirect to login
 */
export const setupAxiosInterceptor = (navigate, dispatch) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // If status is 401 (Unauthorized), user's session has expired or token is invalid
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized - clearing session and redirecting to login');
        
        // Clear localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        
        // Clear sessionStorage
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        
        // If dispatch is available, reset auth state
        if (dispatch) {
          try {
            const { resetAuthState } = require('../redux/slices/chatSlice');
            dispatch(resetAuthState());
          } catch (e) {
            console.error('Error resetting auth state:', e);
          }
        }
        
        // Redirect to login
        if (navigate) {
          navigate('/login', { replace: true });
        }
      }
      
      return Promise.reject(error);
    }
  );
};
