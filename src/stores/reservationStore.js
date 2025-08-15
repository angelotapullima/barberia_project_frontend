import { defineStore } from 'pinia';
import axios from 'axios';

export const useReservationStore = defineStore('reservations', {
  state: () => ({
    reservations: [],
    totalReservationsCount: 0,
    currentPage: 1, // Add currentPage to state
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchReservations(
      page = 1,
      limit = 10,
      startDate,
      endDate,
      includeSaleDetails = false,
    ) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = {
          page,
          limit,
          startDate,
          endDate,
          includeSaleDetails,
        };
        const response = await axios.get(`/api/reservations`, { params });
        this.reservations = response.data.reservations;
        this.totalReservationsCount = response.data.total; // Update total count
        this.currentPage = response.data.page; // Update currentPage from backend
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al cargar las reservas.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async addReservation(reservationData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post(
          `/api/reservations`,
          reservationData,
        );
        this.reservations.push(response.data);
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al registrar la reserva.';
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
        await axios.put(`/api/reservations/${id}`, reservationData);
        const index = this.reservations.findIndex((res) => res.id === id);
        if (index !== -1) {
          Object.assign(this.reservations[index], reservationData);
        }
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al actualizar la reserva.';
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
        await axios.delete(`/api/reservations/${id}`);
        this.reservations = this.reservations.filter((res) => res.id !== id);
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al eliminar la reserva.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async addProductToReservation(reservationId, productId, quantity) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post(
          `/api/reservations/${reservationId}/products`,
          { productId, quantity },
        );
        // Optionally, update the reservation in the store if the backend returns the updated reservation
        // For now, just return the new product added
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al añadir producto a la reserva.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async removeProductFromReservation(reservationId, reservationProductId) {
      this.isLoading = true;
      this.error = null;
      try {
        await axios.delete(
          `/api/reservations/${reservationId}/products/${reservationProductId}`,
        );
        // Optionally, update the reservation in the store
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al eliminar producto de la reserva.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async completeReservationAndCreateSale(reservationId, paymentMethod) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post(`/api/reservations/${reservationId}/complete`, { paymentMethod });
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al completar la reserva y crear la venta.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  }
})