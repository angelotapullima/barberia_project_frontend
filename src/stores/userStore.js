import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance
import { useAuthStore } from './authStore'; // Import auth store to get token

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await api.get('/auth/users'); // Use 'api' instance and relative path
        this.users = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Error al cargar los usuarios.';
        console.error('Error fetching users:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async createUser(userData) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await api.post('/auth/users', userData); // Use 'api' instance and relative path
        this.users.push(response.data);
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Error al crear el usuario.';
        console.error('Error creating user:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateUser(id, userData) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        await api.put(`/auth/users/${id}`, userData); // Use 'api' instance and relative path
        // Actualizar el usuario en el store localmente
        const index = this.users.findIndex((user) => user.id === id);
        if (index !== -1) {
          Object.assign(this.users[index], userData);
        }
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Error al actualizar el usuario.';
        console.error('Error updating user:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteUser(id) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        await api.delete(`/auth/users/${id}`); // Use 'api' instance and relative path
        this.users = this.users.filter((user) => user.id !== id);
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Error al eliminar el usuario.';
        console.error('Error deleting user:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
