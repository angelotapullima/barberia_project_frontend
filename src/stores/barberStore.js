import { defineStore } from 'pinia';
import axios from 'axios';

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
        const response = await axios.get(`/api/barbers`);
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
        const response = await axios.post(`/api/barbers`, barber);
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
        await axios.put(`/api/barbers/${barber.id}`, barber);
        await this.getAllBarbers(); // Refresh list
      } catch (error) {
        this.error = 'Error al actualizar el barbero.';
        console.error(error);
        throw error; // Re-throw to allow component to handle
      }
    },

    async deleteBarber(id) {
      try {
        await axios.delete(`/api/barbers/${id}`);
        await this.getAllBarbers(); // Refresh list
      } catch (error) {
        this.error = 'Error al eliminar el barbero.';
        console.error(error);
        throw error; // Re-throw to allow component to handle
      }
    },
  },
});