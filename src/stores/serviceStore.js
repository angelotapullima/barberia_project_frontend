import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance

export const useServiceStore = defineStore('services', {
  state: () => ({
    services: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchServices() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/services'); // Use 'api' instance and relative path
        this.services = response.data;
      } catch (error) {
        this.error = 'Error al cargar los servicios.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async addService(service) {
      this.error = null;
      try {
        await api.post('/services', service); // Use 'api' instance and relative path
        await this.fetchServices();
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al añadir el servicio.';
        throw error;
      }
    },
    async updateService(service) {
      this.error = null;
      try {
        await api.put(`/services/${service.id}`, service); // Use 'api' instance and relative path
        await this.fetchServices();
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al actualizar el servicio.';
        throw error;
      }
    },
    async deleteService(id) {
      this.error = null;
      try {
        await api.delete(`/services/${id}`); // Use 'api' instance and relative path
        await this.fetchServices();
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al eliminar el servicio.';
        throw error;
      }
    },
  },
});