import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import router from '../router'; // Import the router instance

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiration and unauthorized access
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const authStore = useAuthStore();
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Token expired or unauthorized, clear token and redirect to login
      authStore.logout(); // Use the existing logout method
      router.push('/login'); // Redirect to your login route
    }
    return Promise.reject(error);
  },
);

export default api;
