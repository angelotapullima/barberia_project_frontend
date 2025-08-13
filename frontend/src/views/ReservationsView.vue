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
              {{ reservation.customer_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.barber_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.station_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ new Date(reservation.start_time).toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ new Date(reservation.end_time).toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.status }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
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
import { onMounted, ref, reactive } from 'vue';
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
  } catch (error) {
    // Error handled by store
  }
}

function handleEdit(reservation) {
  editingReservation.id = reservation.id;
  editingReservation.customer_name = reservation.customer_name;
  editingReservation.customer_phone = reservation.customer_phone;
  editingReservation.barber_id = reservation.barber_id;
  editingReservation.station_id = reservation.station_id;
  editingReservation.start_time = reservation.start_time.slice(0, 16); // Format for datetime-local input
  editingReservation.end_time = reservation.end_time.slice(0, 16); // Format for datetime-local input
  editingReservation.status = reservation.status;
  showEditModal.value = true;
}

async function handleUpdateReservation() {
  try {
    await reservationStore.updateReservation(editingReservation.id, {
      ...editingReservation,
    });
    showEditModal.value = false;
    alert('Reserva actualizada con éxito!');
  } catch (error) {
    // Error handled by store
  }
}

async function handleDelete(id) {
  if (confirm('¿Está seguro de que desea eliminar esta reserva?')) {
    try {
      await reservationStore.deleteReservation(id);
      alert('Reserva eliminada con éxito!');
    } catch (error) {
      // Error handled by store
    }
  }
}

onMounted(() => {
  reservationStore.fetchReservations();
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
