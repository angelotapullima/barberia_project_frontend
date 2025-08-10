<template>
  <div class="stations-container">
    <h1 class="stations-title">Gestión de Estaciones</h1>

    <div v-if="store.isLoading" class="loading-message">Cargando...</div>
    <div v-if="store.error" class="error-message">
      {{ store.error }}
    </div>

    <div class="stations-table-wrapper">
      <div class="stations-table-header">
        <h2 class="stations-table-title">Lista de Estaciones</h2>
        <button
          @click="openModal()"
          class="btn btn-primary"
        >
          Añadir Estación
        </button>
      </div>
      <table class="stations-table">
        <thead class="stations-table-head">
          <tr>
            <th class="stations-table-th">Nombre</th>
            <th class="stations-table-th-actions"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="stations-table-body">
          <tr v-for="station in store.stations" :key="station.id">
            <td class="stations-table-td">{{ station.name }}</td>
            <td class="stations-table-td-actions">
              <button @click="openModal(station)" class="btn btn-link btn-edit">
                Editar
              </button>
              <button
                @click="confirmDelete(station.id)"
                class="btn btn-link btn-delete"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="store.stations.length === 0">
            <td colspan="2" class="stations-table-td-empty">
              No se encontraron estaciones.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="modal-overlay"
    >
      <div class="modal-content">
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name" class="form-label"
              >Nombre de la Estación</label
            >
            <input
              v-model="currentStation.name"
              type="text"
              id="name"
              class="form-input"
              required
            />
          </div>
          <div class="form-actions">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
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
const currentStation = ref({});

const modalTitle = computed(() => (isEditing.value ? 'Editar Estación' : 'Añadir Nueva Estación'));

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
  if (
    window.confirm(
      '¿Estás seguro de que quieres eliminar esta estación? Esta acción no se puede deshacer.'
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
.stations-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;
}

.stations-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.loading-message {
  text-align: center;
  color: #6b7280;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #b91c1c;
  background-color: #fee2e2;
  border-radius: 0.5rem;
}

.stations-table-wrapper {
  background-color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
}

.stations-table-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stations-table-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.btn {
  padding: 0.5rem 1rem;
  font-weight: 700;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.btn-primary {
  background-color: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.stations-table {
  min-width: 100%;
  border-collapse: collapse;
}

.stations-table-head {
  background-color: #f9fafb;
}

.stations-table-th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.stations-table-th-actions {
  position: relative;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.stations-table-body {
  background-color: #fff;
}

.stations-table-body tr {
  border-bottom: 1px solid #e5e7eb;
}

.stations-table-body tr:last-child {
  border-bottom: none;
}

.stations-table-td {
  padding: 1rem 1.5rem;
}

.stations-table-td-actions {
  padding: 1rem 1.5rem;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}

.btn-edit {
  color: #4f46e5;
}

.btn-edit:hover {
  color: #3730a3;
}

.btn-delete {
  color: #dc2626;
  margin-left: 1rem;
}

.btn-delete:hover {
  color: #7f1d1d;
}

.stations-table-td-empty {
  padding: 1rem 1.5rem;
  text-align: center;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(75, 85, 99, 0.5);
  overflow-y: auto;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Ensure modal is on top */
}

.modal-content {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.375rem;
  background-color: #fff;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: #111827;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  margin-top: 0.25rem;
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
  margin-right: 0.5rem;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}
</style>