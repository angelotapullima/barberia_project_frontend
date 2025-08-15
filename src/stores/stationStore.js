import { defineStore } from 'pinia';
import axios from 'axios';

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
        const response = await axios.get(`/api/stations`);
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
        const response = await axios.post(`/api/stations`, station);
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
        const response = await axios.put(`/api/stations/${station.id}`, station);
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
        const response = await axios.delete(`/api/stations/${id}`);
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