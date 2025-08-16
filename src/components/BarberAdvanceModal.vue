<template>
  <Modal :show="show" @close="closeModal">
    <template #header>Registrar Adelanto para {{ barberName }}</template>
    <template #body>
      <form @submit.prevent="submitAdvance">
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label
              for="amount"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Monto</label
            >
            <input
              v-model.number="amount"
              type="number"
              id="amount"
              class="block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label
              for="date"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Fecha</label
            >
            <input
              v-model="date"
              type="date"
              id="date"
              class="block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label
              for="notes"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Notas</label
            >
            <textarea
              v-model="notes"
              id="notes"
              rows="3"
              class="block w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>
        </div>
        <div v-if="error" class="mt-4 text-red-500 text-sm">{{ error }}</div>
        <div class="mt-6 flex justify-end">
          <button
            type="button"
            @click="closeModal"
            class="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 mr-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isProcessing"
            class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {{ isProcessing ? 'Registrando...' : 'Registrar Adelanto' }}
          </button>
        </div>
      </form>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import Modal from './Modal.vue';
import api from '@/services/api';

const props = defineProps({
  show: Boolean,
  barberId: Number,
  barberName: String,
});

const emit = defineEmits(['close', 'advanceRegistered']);

const amount = ref(0);
const date = ref(new Date().toISOString().slice(0, 10));
const notes = ref('');
const isProcessing = ref(false);
const error = ref(null);

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      // Reset form when modal opens
      amount.value = 0;
      date.value = new Date().toISOString().slice(0, 10);
      notes.value = '';
      error.value = null;
    }
  },
);

const closeModal = () => {
  emit('close');
};

async function submitAdvance() {
  if (!props.barberId || !amount.value || !date.value) {
    error.value = 'Por favor, completa todos los campos requeridos.';
    return;
  }

  isProcessing.value = true;
  error.value = null;

  try {
    await api.post(`/barbers/${props.barberId}/advances`, {
      amount: amount.value,
      date: date.value,
      notes: notes.value,
    });
    alert('Adelanto registrado exitosamente.');
    emit('advanceRegistered');
    closeModal();
  } catch (err) {
    console.error('Error registering advance:', err);
    error.value =
      err.response?.data?.message || 'Error al registrar el adelanto.';
  } finally {
    isProcessing.value = false;
  }
}
</script>
