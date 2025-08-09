<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold mb-6">Gestión de Servicios</h1>

    <div v-if="store.isLoading" class="text-center text-gray-500">Cargando...</div>
    <div v-if="store.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{{ store.error }}</div>

    <div class="bg-white shadow-md rounded-lg">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold">Lista de Servicios</h2>
        <button @click="openModal()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Añadir Servicio</button>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
            <th class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="service in store.services" :key="service.id">
            <td class="px-6 py-4">{{ service.name }}</td>
            <td class="px-6 py-4">S/ {{ service.price.toFixed(2) }}</td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <button @click="openModal(service)" class="text-indigo-600 hover:text-indigo-900">Editar</button>
              <button @click="confirmDelete(service.id)" class="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
            </td>
          </tr>
          <tr v-if="store.services.length === 0">
            <td colspan="3" class="px-6 py-4 text-center text-gray-500">No se encontraron servicios.</td>
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
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre del Servicio</label>
            <input v-model="currentService.name" type="text" id="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
          </div>
          <div class="mb-4">
            <label for="price" class="block text-sm font-medium text-gray-700">Precio (S/)</label>
            <input v-model.number="currentService.price" type="number" step="0.50" id="price" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
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
import { useServiceStore } from '@/stores/serviceStore';

const store = useServiceStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentService = ref({});

const modalTitle = computed(() => isEditing.value ? 'Editar Servicio' : 'Añadir Nuevo Servicio');

function openModal(service = null) {
  store.error = null;
  if (service) {
    isEditing.value = true;
    currentService.value = { ...service };
  } else {
    isEditing.value = false;
    currentService.value = { name: '', price: 0 };
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function handleSubmit() {
  try {
    if (isEditing.value) {
      await store.updateService(currentService.value);
    } else {
      await store.addService(currentService.value);
    }
    closeModal();
  } catch (error) {
    // Error is handled and displayed by the template
  }
}

function confirmDelete(id) {
  store.error = null;
  if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
    store.deleteService(id);
  }
}

onMounted(() => {
  store.fetchServices();
});
</script>
