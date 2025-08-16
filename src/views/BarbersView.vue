<template>
  <div class="container mx-auto">
    <div v-if="barberStore.isLoading" class="text-center text-gray-500">
      Cargando...
    </div>
    <div
      v-if="barberStore.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ barberStore.error }}
    </div>

    <div class="bg-white">
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Lista de Barberos</h2>
        <button
          @click="openModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          Añadir Barbero
        </button>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden lg:block overflow-x-auto">
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
                Estación
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Sueldo Base
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
            <tr v-for="barber in barberStore.barbers" :key="barber.id">
              <td class="px-6 py-4">{{ barber.name }}</td>
              <td class="px-6 py-4">{{ getStationName(barber.station_id) }}</td>
              <td class="px-6 py-4">S/ {{ barber.base_salary }}</td>
              <td class="px-6 py-4">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-green-100 text-green-800': barber.is_active,
                    'bg-red-100 text-red-800': !barber.is_active,
                  }"
                >
                  {{ barber.is_active ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium">
                <button
                  @click="openModal(barber)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
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
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No se encontraron barberos.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="block lg:hidden p-4 bg-white">
        <div
          v-if="barberStore.barbers.length === 0"
          class="text-center text-gray-500 py-4"
        >
          No se encontraron barberos.
        </div>
        <div class="grid grid-cols-1 gap-0">
          <div
            v-for="barber in barberStore.barbers"
            :key="barber.id"
            class="p-4 transition-shadow duration-300 flex flex-col justify-between border-b border-gray-200"
          >
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ barber.name }}
              </h3>
              <div class="space-y-2 text-gray-700">
                <p class="text-sm">
                  <span class="font-medium">Estación:</span>
                  {{ getStationName(barber.station_id) }}
                </p>
                <p class="text-sm">
                  <span class="font-medium">Sueldo Base:</span> S/
                  {{ barber.base_salary }}
                </p>
                <p class="text-sm">
                  <span class="font-medium">Activo:</span>
                  <span
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-green-100 text-green-800': barber.is_active,
                      'bg-red-100 text-red-800': !barber.is_active,
                    }"
                  >
                    {{ barber.is_active ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <button
                @click="openModal(barber)"
                class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                Editar
              </button>
              <button
                @click="confirmDelete(barber.id)"
                class="text-red-600 hover:text-red-800 text-sm font-semibold ml-2"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
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
              >Nombre</label
            >
            <input
              v-model="currentBarber.name"
              type="text"
              id="name"
              class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="base_salary"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Sueldo Base</label
            >
            <input
              v-model.number="currentBarber.base_salary"
              type="number"
              id="base_salary"
              class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div class="mb-4">
            <label
              for="station"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Estación</label
            >
            <select
              v-model="currentBarber.station_id"
              id="station"
              class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
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
          <div class="mb-4 flex items-center">
            <input
              type="checkbox"
              id="is_active"
              v-model="currentBarber.is_active"
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
import { useBarberStore } from '@/stores/barberStore';
import { useStationStore } from '@/stores/stationStore';

const barberStore = useBarberStore();
const stationStore = useStationStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentBarber = ref({
  name: '',
  base_salary: 1250, // Default base salary
  station_id: null,
  is_active: true, // New field
});

const modalTitle = computed(() =>
  isEditing.value ? 'Editar Barbero' : 'Añadir Nuevo Barbero',
);

function getStationName(stationId) {
  if (!stationId || !stationStore.stations) return 'N/A';
  const station = stationStore.stations.find((s) => s.id === stationId);
  return station ? station.name : 'N/A';
}

function openModal(barber = null) {
  if (barber) {
    isEditing.value = true;
    currentBarber.value = { ...barber };
  } else {
    isEditing.value = false;
    currentBarber.value = {
      name: '',
      base_salary: 1250,
      station_id: null,
      is_active: true,
    };
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
  if (
    window.confirm(
      '¿Estás seguro de que quieres eliminar este barbero? (Se marcará como inactivo)',
    )
  ) {
    barberStore.deleteBarber(id);
  }
}

onMounted(() => {
  barberStore.getAllBarbers();
  stationStore.fetchStations();
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
