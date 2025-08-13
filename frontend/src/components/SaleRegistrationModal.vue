<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
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
              {{ getServiceName(reservation.service_id) }}
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
            <h4 class="font-semibold mb-2">Añadir Productos/Servicios:</h4>
            <div class="flex space-x-2 mb-2">
              <select v-model="selectedItemToAdd" class="form-select flex-grow">
                <option :value="null" disabled>
                  Seleccionar producto o servicio
                </option>
                <optgroup
                  label="Servicios"
                  v-if="saleType === 'both' || saleType === 'service'"
                >
                  <option
                    v-for="service in serviceStore.services"
                    :key="'s-' + service.id"
                    :value="{ type: 'service', item: service }"
                  >
                    {{ service.name }} ({{ service.price }}€)
                  </option>
                </optgroup>
                <optgroup
                  label="Productos"
                  v-if="saleType === 'both' || saleType === 'product'"
                >
                  <option
                    v-for="product in productStore.products"
                    :key="'p-' + product.id"
                    :value="{ type: 'product', item: product }"
                  >
                    {{ product.name }} ({{ product.price }}€)
                  </option>
                </optgroup>
              </select>
              <button @click="addItemToSale" class="btn-primary">Añadir</button>
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
                <tr v-for="(item, index) in saleItems" :key="item.id">
                  <td class="py-2 px-4 border-b">{{ item.name }}</td>
                  <td class="py-2 px-4 border-b">
                    {{ item.price.toFixed(2) }}€
                  </td>
                  <td class="py-2 px-4 border-b">
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      min="1"
                      class="w-16 text-center border rounded"
                      @change="updateItemQuantity(index, item.quantity)"
                    />
                  </td>
                  <td class="py-2 px-4 border-b">
                    {{ (item.price * item.quantity).toFixed(2) }}€
                  </td>
                  <td class="py-2 px-4 border-b">
                    <button
                      @click="removeItemFromSale(index)"
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
              Total: {{ saleTotal.toFixed(2) }}€
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
import { ref, computed, watch, onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useServiceStore } from '../stores/serviceStore';
import { useSalesStore } from '../stores/salesStore';
import { useBarberStore } from '../stores/barberStore'; // Needed for barber name
import { useReservationStore } from '../stores/reservationStore'; // Needed to update reservation status
import dayjs from 'dayjs';

const props = defineProps({
  show: Boolean,
  reservation: Object, // Optional: reservation object if converting from one
  saleType: {
    type: String,
    default: 'both', // 'product', 'service', or 'both'
  },
});

const emit = defineEmits(['close', 'saleProcessed']);

const productStore = useProductStore();
const serviceStore = useServiceStore();
const salesStore = useSalesStore();
const barberStore = useBarberStore();
const reservationStore = useReservationStore();

const selectedItemToAdd = ref(null); // Re-adding the missing declaration
const paymentMethod = ref(''); // Re-adding the missing declaration
const saleItems = ref([]); // { id, name, price, quantity, type }

// Initialize saleItems with the primary service from reservation if provided
watch(
  () => props.reservation,
  async (newReservation) => {
    // Added 'async'
    console.log('SaleRegistrationModal received reservation:', newReservation);
    // Always reset saleItems when the reservation prop changes
    saleItems.value = [];

    if (newReservation && newReservation.id) {
      // Check for newReservation.id
      // Attempt to load draft sale
      const draft = await salesStore.fetchDraftSale(newReservation.id);
      if (draft && draft.sale_items && draft.sale_items.length > 0) {
        saleItems.value = draft.sale_items.map((item) => ({
          id: item.item_id,
          name:
            item.item_type === 'service'
              ? serviceStore.services.find((s) => s.id === item.item_id)
                  ?.name || 'Servicio Desconocido'
              : productStore.products.find((p) => p.id === item.item_id)
                  ?.name || 'Producto Desconocido',
          price: item.price_at_draft,
          quantity: item.quantity,
          type: item.item_type,
        }));
        console.log('Loaded draft sale:', saleItems.value);
      } else if (newReservation.service_id) {
        // If no draft, but there's a primary service, add it
        const primaryService = serviceStore.services.find(
          (s) => s.id === newReservation.service_id,
        );
        if (primaryService) {
          saleItems.value.push({
            id: primaryService.id,
            name: primaryService.name,
            price: primaryService.price,
            quantity: 1,
            type: 'service',
          });
        }
      }
    }
  },
  { immediate: true },
);

