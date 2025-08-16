import { defineStore } from 'pinia';

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    selectedPaymentItem: null, // Stores the commission object for the payment confirmation page
    detailedServices: [],
    detailedAdvances: [],
  }),

  actions: {
    setPaymentItem(item, services = [], advances = []) {
      console.log('PaymentStore: setPaymentItem called with:', {
        item,
        services,
        advances,
      });
      this.selectedPaymentItem = item;
      this.detailedServices = Array.isArray(services) ? services : [];
      this.detailedAdvances = Array.isArray(advances) ? advances : [];
      console.log('PaymentStore: State after setting:', {
        selectedPaymentItem: this.selectedPaymentItem,
        detailedServices: this.detailedServices,
        detailedAdvances: this.detailedAdvances,
      });
    },

    clearPaymentItem() {
      console.log('PaymentStore: clearPaymentItem called');
      this.selectedPaymentItem = null;
      this.detailedServices = [];
      this.detailedAdvances = [];
    },

    updateDetailedData(services = [], advances = []) {
      console.log('PaymentStore: updateDetailedData called with:', {
        services,
        advances,
      });
      this.detailedServices = Array.isArray(services) ? services : [];
      this.detailedAdvances = Array.isArray(advances) ? advances : [];
    },
  },

  getters: {
    hasDetailedData: (state) => {
      return (
        state.detailedServices.length > 0 || state.detailedAdvances.length > 0
      );
    },

    totalAdvances: (state) => {
      if (
        !Array.isArray(state.detailedAdvances) ||
        state.detailedAdvances.length === 0
      ) {
        return 0;
      }
      return state.detailedAdvances.reduce(
        (sum, advance) => sum + (advance.amount || 0),
        0,
      );
    },
  },
});
