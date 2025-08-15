<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click="handleClickOutside">
      <div class="modal-container max-w-4xl overflow-y-auto max-h-[90vh]">
        <div class="modal-header">
          <slot name="header">
            <h3 class="text-xl font-bold">Registrar Venta</h3>
          </slot>
        </div>

        <div class="modal-body">
          <!-- Reservation Details (if converting from reservation) -->
          <div v-if="reservation" class="mb-4 p-4 border rounded-lg bg-gray-50">
            <h4 class="font-semibold mb-2">Detalles de la Reserva:</h4>
            <p><strong>Cliente:</strong> {{ reservation.client_name }}</p>
            <p>
              <strong>Barbero:</strong>
              {{ getBarberName(reservation.barber_id) }}
            </p>
            <p>
              <strong>Servicio Principal:</strong>
              {{ getServiceName(reservation.service_id) }} (S/ {{ reservation.service_price.toFixed(2) }})
            </p>
            <p>
              <strong>Fecha:</strong> {{ formatDate(reservation.start_time) }}
            </p>
            <p>
              <strong>Hora:</strong> {{ formatTime(reservation.start_time) }}
            </p>
            <p><strong>Estado:</strong> {{ reservation.status }}</p>
          </div>

          <!-- Product/Service Selection -->
          <div class="mb-4">
            <h4 class="font-semibold mb-2">Añadir Productos Adicionales:</h4>
            <div class="flex space-x-2 mb-2">
              <select v-model="selectedItemToAdd" class="form-select flex-grow">
                <option :value="null" disabled>
                  Seleccionar producto
                </option>
                <option
                  v-for="product in products"
                  :key="'p-' + product.id"
                  :value="product"
                >
                  {{ product.name }} (S/ {{ product.price }})
                </option>
              </select>
              <button @click="addItemToReservation" class="btn-primary">Añadir</button>
            </div>
          </div>

          <!-- Selected Items List -->
          <div v-if="saleItems.length > 0" class="mb-4 border rounded-lg">
            <table class="min-w-full bg-white">
              <thead>
                <tr>
                  <th class="py-2 px-4 border-b">Item</th>
                  <th class="py-2 px-4 border-b">Precio Unitario</th>
                  <th class="py-2 px-4 border-b">Cantidad</th>
                  <th class="py-2 px-4 border-b">Total</th>
                  <th class="py-2 px-4 border-b"></th>
                </tr>
              </thead>
              <tbody>
                <!-- Primary Service -->
                <tr>
                  <td class="py-2 px-4 border-b">{{ getServiceName(reservation.service_id) }} (Servicio Principal)</td>
                  <td class="py-2 px-4 border-b">{{ reservation.service_price.toFixed(2) }}</td>
                  <td class="py-2 px-4 border-b">1</td>
                  <td class="py-2 px-4 border-b">S/ {{ reservation.service_price.toFixed(2) }}</td>
                  <td class="py-2 px-4 border-b"></td>
                </tr>
                <!-- Additional Products -->
                <tr v-for="(item, index) in saleItems" :key="item.id">
                  <td class="py-2 px-4 border-b">{{ getProductName(item.product_id) }}</td>
                  <td class="py-2 px-4 border-b">
                    {{ item.price_at_reservation.toFixed(2) }}
                  </td>
                  <td class="py-2 px-4 border-b">
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      min="1"
                      class="w-16 text-center border rounded"
                      @change="updateItemQuantity(item.id, item.quantity)"
                    />
                  </td>
                  <td class="py-2 px-4 border-b">
                    S/ {{ (item.price_at_reservation * item.quantity).toFixed(2) }}
                  </td>
                  <td class="py-2 px-4 border-b">
                    <button
                      @click="removeItemFromReservation(item.id)"
                      class="text-red-500 hover:text-red-700"
                    >
                      X
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total and Payment -->
          <div
            class="flex flex-col md:flex-row justify-end items-center mb-4 space-y-4 md:space-y-0 md:space-x-4"
          >
            <!-- Payment Method Selection -->
            <div class="w-full md:w-1/3">
              <label
                for="payment-method-select"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Método de Pago:</label
              >
              <select
                id="payment-method-select"
                v-model="paymentMethod"
                class="form-select w-full"
              >
                <option value="">Selecciona un método</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <!-- Add more payment methods as needed -->
              </select>
            </div>

            <h3 class="text-xl font-bold mr-4">
              Total: S/ {{ saleTotal.toFixed(2) }}
            </h3>
            <button @click="processSale" class="btn-primary">
              Pagar Venta
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-default-button" @click="$emit('close')">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'; // Add onUnmounted
import api from '../services/api'; // Import the centralized Axios instance
import { useBarberStore } from '../stores/barberStore';
import { useReservationStore } from '../stores/reservationStore';
import dayjs from 'dayjs';

const props = defineProps({
  show: Boolean,
  reservation: Object, // reservation object with products array
});

const emit = defineEmits(['close', 'saleProcessed', 'updatedReservation']);

// Function to handle Escape key press
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

