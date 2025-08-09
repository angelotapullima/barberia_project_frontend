import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useReportStore = defineStore('reports', {
  state: () => ({
    events: [],
    stats: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchReport(year, month) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/reports`, { params: { year, month } });
        this.events = response.data.events;
        this.stats = response.data.stats;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar el reporte.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
