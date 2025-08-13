import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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
        const response = await axios.get(`${API_URL}/services`);
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
        await axios.post(`${API_URL}/services`, service);
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
        await axios.put(`${API_URL}/services/${service.id}`, service);
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
        await axios.delete(`${API_URL}/services/${id}`);
        await this.fetchServices();
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al eliminar el servicio.';
        throw error;
      }
    },
  },
});
