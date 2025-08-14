import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        const response = await axios.get(`${API_URL}/stations`);
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
        await axios.post(`${API_URL}/stations`, station);
        await this.fetchStations();
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al añadir la estación.';
        console.error(error);
        throw error; // Re-throw to be caught in component
      }
    },
    async updateStation(station) {
      this.error = null;
      try {
        await axios.put(`${API_URL}/stations/${station.id}`, station);
        await this.fetchStations();
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al actualizar la estación.';
        console.error(error);
        throw error; // Re-throw to be caught in component
      }
    },
    async deleteStation(id) {
      this.error = null;
      try {
        await axios.delete(`${API_URL}/stations/${id}`);
        await this.fetchStations();
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al eliminar la estación.';
        console.error(error);
        throw error; // Re-throw to be caught in component
      }
    },
  },
});
