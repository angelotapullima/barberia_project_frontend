<template>
  <div class="container mx-auto">
    <div class="bg-white rounded-lg shadow-md">
      <!-- Filter Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label
            for="monthFilter"
            class="block text-sm font-medium text-gray-700"
            >Mes:</label
          >
          <select
            v-model="selectedMonth"
            id="monthFilter"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option
              v-for="(month, index) in months"
              :key="index"
              :value="index"
            >
              {{ month }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="yearFilter"
            class="block text-sm font-medium text-gray-700"
            >Año:</label
          >
          <select
            v-model.number="selectedYear"
            id="yearFilter"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option
              v-for="yearOption in yearOptions"
              :key="yearOption"
              :value="yearOption"
            >
              {{ yearOption }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="fetchReport"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generar Reporte
          </button>
        </div>
      </div>

      <!-- Report Table -->
      <div v-if="isLoading" class="text-center text-gray-500">
        Cargando reporte...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Error: {{ error }}
      </div>
      <div
        v-else-if="reportData.length === 0"
        class="text-center text-gray-500"
      >
        No hay datos para mostrar en el rango seleccionado.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Barbero
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Período
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sueldo Base
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Servicios Generados (S/)
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Pago Calculado (S/)
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template
              v-for="item in reportData"
              :key="item.barber_id + '-' + item.period_start"
            >
              <tr>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {{ item.barber_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ months[new Date(item.period_start).getMonth()] }}
                  {{ new Date(item.period_start).getFullYear() }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right"
                >
                  {{ item.base_salary.toFixed(2) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right"
                >
                  {{ item.services_total.toFixed(2) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-bold"
                >
                  {{ item.total_payment.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.status }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <button
                    @click="handlePay(item)"
                    :disabled="
                      item.status === 'paid' ||
                      !isPaymentEnabled(item.period_end)
                    "
                    class="text-indigo-600 hover:text-indigo-900 mr-2 disabled:text-gray-400"
                  >
                    Pagar
                  </button>
                  <button
                    @click="handleAdvance(item)"
                    :disabled="!isAdvanceEnabled(item.period_end)"
                    class="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                  >
                    Adelanto
                  </button>
                  <button
                    @click="toggleDetails(item)"
                    class="ml-2 text-gray-600 hover:text-gray-900"
                  >
                    {{ item.showDetails ? 'Ocultar' : 'Ver' }} Detalles
                  </button>
                </td>
              </tr>
              <tr v-if="item.showDetails">
                <td :colspan="7" class="px-6 py-4 bg-gray-50">
                  <div class="p-4 border rounded-md bg-white">
                    <h4 class="text-lg font-semibold mb-2">
                      Detalle de Servicios
                    </h4>
                    <div v-if="item.servicesLoading" class="text-gray-500">
                      Cargando servicios...
                    </div>
                    <div v-else-if="item.servicesError" class="text-red-500">
                      Error al cargar servicios: {{ item.servicesError }}
                    </div>
                    <div
                      v-else-if="
                        item.detailedServices && item.detailedServices.length
                      "
                      class="overflow-x-auto"
                    >
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th
                              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Fecha
                            </th>
                            <th
                              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Servicio
                            </th>
                            <th
                              class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Monto (S/)
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr
                            v-for="service in item.detailedServices"
                            :key="service.sale_id"
                          >
                            <td
                              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                            >
                              {{ formatDate(service.sale_date) }}
                            </td>
                            <td
                              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                            >
                              {{ service.service_name }}
                            </td>
                            <td
                              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right"
                            >
                              {{ service.service_amount.toFixed(2) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-else class="text-gray-500">
                      No hay servicios detallados para este período.
                    </div>

                    <h4 class="text-lg font-semibold mt-4 mb-2">
                      Detalle de Adelantos
                    </h4>
                    <div v-if="item.advancesLoading" class="text-gray-500">
                      Cargando adelantos...
                    </div>
                    <div v-else-if="item.advancesError" class="text-red-500">
                      Error al cargar adelantos: {{ item.advancesError }}
                    </div>
                    <div
                      v-else-if="
                        item.detailedAdvances && item.detailedAdvances.length
                      "
                      class="overflow-x-auto"
                    >
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th
                              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Fecha
                            </th>
                            <th
                              class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Monto (S/)
                            </th>
                            <th
                              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Notas
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr
                            v-for="advance in item.detailedAdvances"
                            :key="advance.id"
                          >
                            <td
                              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                            >
                              {{ formatDate(advance.date) }}
                            </td>
                            <td
                              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right"
                            >
                              {{ advance.amount.toFixed(2) }}
                            </td>
                            <td
                              class="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                            >
                              {{ advance.notes || 'Sin notas' }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-else class="text-gray-500">
                      No hay adelantos detallados para este período.
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <BarberAdvanceModal
        :show="isAdvanceModalOpen"
        :barberId="selectedBarberForAdvance?.id"
        :barberName="selectedBarberForAdvance?.name"
        @close="isAdvanceModalOpen = false"
        @advanceRegistered="fetchReport"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '@/stores/paymentStore';

const router = useRouter();
const paymentStore = usePaymentStore();
import api from '@/services/api';

import BarberAdvanceModal from '@/components/BarberAdvanceModal.vue';

const reportData = ref([]);
const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());
const isLoading = ref(false);
const error = ref(null);

const isAdvanceModalOpen = ref(false);
const selectedBarberForAdvance = ref(null);

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const years = [];
  for (let i = startYear; i <= currentYear; i++) {
    years.push(i);
  }
  return years;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const fetchReport = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/barber-commissions/monthly-summary', {
      params: { year: selectedYear.value, month: selectedMonth.value + 1 },
    });
    reportData.value = response.data.map((item) => ({
      ...item,
      showDetails: false,
      servicesLoading: false,
      servicesError: null,
      detailedServices: [],
      advancesLoading: false,
      advancesError: null,
      detailedAdvances: [],
    }));
  } catch (err) {
    error.value = err.message || 'Error al cargar el reporte.';
  } finally {
    isLoading.value = false;
  }
};

const isPaymentEnabled = (periodEnd) => {
  const today = dayjs();
  const end = dayjs(periodEnd);
  return today.isAfter(end) || today.isSame(end, 'day');
};

const isAdvanceEnabled = (periodEnd) => {
  const end = dayjs(periodEnd);
  return dayjs().isBefore(end, 'day');
};

const handlePay = (item) => {
  paymentStore.setPaymentItem(item);
  router.push({ name: 'PaymentConfirm' });
};

const handleAdvance = (item) => {
  selectedBarberForAdvance.value = {
    id: item.barber_id,
    name: item.barber_name,
  };
  isAdvanceModalOpen.value = true;
};

const toggleDetails = async (item) => {
  item.showDetails = !item.showDetails;
  if (item.showDetails) {
    // Fetch services
    item.servicesLoading = true;
    item.servicesError = null;
    try {
      const res = await api.get(
        `/barber-commissions/${item.barber_id}/services`,
        {
          params: { year: selectedYear.value, month: selectedMonth.value + 1 },
        },
      );
      item.detailedServices = res.data || [];
    } catch (err) {
      item.servicesError = err.message || 'Error al cargar los servicios.';
    } finally {
      item.servicesLoading = false;
    }

    // Fetch advances
    item.advancesLoading = true;
    item.advancesError = null;
    try {
      const res = await api.get(
        `/barber-commissions/${item.barber_id}/advances`,
        {
          params: { year: selectedYear.value, month: selectedMonth.value + 1 },
        },
      );
      item.detailedAdvances = res.data || [];
    } catch (err) {
      item.advancesError = err.message || 'Error al cargar los adelantos.';
    } finally {
      item.advancesLoading = false;
    }
  }
};

watch([selectedMonth, selectedYear], fetchReport);

onMounted(() => {
  fetchReport();
});
</script>
