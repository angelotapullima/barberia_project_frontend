<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold mb-6">Gestión de Estaciones</h1>

    <div v-if="store.isLoading" class="text-center text-gray-500">Cargando...</div>
    <div v-if="store.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{{ store.error }}</div>

    <div class="bg-white shadow-md rounded-lg">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold">Lista de Estaciones</h2>
        <button @click="openModal()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Añadir Estación</button>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="station in store.stations" :key="station.id">
            <td class="px-6 py-4">{{ station.name }}</td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <button @click="openModal(station)" class="text-indigo-600 hover:text-indigo-900">Editar</button>
              <button @click="confirmDelete(station.id)" class="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
            </td>
          </tr>
          <tr v-if="store.stations.length === 0">
            <td colspan="2" class="px-6 py-4 text-center text-gray-500">No se encontraron estaciones.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">{{ modalTitle }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre de la Estación</label>
            <input v-model="currentStation.name" type="text" id="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
          </div>
          <div class="mt-6 flex justify-end">
            <button type="button" @click="closeModal" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2">Cancelar</button>
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStationStore } from '@/stores/stationStore';

const store = useStationStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentStation = ref({});

const modalTitle = computed(() => isEditing.value ? 'Editar Estación' : 'Añadir Nueva Estación');

function openModal(station = null) {
  store.error = null; // Clear previous errors
  if (station) {
    isEditing.value = true;
    currentStation.value = { ...station };
  } else {
    isEditing.value = false;
    currentStation.value = { name: '' };
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function handleSubmit() {
  try {
    if (isEditing.value) {
      await store.updateStation(currentStation.value);
    } else {
      await store.addStation(currentStation.value);
    }
    closeModal();
  } catch (error) {
    // Error is already set in the store, the template will display it.
  }
}

function confirmDelete(id) {
    store.error = null; // Clear previous errors
    if (window.confirm('¿Estás seguro de que quieres eliminar esta estación? Esta acción no se puede deshacer.')) {
        store.deleteStation(id);
    }
}

onMounted(() => {
  store.fetchStations();
});
</script>
