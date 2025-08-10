import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useReservationStore = defineStore('reservations', {
  state: () => ({
    reservations: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchReservations() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/reservations`);
        this.reservations = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar las reservas.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async addReservation(reservationData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post(`${API_URL}/reservations`, reservationData);
        this.reservations.push(response.data);
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al registrar la reserva.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async updateReservation(id, reservationData) {
      this.isLoading = true;
      this.error = null;
      try {
        await axios.put(`${API_URL}/reservations/${id}`, reservationData);
        const index = this.reservations.findIndex(res => res.id === id);
        if (index !== -1) {
          Object.assign(this.reservations[index], reservationData);
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al actualizar la reserva.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteReservation(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await axios.delete(`${API_URL}/reservations/${id}`);
        this.reservations = this.reservations.filter(res => res.id !== id);
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al eliminar la reserva.';
        console.error(error);
        throw error;
      }
    },
  },
});