let saveDraftDebounceTimer = null;
watch(
  saleItems,
  (newSaleItems) => {
    if (!props.reservation || !props.reservation.id) {
      return; // Only save draft if there's a reservation to link it to
    }

    clearTimeout(saveDraftDebounceTimer);
    saveDraftDebounceTimer = setTimeout(async () => {
      const draftSaleData = {
        reservation_id: props.reservation.id,
        client_name: props.reservation.client_name,
        // barber_id: props.reservation.barber_id, // Removed as barber_id is not in sales table
        sale_items: newSaleItems.map((item) => ({
          item_id: item.id,
          item_type: item.type,
          quantity: item.quantity,
          price_at_draft: item.price,
        })),
      };
      try {
        await salesStore.saveDraftSale(draftSaleData);
        console.log('Draft sale saved successfully.');
      } catch (error) {
        console.error('Failed to save draft sale:', error);
      }
    }, 500); // Debounce by 500ms
  },
  { deep: true },
);

const addItemToSale = () => {
  if (selectedItemToAdd.value) {
    const { type, item } = selectedItemToAdd.value;
    const existingItem = saleItems.value.find(
      (i) => i.id === item.id && i.type === type,
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      saleItems.value.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type: type,
      });
    }
    selectedItemToAdd.value = null; // Reset selection
  }
};

const removeItemFromSale = (index) => {
  saleItems.value.splice(index, 1);
};

const updateItemQuantity = (index, newQuantity) => {
  if (newQuantity < 1) {
    saleItems.value.splice(index, 1); // Remove if quantity drops to 0 or less
  } else {
    saleItems.value[index].quantity = newQuantity;
  }
};

const saleTotal = computed(() => {
  return saleItems.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
});

const processSale = async () => {
  if (saleItems.value.length === 0) {
    alert('No hay elementos en la venta.');
    return;
  }

  // Client-side validation for required fields
  if (!paymentMethod.value) {
    alert('Por favor, selecciona un método de pago.');
    return;
  }

  try {
    const saleData = {
      reservation_id: props.reservation ? props.reservation.id : null,
      client_name: props.reservation?.client_name || 'Cliente Varios',
      total_amount: saleTotal.value,
      sale_items: saleItems.value.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
        item_type: item.type,
        price_at_sale: item.price,
        item_name: item.name,
      })),
      payment_method: paymentMethod.value,
      sale_date: dayjs().toISOString(),
    };

    await salesStore.addSale(saleData);

    // If it was a reservation, update its status to 'completado' or 'pagado'
    if (props.reservation) {
      await reservationStore.updateReservation(props.reservation.id, {
        status: 'completed',
      });
    }

    alert('Venta registrada exitosamente!');
    emit('saleProcessed'); // Notify parent to refresh calendar/data
    emit('close');
    resetSaleForm();
  } catch (error) {
    alert(`Error al registrar la venta: ${error.message || error}`);
  }
};

const resetSaleForm = () => {
  saleItems.value = [];
  selectedItemToAdd.value = null;
};

// Helper functions for display
const getBarberName = (barberId) => {
  return (
    barberStore.barbers.find((b) => b.id === barberId)?.name || 'Desconocido'
  );
};

const getServiceName = (serviceId) => {
  return (
    serviceStore.services.find((s) => s.id === serviceId)?.name || 'Desconocido'
  );
};

const formatDate = (isoString) => {
  return dayjs(isoString).format('DD/MM/YYYY');
};

const formatTime = (isoString) => {
  return dayjs(isoString).format('HH:mm');
};

onMounted(async () => {
  // Ensure stores are populated when modal opens
  await productStore.fetchProducts();
  await serviceStore.fetchServices();
  await barberStore.fetchBarbers(); // Ensure barbers are fetched for display
});

// Styles for the modal (copied from CalendarView for consistency)
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 90%; /* Adjusted for wider modal */
  max-width: 900px; /* Max width for larger screens */
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

/* Custom button styles (copied from CalendarView for consistency) */
.btn-primary {
  @apply bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50;
}

.form-select {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent;
}
</style>
