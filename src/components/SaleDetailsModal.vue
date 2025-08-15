<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click="handleClickOutside">
      <div class="modal-container max-w-2xl">
        <div class="modal-header">
          <slot name="header">
            <h3 class="text-xl font-bold">Detalles de la Venta</h3>
          </slot>
        </div>

        <div class="modal-body">
          <div v-if="sale">
            <p><strong>ID de Venta:</strong> {{ sale.id }}</p>
            <p>
              <strong>Fecha de Venta:</strong> {{ formatDate(sale.sale_date) }}
            </p>
            <p><strong>Cliente:</strong> {{ sale.customer_name }}</p>
            <p><strong>Método de Pago:</strong> {{ sale.payment_method }}</p>
            <p>
              <strong>Monto Total:</strong> S/ {{ sale.total_amount.toFixed(2) }}
            </p>

            <h4 class="font-semibold mt-4 mb-2">Items de la Venta:</h4>
            <ul class="list-disc pl-5">
              <li v-for="item in sale.items" :key="item.id">
                {{ item.item_name }} ({{ Number(item.quantity) || 0 }} x
                S/ {{ (Number(item.unit_price) || 0).toFixed(2) }}) -
                S/ {{
                  (
                    (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
                  ).toFixed(2)
                }}
              </li>
            </ul>
          </div>
          <div v-else>
            <p>Cargando detalles de la venta...</p>
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
import { ref, watch, defineProps, defineEmits, onUnmounted } from 'vue'; // Add onUnmounted
import { useSalesStore } from '../stores/salesStore';
import dayjs from 'dayjs';

const props = defineProps({
  show: Boolean,
  reservationId: Number, // Pass reservationId to fetch sale details
});

const emit = defineEmits(['close']);

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

const salesStore = useSalesStore();
const sale = ref(null);

watch(
  () => props.show,
  async (newVal) => {
    if (newVal && props.reservationId) {
      sale.value = null; // Clear previous sale data
      try {
        // Assuming you have a method in salesStore to fetch sale by reservationId
        sale.value = await salesStore.fetchSaleByReservationId(
          props.reservationId,
        );
      } catch (error) {
        console.error('Error fetching sale details:', error);
        sale.value = {
          error: 'No se pudieron cargar los detalles de la venta.',
        };
      }
    }
  },
);

const formatDate = (isoString) => {
  return dayjs(isoString).format('DD/MM/YYYY HH:mm');
};
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
  width: 90%;
  max-width: 900px;
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
</style>
