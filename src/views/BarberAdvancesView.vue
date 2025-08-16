<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Registrar Adelanto de Sueldo
    </h1>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <form @submit.prevent="submitAdvance">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="barber"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Barbero</label
            >
            <select
              v-model="selectedBarber"
              id="barber"
              class="block w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option :value="null" disabled>Selecciona un barbero</option>
              <option
                v-for="barber in barbers"
                :key="barber.id"
                :value="barber.id"
              >
                {{ barber.name }}
              </option>
            </select>
          </div>
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
          <div class="md:col-span-2">
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
        <div class="mt-6 flex justify-end">
          <button
            type="submit"
            class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
          >
            Registrar Adelanto
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useBarberStore } from '@/stores/barberStore';
import api from '@/services/api';

const barberStore = useBarberStore();
const { barbers } = storeToRefs(barberStore);

const selectedBarber = ref(null);
const amount = ref(0);
const date = ref(new Date().toISOString().slice(0, 10));
const notes = ref('');

async function submitAdvance() {
  if (!selectedBarber.value || !amount.value || !date.value) {
    alert('Por favor, completa todos los campos requeridos.');
    return;
  }

  try {
    await api.post(`/barbers/${selectedBarber.value}/advances`, {
      amount: amount.value,
      date: date.value,
      notes: notes.value,
    });
    alert('Adelanto registrado exitosamente.');
    // Reset form
    selectedBarber.value = null;
    amount.value = 0;
    date.value = new Date().toISOString().slice(0, 10);
    notes.value = '';
  } catch (error) {
    console.error('Error registering advance:', error);
    alert('Error al registrar el adelanto.');
  }
}

onMounted(() => {
  barberStore.getAllBarbers();
});
</script>
