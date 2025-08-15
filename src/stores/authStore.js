import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user && state.user.role === 'administrador',
  },

  actions: {
    async login(email, password) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', { // Use 'api' instance and relative path
          email,
          password,
        });
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('userToken', this.token);
        localStorage.setItem('userData', JSON.stringify(this.user));
        return true;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.error = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        } else {
          this.error =
            'Error al iniciar sesión. Por favor, inténtalo más tarde.';
        }
        console.error('Login error:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      // Opcional: redirigir al login o a la página de inicio
    },

    initializeStore() {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
      }
    },
  },
});
