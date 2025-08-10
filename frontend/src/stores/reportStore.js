import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useReportStore = defineStore('reports', {
  state: () => ({
    events: [],
    stats: [],
    comprehensiveSales: [], // New state for comprehensive sales report
    servicesProductsSales: [], // New state for services vs products sales report
    // Nuevos estados para los reportes
    stationUsage: [],
    customerFrequency: [],
    peakHours: [],
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
    async fetchNewReports(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = { startDate, endDate };
        const [stationUsageRes, customerFrequencyRes, peakHoursRes] = await Promise.all([
          axios.get(`${API_URL}/reports/station-usage`, { params }),
          axios.get(`${API_URL}/reports/customer-frequency`, { params }),
          axios.get(`${API_URL}/reports/peak-hours`, { params })
        ]);
        this.stationUsage = stationUsageRes.data;
        this.customerFrequency = customerFrequencyRes.data;
        this.peakHours = peakHoursRes.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar los nuevos reportes.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchComprehensiveSales(filters) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/reports/comprehensive-sales`, { params: filters });
        this.comprehensiveSales = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar el reporte de ventas completo.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchServicesProductsSales(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/reports/services-products-sales`, { params: { startDate, endDate } });
        this.servicesProductsSales = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar el reporte de servicios vs productos.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
