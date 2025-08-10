<template>
  <div class="barbers-container">
    <h1 class="barbers-title">Gestión de Barberos</h1>

    <div v-if="barberStore.isLoading" class="loading-message">Cargando...</div>
    <div v-if="barberStore.error" class="error-message">
      {{ barberStore.error }}
    </div>

    <div class="barbers-table-wrapper">
      <div class="barbers-table-header">
        <h2 class="barbers-table-title">Lista de Barberos</h2>
        <button
          @click="openModal()"
          class="btn btn-primary"
        >
          Añadir Barbero
        </button>
      </div>
      <table class="barbers-table">
        <thead class="barbers-table-head">
          <tr>
            <th class="barbers-table-th">Nombre</th>
            <th class="barbers-table-th">Estación</th>
            <th class="barbers-table-th">Sueldo Base</th>
            <th class="barbers-table-th-actions"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="barbers-table-body">
          <tr v-for="barber in barberStore.barbers" :key="barber.id">
            <td class="barbers-table-td">{{ barber.name }}</td>
            <td class="barbers-table-td">{{ barber.station_name || 'N/A' }}</td>
            <td class="barbers-table-td">S/ {{ barber.base_salary }}</td>
            <td class="barbers-table-td-actions">
              <button @click="openModal(barber)" class="btn btn-link btn-edit">
                Editar
              </button>
              <button
                @click="confirmDelete(barber.id)"
                class="btn btn-link btn-delete"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="barberStore.barbers.length === 0">
            <td colspan="4" class="barbers-table-td-empty">
              No se encontraron barberos.
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
            <label for="name" class="form-label">Nombre</label>
            <input
              v-model="currentBarber.name"
              type="text"
              id="name"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="base_salary" class="form-label"
              >Sueldo Base</label
            >
            <input
              v-model.number="currentBarber.base_salary"
              type="number"
              id="base_salary"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="station" class="form-label">Estación</label>
            <select
              v-model="currentBarber.station_id"
              id="station"
              class="form-input"
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

<style scoped>
.barbers-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;
}

.barbers-title {
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

.barbers-table-wrapper {
  background-color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
}

.barbers-table-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.barbers-table-title {
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

.barbers-table {
  min-width: 100%;
  border-collapse: collapse;
}

.barbers-table-head {
  background-color: #f9fafb;
}

.barbers-table-th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.barbers-table-th-actions {
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

.barbers-table-body {
  background-color: #fff;
}

.barbers-table-body tr {
  border-bottom: 1px solid #e5e7eb;
}

.barbers-table-body tr:last-child {
  border-bottom: none;
}

.barbers-table-td {
  padding: 1rem 1.5rem;
}

.barbers-table-td-actions {
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

.barbers-table-td-empty {
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