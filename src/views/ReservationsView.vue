<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Gestión de Reservas
    </h1>

    <div class="bg-white shadow-lg rounded-xl p-8 mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        Registrar Nueva Reserva
      </h2>
      <form
        @submit.prevent="handleAddReservation"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label
            for="customer_name"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Nombre del Cliente</label
          >
          <input
            v-model="newReservation.customer_name"
            type="text"
            id="customer_name"
            class="form-input"
            required
          />
        </div>
        <div>
          <label
            for="customer_phone"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Teléfono del Cliente (Opcional)</label
          >
          <input
            v-model="newReservation.customer_phone"
            type="text"
            id="customer_phone"
            class="form-input"
          />
        </div>
        <div>
          <label
            for="barber_id"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Barbero</label
          >
          <select
            v-model="newReservation.barber_id"
            id="barber_id"
            class="form-select"
            required
          >
            <option disabled value="">Seleccione un barbero</option>
            <option
              v-for="barber in barberStore.barbers"
              :key="barber.id"
              :value="barber.id"
            >
              {{ barber.name }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="station_id"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Estación</label
          >
          <select
            v-model="newReservation.station_id"
            id="station_id"
            class="form-select"
            required
          >
            <option disabled value="">Seleccione una estación</option>
            <option
              v-for="station in stationStore.stations"
              :key="station.id"
              :value="station.id"
            >
              {{ station.name }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="start_time"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Hora de Inicio</label
          >
          <input
            v-model="newReservation.start_time"
            type="datetime-local"
            id="start_time"
            class="form-input"
            required
          />
        </div>
        <div>
          <label
            for="end_time"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Hora de Fin</label
          >
          <input
            v-model="newReservation.end_time"
            type="datetime-local"
            id="end_time"
            class="form-input"
            required
          />
        </div>
        <div class="md:col-span-2 flex justify-end">
          <button
            type="submit"
            class="btn-primary"
            :disabled="reservationStore.isLoading"
          >
            {{
              reservationStore.isLoading
                ? 'Registrando...'
                : 'Registrar Reserva'
            }}
          </button>
        </div>
      </form>
      <div
        v-if="reservationStore.error"
        class="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg"
      >
        Error: {{ reservationStore.error }}
      </div>
    </div>

    <div
      v-if="reservationStore.isLoading"
      class="text-center text-gray-600 text-lg"
    >
      Cargando reservas...
    </div>
    <div
      v-else-if="reservationStore.reservations.length === 0"
      class="text-center text-gray-600 text-lg"
    >
      No hay reservas para mostrar.
    </div>
    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Cliente
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Barbero
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Estación
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Inicio
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Fin
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="reservation in reservationStore.reservations"
            :key="reservation.id"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.client_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.barber_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.station_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ new Date(reservation.start_time).toLocaleDateString() }}<br />
              {{
                new Date(reservation.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ new Date(reservation.end_time).toLocaleDateString() }}<br />
              {{
                new Date(reservation.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.status }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                v-if="reservation.status === 'pending'"
                @click="handleEdit(reservation)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Editar
              </button>
              <button
                @click="handleDelete(reservation.id)"
                class="text-red-600 hover:text-red-900"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div
        class="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-t"
      >
        <!-- Items per page selector -->
        <div class="mb-2 sm:mb-0 relative inline-flex items-center">
          <label for="itemsPerPage" class="text-gray-700 mr-2">Mostrar:</label>
          <select
            id="itemsPerPage"
            v-model.number="itemsPerPage"
            class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="option in itemsPerPageOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
          />
        </div>

        <!-- Page navigation buttons -->
        <div class="flex items-center space-x-2">
          <button
            @click="prevPage"
            :disabled="reservationStore.currentPage === 1 || totalPages === 0"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition duration-150 ease-in-out"
          >
            Anterior
          </button>
          <span class="text-gray-700 font-medium">
            <template v-if="totalPages > 0">
              Página {{ reservationStore.currentPage }} de {{ totalPages }}
            </template>
            <template v-else> No hay reservas </template>
          </span>
          <button
            @click="nextPage"
            :disabled="
              reservationStore.currentPage === totalPages || totalPages === 0
            "
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition duration-150 ease-in-out"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3
              class="text-lg leading-6 font-medium text-gray-900"
              id="modal-title"
            >
              Editar Reserva
            </h3>
            <div class="mt-2">
              <form @submit.prevent="handleUpdateReservation">
                <div class="mb-4">
                  <label
                    for="edit_customer_name"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >Nombre del Cliente</label
                  >
                  <input
                    v-model="editingReservation.customer_name"
                    type="text"
                    id="edit_customer_name"
                    class="form-input"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label
                    for="edit_customer_phone"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >Teléfono del Cliente</label
                  >
                  <input
                    v-model="editingReservation.customer_phone"
                    type="text"
                    id="edit_customer_phone"
                    class="form-input"
                  />
                </div>
                <div class="mb-4">
                  <label
                    for="edit_barber_id"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >Barbero</label
                  >
                  <select
                    v-model="editingReservation.barber_id"
                    id="edit_barber_id"
                    class="form-select"
                    required
                  >
                    <option
                      v-for="barber in barberStore.barbers"
                      :key="barber.id"
                      :value="barber.id"
                    >
                      {{ barber.name }}
                    </option>
                  </select>
                </div>
                <div class="mb-4">
                  <label
                    for="edit_station_id"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >Estación</label
                  >
                  <select
                    v-model="editingReservation.station_id"
                    id="edit_station_id"
                    class="form-select"
                    required
                  >
                    <option
                      v-for="station in stationStore.stations"
                      :key="station.id"
                      :value="station.id"
                    >
                      {{ station.name }}
                    </option>
                  </select>
                </div>
                <div class="mb-4">
                  <label
                    for="edit_start_time"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >Hora de Inicio</label
                  >
                  <input
                    v-model="editingReservation.start_time"
                    type="datetime-local"
                    id="edit_start_time"
                    class="form-input"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label
                    for="edit_end_time"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >Hora de Fin</label
                  >
                  <input
                    v-model="editingReservation.end_time"
                    type="datetime-local"
                    id="edit_end_time"
                    class="form-input"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label
                    for="edit_status"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >Estado</label
                  >
                  <select
                    v-model="editingReservation.status"
                    id="edit_status"
                    class="form-select"
                    required
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>
                <div
                  class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
                >
                  <button
                    type="submit"
                    class="btn-primary mr-2"
                    :disabled="reservationStore.isLoading"
                  >
                    {{
                      reservationStore.isLoading
                        ? 'Actualizando...'
                        : 'Actualizar'
                    }}
                  </button>
                  <button
                    type="button"
                    @click="showEditModal = false"
                    class="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed, watch } from 'vue'; // Add computed
import { useReservationStore } from '@/stores/reservationStore';
import { useBarberStore } from '@/stores/barberStore';
import { useStationStore } from '@/stores/stationStore';

const reservationStore = useReservationStore();
const barberStore = useBarberStore();
const stationStore = useStationStore();

const newReservation = reactive({
  customer_name: '',
  customer_phone: '',
  barber_id: '',
  station_id: '',
  start_time: '',
  end_time: '',
});

const showEditModal = ref(false);
const editingReservation = reactive({});

// Pagination state
const itemsPerPage = ref(10); // You can adjust this value
const itemsPerPageOptions = [10, 50, 100];

const totalPages = computed(() => {
  if (reservationStore.totalReservationsCount > 0 && itemsPerPage.value > 0) {
    return Math.ceil(
      reservationStore.totalReservationsCount / itemsPerPage.value,
    );
  }
  return 0;
});

async function fetchReservations() {
  await reservationStore.fetchReservations(
    reservationStore.currentPage,
    itemsPerPage.value,
  );
}

async function handleAddReservation() {
  try {
    await reservationStore.addReservation({ ...newReservation });
    // Reset form
    newReservation.customer_name = '';
    newReservation.customer_phone = '';
    newReservation.barber_id = '';
    newReservation.station_id = '';
    newReservation.start_time = '';
    newReservation.end_time = '';
    alert('Reserva registrada con éxito!');
    reservationStore.currentPage = 1; // Reset to first page after adding
    fetchReservations(); // Refresh list after adding
  } catch (error) {
    // Error handled by store
  }
}

function handleEdit(reservation) {
  editingReservation.id = reservation.id;
  editingReservation.customer_name = reservation.client_name; // Use client_name from backend
  editingReservation.customer_phone = reservation.client_phone; // Use client_phone from backend
  editingReservation.barber_id = reservation.barber_id;
  editingReservation.station_id = reservation.station_id;
  editingReservation.start_time = new Date(reservation.start_time)
    .toISOString()
    .slice(0, 16); // Format for datetime-local input
  editingReservation.end_time = new Date(reservation.end_time)
    .toISOString()
    .slice(0, 16); // Format for datetime-local input
  editingReservation.status = reservation.status;
  showEditModal.value = true;
}

async function handleUpdateReservation() {
  try {
    await reservationStore.updateReservation(editingReservation.id, {
      client_name: editingReservation.customer_name, // Map back to client_name for backend
      client_phone: editingReservation.customer_phone, // Map back to client_phone for backend
      barber_id: editingReservation.barber_id,
      station_id: editingReservation.station_id,
      start_time: editingReservation.start_time,
      end_time: editingReservation.end_time,
      status: editingReservation.status,
    });
    showEditModal.value = false;
    alert('Reserva actualizada con éxito!');
    fetchReservations(); // Refresh list after updating
  } catch (error) {
    // Error handled by store
  }
}

async function handleDelete(id) {
  if (confirm('¿Está seguro de que desea eliminar esta reserva?')) {
    try {
      await reservationStore.deleteReservation(id);
      alert('Reserva eliminada con éxito!');
      fetchReservations(); // Refresh list after deleting
    } catch (error) {
      // Error handled by store
    }
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    reservationStore.currentPage = page;
    fetchReservations();
  }
}

function nextPage() {
  if (reservationStore.currentPage < totalPages.value) {
    reservationStore.currentPage++;
    fetchReservations();
  }
}

function prevPage() {
  if (reservationStore.currentPage > 1) {
    reservationStore.currentPage--;
    fetchReservations();
  }
}

// Watch for changes in itemsPerPage and reset to first page
watch(itemsPerPage, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    reservationStore.currentPage = 1; // Reset to first page when items per page changes
    fetchReservations();
  }
});

onMounted(() => {
  fetchReservations(); // Fetch reservations when component mounts
  barberStore.getAllBarbers();
  stationStore.fetchStations();
});
</script>

<style scoped>
.form-input,
.form-select {
  @apply block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out;
}

.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition duration-150 ease-in-out;
}

.btn-secondary {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out;
}
</style>
