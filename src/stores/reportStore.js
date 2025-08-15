import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance

export const useReportStore = defineStore('reports', {
  state: () => ({
    events: [], // This state might become obsolete if dashboard handles all
    stats: [], // This state might become obsolete if dashboard handles all
    comprehensiveSales: [],
    servicesProductsSales: [],
    servicesProductsSalesComparison: [],
    stationUsage: [],
    customerFrequency: [],
    peakHours: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    // fetchReport(year, month) is removed as dashboard endpoint will replace it

    async fetchStationUsage(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = { startDate, endDate };
        const response = await api.get(`/reports/station-usage`, {
          params,
        });
        this.stationUsage = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar el reporte de uso de estaciones.';
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
        const response = await api.get(
          `/reports/customer-frequency`,
          { params },
        );
        this.customerFrequency = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar el reporte de frecuencia de clientes.';
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
        const response = await api.get(`/reports/peak-hours`, {
          params,
        });
        this.peakHours = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar el reporte de horas pico.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchComprehensiveSales(filters) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(
          `/reports/comprehensive-sales`,
          {
            params: filters,
          },
        );
        this.comprehensiveSales = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar el reporte de ventas completo.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchServicesProductsSales(
      startDate,
      endDate,
      comparisonFilters = null,
    ) {
      this.isLoading = true;
      this.error = null;
      try {
        const currentPeriodPromise = api.get(
          `/reports/services-products-sales`,
          {
            params: { startDate, endDate },
          },
        );

        let comparisonPeriodPromise = Promise.resolve({ data: [] });
        if (comparisonFilters) {
          comparisonPeriodPromise = api.get(
            `/reports/services-products-sales`,
            {
              params: comparisonFilters,
            },
          );
        }

        const [currentResponse, comparisonResponse] = await Promise.all([
          currentPeriodPromise,
          comparisonPeriodPromise,
        ]);

        this.servicesProductsSales = currentResponse.data;
        this.servicesProductsSalesComparison = comparisonResponse.data;

        return currentResponse.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar el reporte de servicios vs productos.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async getBarberPayments(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/reports/barber-payments`, {
          params: { startDate, endDate },
        });
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar los pagos de barberos.';
        console.error(error);
        return []; // Return empty array on error
      } finally {
        this.isLoading = false;
      }
    },
    async getDetailedBarberServiceSales(filters) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(
          `/reports/detailed-barber-service-sales`,
          {
            params: filters,
          },
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar el reporte detallado de servicios de barberos.';
        console.error(error);
        return []; // Return empty array on error
      } finally {
        this.isLoading = false;
      }
    },
  },
});