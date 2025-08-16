import { defineStore } from 'pinia';
import api from '../services/api'; // Import the centralized Axios instance
import { useAuthStore } from './authStore'; // Import auth store to get token

export const useSettingStore = defineStore('settings', {
  state: () => ({
    settings: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getSettingByKey: (state) => (key) => {
      const setting = state.settings.find((s) => s.setting_key === key);
      return setting ? setting.setting_value : undefined;
    },
  },

  actions: {
    async fetchAllSettings() {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await api.get('/settings'); // Use 'api' instance and relative path
        this.settings = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Error al cargar las configuraciones.';
        console.error('Error fetching settings:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async updateSetting(key, value) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        await api.put(
          // Use 'api' instance and relative path
          `/settings/${key}`,
          { value },
        );
        // Actualizar el valor en el store localmente
        const index = this.settings.findIndex((s) => s.setting_key === key);
        if (index !== -1) {
          this.settings[index].setting_value = value;
        } else {
          this.settings.push({ setting_key: key, setting_value: value });
        }
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Error al actualizar la configuración.';
        console.error(`Error updating setting ${key}:`, error);
        throw error; // Re-throw to allow component to handle success/failure messages
      } finally {
        this.isLoading = false;
      }
    },
  },
});
