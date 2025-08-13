import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async getAllSales() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/sales`);
        this.sales = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar las ventas.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async getFilteredSales(filterType, filterValue) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/sales/filtered`, {
          params: {
            filterType,
            filterValue,
          },
        });
        return response.data; // Return data directly
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar las ventas filtradas.';
        console.error(error);
        return []; // Return empty array on error
      } finally {
        this.isLoading = false;
      }
    },
    async addSale(saleData) {
      this.isLoading = true;
      this.error = null;
      try {
        await axios.post(`${API_URL}/sales`, saleData);
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al registrar la venta.';
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
        const response = await axios.get(`${API_URL}/sales/summary`, {
          params: { startDate, endDate },
        });
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al obtener el resumen de ventas diarias.';
        console.error(error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    async getBarberSalesRanking(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/sales/ranking`, {
          params: { startDate, endDate },
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al obtener el ranking de barberos.';
        console.error(error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    async getTotalPaymentsToBarbers(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/sales/total-payments`, {
          params: { startDate, endDate },
        });
        return response.data.totalPayments;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al obtener el total de pagos a barberos.';
        console.error(error);
        return 0;
      } finally {
        this.isLoading = false;
      }
    },
    async getSalesSummaryByService(startDate, endDate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/sales/summary-by-service`, {
          params: { startDate, endDate },
        });
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Error al obtener el resumen de ventas por servicio.';
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
        const response = await axios.get(`${API_URL}/sales/summary-by-payment-method`, {
          params: { startDate, endDate },
        });
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
