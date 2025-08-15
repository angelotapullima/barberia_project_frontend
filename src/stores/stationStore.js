import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance

export const useStationStore = defineStore('stations', {
  state: () => ({
    stations: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchStations() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/stations`); // Use 'api' instance and relative path
        this.stations = response.data;
      } catch (error) {
        this.error = 'Error al cargar las estaciones.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async addStation(station) {
      this.error = null;
      try {
        const response = await api.post(`/stations`, station); // Use 'api' instance and relative path
        if (response.data.error) {
          this.error = response.data.error;
          throw new Error(response.data.error);
        }
        await this.fetchStations();
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Error al añadir la estación.';
        console.error(error);
        throw error; // Re-throw to be caught in component
      }
    },
    async updateStation(station) {
      this.error = null;
      try {
        const response = await api.put(`/stations/${station.id}`, station); // Use 'api' instance and relative path
        if (response.data.error) {
          this.error = response.data.error;
          throw new Error(response.data.error);
        }
        await this.fetchStations();
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Error al actualizar la estación.';
        console.error(error);
        throw error; // Re-throw to be caught in component
      }
    },
    async deleteStation(id) {
      this.error = null;
      try {
        const response = await api.delete(`/stations/${id}`); // Use 'api' instance and relative path
        if (response.data.error) {
          this.error = response.data.error;
          throw new Error(response.data.error);
        }
        await this.fetchStations();
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Error al eliminar la estación.';
        console.error(error);
        throw error; // Re-throw to be caught in component
      }
    },
  },
});