// Function to handle click outside modal content
const handleClickOutside = (event) => {
  // Check if the click target is the modal mask itself, not a child of modal-container
  if (event.target.classList.contains('modal-mask')) {
    emit('close');
  }
};

// Watch for changes in the 'show' prop to add/remove event listeners
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

// Clean up event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const barberStore = useBarberStore();
const reservationStore = useReservationStore();

const selectedItemToAdd = ref(null);
const paymentMethod = ref('');
const saleItems = ref([]); // This will now hold reservation_products

const services = ref([]); // Master list of services from API
const products = ref([]); // Master list of products from API

// Fetch master data (services and products) on mount
onMounted(async () => {
  try {
    const response = await api.get('/pos/master-data'); // Use 'api' and relative path
    services.value = response.data.services;
    products.value = response.data.products;
    await barberStore.getAllBarbers(); // Ensure barbers are fetched for display
  } catch (error) {
    console.error('Error fetching POS master data:', error);
  }
});

// Watch for reservation prop changes to update saleItems
watch(
  () => props.reservation,
  (newReservation) => {
    if (newReservation && newReservation.products) {
      saleItems.value = newReservation.products;
    } else {
      saleItems.value = [];
    }
  },
  { immediate: true, deep: true },
);

const addItemToReservation = async () => {
  if (!selectedItemToAdd.value) return;
  if (!props.reservation || !props.reservation.id) {
    alert('Error: No reservation selected.');
    return;
  }

  try {
    // Call the new action in reservationStore
    await reservationStore.addProductToReservation(
      props.reservation.id,
      selectedItemToAdd.value.id,
      1, // Default quantity
    );
    // Re-fetch the reservation to update the local saleItems
    await fetchReservationDetails(props.reservation.id);
    selectedItemToAdd.value = null; // Reset selection
  } catch (error) {
    alert(`Error al añadir producto: ${error.message || error}`);
  }
};

const removeItemFromReservation = async (reservationProductId) => {
  if (!props.reservation || !props.reservation.id) {
    alert('Error: No reservation selected.');
    return;
  }
  try {
    await reservationStore.removeProductFromReservation(
      props.reservation.id,
      reservationProductId,
    );
    // Re-fetch the reservation to update the local saleItems
    await fetchReservationDetails(props.reservation.id);
  } catch (error) {
    alert(`Error al eliminar producto: ${error.message || error}`);
  }
};

const updateItemQuantity = async (reservationProductId, newQuantity) => {
  if (newQuantity < 1) {
    // If quantity drops to 0, remove the item
    await removeItemFromReservation(reservationProductId);
    return;
  }
  // For simplicity, we'll remove and re-add. A dedicated update endpoint would be better.
  const itemToUpdate = saleItems.value.find(item => item.id === reservationProductId);
  if (itemToUpdate) {
    try {
      await reservationStore.removeProductFromReservation(props.reservation.id, reservationProductId);
      await reservationStore.addProductToReservation(props.reservation.id, itemToUpdate.product_id, newQuantity);
      await fetchReservationDetails(props.reservation.id);
    } catch (error) {
      alert(`Error al actualizar cantidad: ${error.message || error}`);
    }
  }
};

const saleTotal = computed(() => {
  let total = props.reservation?.service_price || 0;
  total += saleItems.value.reduce(
    (sum, item) => sum + item.price_at_reservation * item.quantity,
    0,
  );
  return total;
});

const processSale = async () => {
  if (!paymentMethod.value) {
    alert('Por favor, selecciona un método de pago.');
    return;
  }

  try {
    await reservationStore.completeReservationAndCreateSale(
      props.reservation.id,
      paymentMethod.value,
    );

    alert('Venta registrada exitosamente!');
    emit('saleProcessed'); // Notify parent to refresh calendar/data
    emit('close');
  } catch (error) {
    alert(`Error al registrar la venta: ${error.message || error}`);
  }
};

// Helper to fetch full reservation details (including products) after changes
const fetchReservationDetails = async (reservationId) => {
  try {
    const response = await api.get(`/reservations/${reservationId}?includeProducts=true`); // Use 'api' and relative path
    saleItems.value = response.data.products; 
    // Emit the updated reservation to the parent (still good practice for parent's state)
    emit('updatedReservation', response.data); 
  } catch (error) {
    console.error('Error fetching updated reservation details:', error);
  }
};

// Helper functions for display
const getBarberName = (barberId) => {
  return (
    barberStore.barbers.find((b) => b.id === barberId)?.name || 'Desconocido'
  );
};

const getServiceName = (serviceId) => {
  return (
    services.value.find((s) => s.id === serviceId)?.name || 'Desconocido'
  );
};

const getProductName = (productId) => {
  return (
    products.value.find((p) => p.id === productId)?.name || 'Desconocido'
  );
};

const formatDate = (isoString) => {
  return dayjs(isoString).format('DD/MM/YYYY');
};

const formatTime = (isoString) => {
  return dayjs(isoString).format('HH:mm');
};
</script>