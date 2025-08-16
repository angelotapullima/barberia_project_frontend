<template>
  <div class="container mx-auto">
    <Breadcrumbs :items="breadcrumbItems" class="mb-6" />

    <div class="bg-white p-8 rounded-lg shadow-xl max-w-full w-full mx-auto">
      <div v-if="commission">
        <!-- Payment Summary -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-lg"
        >
          <p>
            Barbero:
            <span class="font-semibold">{{ commission.barber_name }}</span>
          </p>
          <p>
            Período: <span class="font-semibold">{{ formatPeriod }}</span>
          </p>
          <p>
            Sueldo Base:
            <span class="font-semibold"
              >S/ {{ commission.base_salary.toFixed(2) }}</span
            >
          </p>
          <p>
            Total Servicios Generados:
            <span class="font-semibold"
              >S/ {{ commission.services_total.toFixed(2) }}</span
            >
          </p>
          <p>
            Total Adelantos:
            <span class="font-semibold">S/ {{ totalAdvancesAmount }}</span>
          </p>
        </div>

        <div class="bg-gray-100 p-4 rounded-md mb-8">
          <p class="text-xl text-center">
            Monto Final a Pagar:
            <span class="font-bold text-3xl text-green-600"
              >S/ {{ commission.total_payment.toFixed(2) }}</span
            >
          </p>
        </div>

        <!-- Detailed Services -->
        <h2 class="text-2xl font-semibold mb-3">Servicios Realizados</h2>
        <div v-if="servicesLoading" class="text-gray-500">
          Cargando servicios...
        </div>
        <div v-else-if="servicesError" class="text-red-500">
          Error al cargar servicios: {{ servicesError }}
        </div>
        <div
          v-else-if="detailedServices && detailedServices.length"
          class="border rounded-md mb-6 detailed-services-section"
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
              <tr v-for="service in detailedServices" :key="service.sale_id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDate(service.sale_date) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
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
        <p v-else class="text-gray-500 mb-6">
          No hay servicios detallados para este período.
        </p>

        <!-- Detailed Advances -->
        <h2 class="text-2xl font-semibold mb-3">Adelantos Tomados</h2>
        <div v-if="advancesLoading" class="text-gray-500">
          Cargando adelantos...
        </div>
        <div v-else-if="advancesError" class="text-red-500">
          Error al cargar adelantos: {{ advancesError }}
        </div>
        <div
          v-else-if="detailedAdvances && detailedAdvances.length"
          class="border rounded-md mb-6 detailed-advances-section"
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
              <tr v-for="advance in detailedAdvances" :key="advance.id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDate(advance.date) }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right"
                >
                  {{ advance.amount.toFixed(2) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ advance.notes || '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 mb-6">No hay adelantos registrados.</p>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 mt-8">
          <button @click="cancel" class="px-6 py-2 border rounded-md">
            Cancelar
          </button>
          <button
            @click="printPage"
            class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Imprimir
          </button>
          <button
            @click="confirmPayment"
            :disabled="isProcessing"
            class="px-6 py-2 bg-green-600 text-white rounded-md"
          >
            {{ isProcessing ? 'Procesando...' : 'Confirmar y Pagar' }}
          </button>
        </div>
        <div v-if="error" class="text-right text-red-500 mt-4">{{ error }}</div>
      </div>
      <div v-else>
        <p>Cargando datos del pago...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import api from '@/services/api';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { usePaymentStore } from '@/stores/paymentStore';
import dayjs from 'dayjs';
import { generateBarberPaymentSlip } from '@/services/barberPaymentSlipGenerator';

const router = useRouter();
const paymentStore = usePaymentStore();
const { selectedPaymentItem } = storeToRefs(paymentStore);

const commission = ref(null);
const servicesLoading = ref(false);
const servicesError = ref(null);
const detailedServices = ref([]);
const advancesLoading = ref(false);
const advancesError = ref(null);
const detailedAdvances = ref([]);
const isProcessing = ref(false);
const error = ref(null);

const breadcrumbItems = computed(() => [
  {
    text: 'Pago a Barberos',
    to: '/payments',
    disabled: false,
  },
  { text: 'Confirmar Pago', to: '', disabled: true },
]);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatPeriod = computed(() => {
  if (
    !commission.value ||
    !commission.value.period_start ||
    !commission.value.period_end
  )
    return '';
  const start = dayjs(commission.value.period_start);
  const end = dayjs(commission.value.period_end);
  return `${start.format('DD [de] MMMM')} - ${end.format('DD [de] MMMM [de] YYYY')}`;
});

const totalAdvancesAmount = computed(() => {
  if (!detailedAdvances.value || detailedAdvances.value.length === 0) {
    return '0.00';
  }
  const total = detailedAdvances.value.reduce(
    (sum, advance) => sum + (advance.amount || 0),
    0,
  );
  return total.toFixed(2);
});

const fetchDetails = async () => {
  const year = dayjs(commission.value.period_start).year();
  const month = dayjs(commission.value.period_start).month() + 1;

  servicesLoading.value = true;
  advancesLoading.value = true;
  servicesError.value = null;
  advancesError.value = null;

  let fetchedServices = []; // Initialize with empty array
  let fetchedAdvances = []; // Initialize with empty array

  // Fetch services
  try {
    const res = await api.get(
      `/barber-commissions/${commission.value.barber_id}/services`,
      { params: { year, month } },
    );
    fetchedServices = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    servicesError.value = 'Error al cargar servicios.';
  } finally {
    servicesLoading.value = false;
  }

  // Fetch advances
  try {
    const res = await api.get(
      `/barber-commissions/${commission.value.barber_id}/advances`,
      { params: { year, month } },
    );
    fetchedAdvances = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    advancesError.value = 'Error al cargar adelantos.';
  } finally {
    advancesLoading.value = false;
  }

  // Update local refs
  detailedServices.value = fetchedServices;
  detailedAdvances.value = fetchedAdvances;

  paymentStore.setPaymentItem(
    commission.value,
    fetchedServices,
    fetchedAdvances,
  );
  console.log('fetchDetails: Data stored in Pinia successfully');
};

const confirmPayment = async () => {
  isProcessing.value = true;
  error.value = null;
  try {
    const year = dayjs(commission.value.period_start).year();
    const month = dayjs(commission.value.period_start).month() + 1;
    const payload = { barberId: commission.value.barber_id, year, month };
    await api.post('/barber-commissions/finalize-payment', payload);
    alert('Pago registrado exitosamente.');
    paymentStore.clearPaymentItem(); // Clear after successful payment
    router.push({ name: 'BarberPaymentsReport' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Ocurrió un error.';
  } finally {
    isProcessing.value = false;
  }
};

const cancel = () => {
  paymentStore.clearPaymentItem(); // Clear on cancel
  router.back();
};

const printPage = () => {
  if (!commission.value) {
    return;
  }

  const data = {
    nombre: commission.value.barber_name,
    puesto: 'Barbero', // Assuming a default or fetching from commission if available
    periodo: formatPeriod.value,
    sueldoBase: commission.value.base_salary,
    totalServicios: commission.value.services_total,
    totalAdelantos: parseFloat(totalAdvancesAmount.value), // Ensure it's a number
    servicios: detailedServices.value.map((s) => ({
      fecha: formatDate(s.sale_date),
      nombreServicio: s.service_name,
      monto: s.service_amount,
    })),
    adelantos: detailedAdvances.value.map((a) => ({
      fecha: formatDate(a.date),
      concepto: a.notes || 'Adelanto',
      monto: a.amount,
    })),
    // logoDataUrl: 'data:image/png;base64,...' // Provide your logo data URL here if available
  };

  generateBarberPaymentSlip(data);
};

onMounted(() => {
  if (selectedPaymentItem.value) {
    commission.value = selectedPaymentItem.value;
    // Check if detailed services/advances are already in Pinia

    // Use the getter to check if we have detailed data
    if (paymentStore.hasDetailedData) {
      detailedServices.value = [...paymentStore.detailedServices];
      detailedAdvances.value = [...paymentStore.detailedAdvances];
    } else {
      fetchDetails();
    }
  } else {
    // If accessed directly, redirect back to report
    router.push({ name: 'BarberPaymentsReport' });
  }
});
</script>
