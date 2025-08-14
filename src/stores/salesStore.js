import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        this.error =
          error.response?.data?.error || 'Error al cargar las ventas.';
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
        this.error =
          error.response?.data?.error ||
          'Error al cargar las ventas filtradas.';
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
        const response = await axios.get(
          `${API_URL}/sales/by-reservation/${reservationId}`,
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
    async saveDraftSale(draftSaleData) {
      this.isLoading = true;
      this.error = null;
      try {
        await axios.post(`${API_URL}/draft-sales`, draftSaleData);
      } catch (error) {
        this.error =
          error.response?.data?.error ||
          'Error al guardar el borrador de venta.';
        console.error(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchDraftSale(reservationId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(
          `${API_URL}/draft-sales/${reservationId}`,
        );
        return response.data;
      } catch (error) {
        // If draft not found (404), it's not an error, just means no draft exists
        if (error.response && error.response.status === 404) {
          return null;
        }
        this.error =
          error.response?.data?.error ||
          'Error al cargar el borrador de venta.';
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
        const response = await axios.get(
          `${API_URL}/sales/summary-by-service`,
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
        const response = await axios.get(
          `${API_URL}/sales/summary-by-payment-method`,
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
