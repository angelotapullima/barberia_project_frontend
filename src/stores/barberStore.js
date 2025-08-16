import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance

export const useBarberStore = defineStore('barbers', {
  state: () => ({
    barbers: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async getAllBarbers() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/barbers`); // Use 'api' instance and relative path
        this.barbers = response.data;
        return response.data; // Return the data
      } catch (error) {
        this.error = 'Error al cargar los barberos.';
        console.error(error);
        return []; // Return empty array on error
      } finally {
        this.isLoading = false;
      }
    },

    async addBarber(barber) {
      try {
        const response = await api.post(`/barbers`, barber); // Use 'api' instance and relative path
        this.barbers.push(response.data);
        await this.getAllBarbers(); // Refresh list
      } catch (error) {
        this.error = 'Error al añadir el barbero.';
        console.error(error);
        throw error; // Re-throw to allow component to handle
      }
    },

    async updateBarber(barber) {
      try {
        await api.put(`/barbers/${barber.id}`, barber); // Use 'api' instance and relative path
        await this.getAllBarbers(); // Refresh list
      } catch (error) {
        this.error = 'Error al actualizar el barbero.';
        console.error(error);
        throw error; // Re-throw to allow component to handle
      }
    },

    async deleteBarber(id) {
      try {
        await api.delete(`/barbers/${id}`); // Use 'api' instance and relative path
        await this.getAllBarbers(); // Refresh list
      } catch (error) {
        this.error = 'Error al eliminar el barbero.';
        console.error(error);
        throw error; // Re-throw to allow component to handle
      }
    },
  },
});
