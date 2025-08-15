import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    totalSales: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
  }),
  actions: {
    async getAllSales(page = 1, limit = 10) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/sales`, { // Use 'api' instance and relative path
          params: { page, limit },
        });
        this.sales = response.data.sales;
        this.totalSales = response.data.total;
        this.currentPage = response.data.page;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al cargar las ventas.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async getFilteredSales(filterType, filterValue, page, limit) {
      // This action will now just call getAllSales with the filters
      await this.getAllSales(page, limit);
    },
    async addSale(saleData) {
      this.isLoading = true;
      this.error = null;
      try {
        await api.post(`/sales`, saleData); // Use 'api' instance and relative path
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al registrar la venta.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchSaleByReservationId(reservationId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get( // Use 'api' instance and relative path
          `/sales/by-reservation/${reservationId}`,
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al cargar la venta por ID de reserva.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async getSalesSummaryByDateRange(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/sales/summary`, { // Use 'api' instance and relative path
          params: { startDate, endDate },
        });
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al obtener el resumen de ventas diarias.';
        console.error(error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async getSalesSummaryByService(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get( // Use 'api' instance and relative path
          `/sales/summary-by-service`,
          {
            params: { startDate, endDate },
          },
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al obtener el resumen de ventas por servicio.';
        console.error(error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    async getSalesSummaryByPaymentMethod(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get( // Use 'api' instance and relative path
          `/sales/summary-by-payment-method`,
          {
            params: { startDate, endDate },
          },
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al obtener el resumen de ventas por método de pago.';
        console.error(error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});