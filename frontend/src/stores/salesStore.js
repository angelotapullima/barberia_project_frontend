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
        this.sales = response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cargar las ventas filtradas.';
        console.error(error);
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
  },
});
