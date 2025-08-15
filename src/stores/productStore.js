import { defineStore } from 'pinia';
import axios from 'axios';

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
        const response = await axios.get('/api/products');
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
        const response = await axios.post('/api/products', productData);
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
        const response = await axios.put(`/api/products/${id}`, productData);
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
        await axios.delete(`/api/products/${id}`);
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