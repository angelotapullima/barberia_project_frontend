import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore'; // Import auth store to get token

const API_URL = 'http://localhost:3000/api';

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
        const response = await axios.get(`${API_URL}/auth/users`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        this.users = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar los usuarios.';
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
        const response = await axios.post(`${API_URL}/auth/users`, userData, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        this.users.push(response.data);
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear el usuario.';
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
        await axios.put(`${API_URL}/auth/users/${id}`, userData, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        // Actualizar el usuario en el store localmente
        const index = this.users.findIndex((user) => user.id === id);
        if (index !== -1) {
          Object.assign(this.users[index], userData);
        }
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar el usuario.';
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
        await axios.delete(`${API_URL}/auth/users/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        this.users = this.users.filter((user) => user.id !== id);
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar el usuario.';
        console.error('Error deleting user:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
