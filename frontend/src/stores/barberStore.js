import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useBarberStore = defineStore('barbers', {
  state: () => ({
    barbers: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async getAllBarbers() {
      // Renamed from fetchBarbers
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/barbers`);
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
        const response = await axios.post(`${API_URL}/barbers`, barber);
        this.barbers.push(response.data);
        await this.getAllBarbers(); // Refresh list - updated call
      } catch (error) {
        this.error = 'Error al añadir el barbero.';
        console.error(error);
      }
    },

    async updateBarber(barber) {
      try {
        await axios.put(`${API_URL}/barbers/${barber.id}`, barber);
        await this.getAllBarbers(); // Refresh list - updated call
      } catch (error) {
        this.error = 'Error al actualizar el barbero.';
        console.error(error);
      }
    },

    async deleteBarber(id) {
      try {
        await axios.delete(`${API_URL}/barbers/${id}`);
        await this.getAllBarbers(); // Refresh list - updated call
      } catch (error) {
        this.error = 'Error al eliminar el barbero.';
        console.error(error);
      }
    },
  },
});
