import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/products'); // Use 'api' instance and relative path
        this.products = response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching products:', error);
      } finally {
        this.loading = false;
      }
    },
    async addProduct(productData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/products', productData); // Use 'api' instance and relative path
        this.products.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Error adding product:', error);
        throw error; // Re-throw to allow component to handle
      } finally {
        this.loading = false;
      }
    },
    async updateProduct(id, productData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put(`/products/${id}`, productData); // Use 'api' instance and relative path
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Error updating product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async deleteProduct(id) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/products/${id}`); // Use 'api' instance and relative path
        this.products = this.products.filter(p => p.id !== id);
      } catch (error) {
        this.error = error.message;
        console.error('Error deleting product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});