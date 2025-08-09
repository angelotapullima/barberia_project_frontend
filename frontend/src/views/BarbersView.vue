<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold mb-6">Gestión de Barberos</h1>

    <div v-if="barberStore.isLoading" class="text-center text-gray-500">Cargando...</div>
    <div v-if="barberStore.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ barberStore.error }}
    </div>

    <div class="bg-white shadow-md rounded-lg">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold">Lista de Barberos</h2>
        <button
          @click="openModal()"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Añadir Barbero
        </button>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Estación
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Sueldo Base
            </th>
            <th class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="barber in barberStore.barbers" :key="barber.id">
            <td class="px-6 py-4">{{ barber.name }}</td>
            <td class="px-6 py-4">{{ barber.station_name || 'N/A' }}</td>
            <td class="px-6 py-4">S/ {{ barber.base_salary }}</td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <button @click="openModal(barber)" class="text-indigo-600 hover:text-indigo-900">
                Editar
              </button>
              <button
                @click="confirmDelete(barber.id)"
                class="text-red-600 hover:text-red-900 ml-4"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="barberStore.barbers.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              No se encontraron barberos.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
    >
      <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">{{ modalTitle }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="currentBarber.name"
              type="text"
              id="name"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label for="base_salary" class="block text-sm font-medium text-gray-700"
              >Sueldo Base</label
            >
            <input
              v-model.number="currentBarber.base_salary"
              type="number"
              id="base_salary"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div class="mb-4">
            <label for="station" class="block text-sm font-medium text-gray-700">Estación</label>
            <select
              v-model="currentBarber.station_id"
              id="station"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option :value="null">Sin asignar</option>
              <option
                v-for="station in stationStore.stations"
                :key="station.id"
                :value="station.id"
              >
                {{ station.name }}
              </option>
            </select>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useBarberStore } from '@/stores/barberStore';
import { useStationStore } from '@/stores/stationStore';

const barberStore = useBarberStore();
const stationStore = useStationStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentBarber = ref({});

const modalTitle = computed(() => (isEditing.value ? 'Editar Barbero' : 'Añadir Nuevo Barbero'));

function openModal(barber = null) {
  if (barber) {
    isEditing.value = true;
    currentBarber.value = { ...barber };
  } else {
    isEditing.value = false;
    currentBarber.value = { name: '', base_salary: 1300, station_id: null };
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function handleSubmit() {
  if (isEditing.value) {
    await barberStore.updateBarber(currentBarber.value);
  } else {
    await barberStore.addBarber(currentBarber.value);
  }
  closeModal();
}

function confirmDelete(id) {
  if (window.confirm('¿Estás seguro de que quieres eliminar este barbero?')) {
    barberStore.deleteBarber(id);
  }
}

onMounted(() => {
  barberStore.fetchBarbers();
  stationStore.fetchStations();
});
</script>
