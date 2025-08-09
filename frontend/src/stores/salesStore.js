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
