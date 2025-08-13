import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [],
    lowStockProducts: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/services/products`);
        this.products = response.data;
      } catch (error) {
        this.error = 'Error al cargar productos.';
        console.error('Error fetching products:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchLowStockProducts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/services/products/low-stock`);
        this.lowStockProducts = response.data;
      } catch (error) {
        this.error = 'Error al cargar productos con bajo stock.';
        console.error('Error fetching low stock products:', error);
      } finally {
        this.loading = false;
      }
    },
    async updateProductStock(id, quantity) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.put(`${API_URL}/services/products/${id}/stock`, { quantity });
        // Update the product in the store
        const index = this.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.products[index] = response.data;
        }
        // Re-fetch low stock products as stock might have changed
        this.fetchLowStockProducts();
        return response.data;
      } catch (error) {
        this.error = 'Error al actualizar el stock del producto.';
        console.error('Error updating product stock:', error);
        throw error; // Re-throw to allow component to handle
      } finally {
        this.loading = false;
      }
    },
    async createProduct(product) {
      this.loading = true;
      this.error = null;
      try {
        // Assuming createService can handle product type
        const response = await axios.post(`${API_URL}/services`, { ...product, type: 'product' });
        this.products.push(response.data);
        this.fetchLowStockProducts(); // Check if new product is low stock
        return response.data;
      } catch (error) {
        this.error = 'Error al crear el producto.';
        console.error('Error creating product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async updateProduct(id, product) {
      this.loading = true;
      this.error = null;
      try {
        // Assuming updateService can handle product type
        const response = await axios.put(`${API_URL}/services/${id}`, { ...product, type: 'product' });
        const index = this.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.products[index] = response.data;
        }
        this.fetchLowStockProducts(); // Check if updated product is low stock
        return response.data;
      } catch (error) {
        this.error = 'Error al actualizar el producto.';
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
        await axios.delete(`${API_URL}/services/${id}`);
        this.products = this.products.filter((p) => p.id !== id);
        this.lowStockProducts = this.lowStockProducts.filter((p) => p.id !== id);
      } catch (error) {
        this.error = 'Error al eliminar el producto.';
        console.error('Error deleting product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchInventorySummary() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/services/products/report/summary`);
        return response.data;
      } catch (error) {
        this.error = 'Error al cargar el resumen del inventario.';
        console.error('Error fetching inventory summary:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
