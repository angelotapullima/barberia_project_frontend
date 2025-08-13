import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useReportStore = defineStore('reports', {
  state: () => ({
    events: [],
    stats: [],
    comprehensiveSales: [], // New state for comprehensive sales report
    servicesProductsSales: [], // New state for services vs products sales report
    servicesProductsSalesComparison: [], // New state for comparison data
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
    async fetchStationUsage(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = { startDate, endDate };
        const response = await axios.get(`${API_URL}/reports/station-usage`, { params });
        this.stationUsage = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al cargar el reporte de uso de estaciones.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCustomerFrequency(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = { startDate, endDate };
        const response = await axios.get(`${API_URL}/reports/customer-frequency`, { params });
        this.customerFrequency = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al cargar el reporte de frecuencia de clientes.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPeakHours(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = { startDate, endDate };
        const response = await axios.get(`${API_URL}/reports/peak-hours`, { params });
        this.peakHours = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar el reporte de horas pico.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchComprehensiveSales(filters) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/reports/comprehensive-sales`, {
          params: filters,
        });
        this.comprehensiveSales = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al cargar el reporte de ventas completo.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchServicesProductsSales(startDate, endDate, comparisonFilters = null) {
      this.isLoading = true;
      this.error = null;
      try {
        const currentPeriodPromise = axios.get(`${API_URL}/reports/services-products-sales`, {
          params: { startDate, endDate },
        });

        let comparisonPeriodPromise = Promise.resolve({ data: [] });
        if (comparisonFilters) {
          comparisonPeriodPromise = axios.get(`${API_URL}/reports/services-products-sales`, {
            params: comparisonFilters,
          });
        }

        const [currentResponse, comparisonResponse] = await Promise.all([
          currentPeriodPromise,
          comparisonPeriodPromise,
        ]);

        this.servicesProductsSales = currentResponse.data;
        this.servicesProductsSalesComparison = comparisonResponse.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al cargar el reporte de servicios vs productos.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
