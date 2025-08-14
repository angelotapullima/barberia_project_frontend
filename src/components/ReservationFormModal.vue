<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container max-w-2xl overflow-y-auto max-h-[90vh]">
        <div class="modal-header">
          <slot name="header">
            <h3 class="text-xl font-bold">Añadir Cita</h3>
          </slot>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitReservation">
            <div class="mb-4">
              <label
                for="clientName"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Nombre del Cliente:</label
              >
              <input
                type="text"
                id="clientName"
                v-model="newReservation.client_name"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div class="mb-4">
              <label
                for="barber"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Barbero:</label
              >
              <select
                id="barber"
                v-model="newReservation.barber_id"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option :value="null" disabled>Seleccionar Barbero</option>
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
                for="station"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Estación:</label
              >
              <select
                id="station"
                v-model="newReservation.station_id"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option :value="null" disabled>Seleccionar Estación</option>
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
                for="service"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Servicio:</label
              >
              <select
                id="service"
                v-model="newReservation.service_id"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option :value="null" disabled>Seleccionar Servicio</option>
                <option
                  v-for="service in serviceStore.services"
                  :key="service.id"
                  :value="service.id"
                >
                  {{ service.name }} ({{ service.duration_minutes }} min)
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label
                for="date"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Fecha:</label
              >
              <input
                type="date"
                id="date"
                v-model="newReservation.date"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div class="mb-4">
              <label
                for="time"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Hora:</label
              >
              <input
                type="time"
                id="time"
                v-model="newReservation.time"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div class="mb-4">
              <label
                for="clientPhone"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Teléfono del Cliente (Opcional):</label
              >
              <input
                type="tel"
                id="clientPhone"
                v-model="newReservation.client_phone"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div class="mb-4">
              <label
                for="clientEmail"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Email del Cliente (Opcional):</label
              >
              <input
                type="email"
                id="clientEmail"
                v-model="newReservation.client_email"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div class="mb-4">
              <label
                for="notes"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Notas (Opcional):</label
              >
              <textarea
                id="notes"
                v-model="newReservation.notes"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>

            <div class="flex items-center justify-between">
              <button type="submit" class="btn-primary">Guardar Cita</button>
              <button
                type="button"
                class="btn-secondary"
                @click="$emit('close')"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useBarberStore } from '../stores/barberStore';
import { useReservationStore } from '../stores/reservationStore';
import { useServiceStore } from '../stores/serviceStore';
import { useStationStore } from '../stores/stationStore';
import dayjs from 'dayjs';

const props = defineProps({
  show: Boolean,
  initialBarberId: [Number, String],
  initialDate: String,
  initialHour: String,
});

const emit = defineEmits(['close', 'reservationCreated']);

const barberStore = useBarberStore();
const reservationStore = useReservationStore();
const serviceStore = useServiceStore();
const stationStore = useStationStore();

const newReservation = ref({
  client_name: '',
  barber_id: null,
  station_id: null,
  service_id: null,
  date: '',
  time: '',
  client_phone: '',
  client_email: '',
  notes: '',
});

// Watch for initial props to pre-fill the form
watch(
  () => props.initialBarberId,
  (newVal) => {
    if (newVal) newReservation.value.barber_id = newVal;
  },
  { immediate: true },
);

watch(
  () => props.initialDate,
  (newVal) => {
    if (newVal) newReservation.value.date = newVal;
  },
  { immediate: true },
);

watch(
  () => props.initialHour,
  (newVal) => {
    if (newVal) newReservation.value.time = newVal;
  },
  { immediate: true },
);

const submitReservation = async () => {
  try {
    const startDateTime = dayjs(
      `${newReservation.value.date} ${newReservation.value.time}`,
    ).local();

    const selectedService = serviceStore.services.find(
      (s) => s.id === newReservation.value.service_id,
    );
    if (!selectedService) {
      alert('Por favor, selecciona un servicio válido.');
      return;
    }
    const endDateTime = startDateTime.add(
      selectedService.duration_minutes,
      'minute',
    );

    const reservationData = {
      client_name: newReservation.value.client_name,
      barber_id: newReservation.value.barber_id,
      station_id: newReservation.value.station_id,
      service_id: newReservation.value.service_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      client_phone: newReservation.value.client_phone,
      client_email: newReservation.value.client_email,
      notes: newReservation.value.notes,
      status: 'reservado', // Initial status
    };

    await reservationStore.addReservation(reservationData);
    alert('Cita guardada exitosamente!');
    emit('reservationCreated'); // Notify parent
    emit('close');
    resetNewReservationForm();
  } catch (error) {
    alert(`Error al guardar la cita: ${error.message || error}`);
  }
};

const resetNewReservationForm = () => {
  newReservation.value = {
    client_name: '',
    barber_id: props.initialBarberId || null,
    station_id: null,
    service_id: null,
    date: props.initialDate || '',
    time: props.initialHour || '',
    client_phone: '',
    client_email: '',
    notes: '',
  };
};

onMounted(async () => {
  await barberStore.getAllBarbers();
  await serviceStore.fetchServices();
  await stationStore.fetchStations();
});
</script>

<style scoped>
/* Styles for the modal (copied from CalendarView for consistency) */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 90%; /* Adjusted for wider modal */
  max-width: 900px; /* Max width for larger screens */
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

/* Custom button styles (copied from CalendarView for consistency) */
.btn-primary {
  @apply bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50;
}

.form-select {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent;
}
</style>
