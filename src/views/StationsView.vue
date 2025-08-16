<template>
  <div class="container mx-auto">
    <div v-if="store.isLoading" class="text-center text-gray-500">
      Cargando...
    </div>
    <div
      v-if="store.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ store.error }}
    </div>

    <div class="bg-white shadow-lg rounded-xl p-6">
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">
          Lista de Estaciones
        </h2>
        <button
          @click="openModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          Añadir Estación
        </button>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Nombre
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Activo
            </th>
            <th class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="station in store.stations" :key="station.id">
            <td class="px-6 py-4">{{ station.name }}</td>
            <td class="px-6 py-4">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': station.is_active,
                  'bg-red-100 text-red-800': !station.is_active,
                }"
              >
                {{ station.is_active ? 'Sí' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <button
                @click="openModal(station)"
                class="text-indigo-600 hover:text-indigo-900"
              >
                Editar
              </button>
              <button
                @click="confirmDelete(station.id)"
                class="text-red-600 hover:text-red-900 ml-4"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="store.stations.length === 0">
            <td colspan="3" class="px-6 py-4 text-center text-gray-500">
              No se encontraron estaciones.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    >
      <div
        class="relative mx-auto p-6 border w-full max-w-md shadow-xl rounded-xl bg-white"
      >
        <h3 class="text-xl font-bold leading-6 text-gray-900 mb-6">
          {{ modalTitle }}
        </h3>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label
              for="name"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Nombre de la Estación</label
            >
            <input
              v-model="currentStation.name"
              type="text"
              id="name"
              class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              required
            />
          </div>
          <div class="mb-4 flex items-center">
            <input
              type="checkbox"
              id="is_active"
              v-model="currentStation.is_active"
              class="mr-2"
            />
            <label for="is_active" class="text-gray-700 text-sm font-bold"
              >Activo</label
            >
          </div>
          <div class="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
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
import { useStationStore } from '@/stores/stationStore';

const store = useStationStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentStation = ref({
  name: '',
  is_active: true, // New field
});

const modalTitle = computed(() =>
  isEditing.value ? 'Editar Estación' : 'Añadir Nueva Estación',
);

function openModal(station = null) {
  store.error = null; // Clear previous errors
  if (station) {
    isEditing.value = true;
    currentStation.value = { ...station };
  } else {
    isEditing.value = false;
    currentStation.value = {
      name: '',
      is_active: true,
    };
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
  if (
    window.confirm(
      '¿Estás seguro de que quieres eliminar esta estación? (Se marcará como inactiva)',
    )
  ) {
    store.deleteStation(id);
  }
}

onMounted(() => {
  store.fetchStations();
});
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50;
}
</style>
