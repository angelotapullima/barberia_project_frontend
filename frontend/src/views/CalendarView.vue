<template>
  <div class="calendar-view p-4">
    <h1 class="text-2xl font-bold mb-4">Calendario de Citas</h1>

    <!-- Calendar Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex space-x-2">
        <button class="btn-primary" @click="goToToday">Hoy</button>
        <button class="btn-secondary" @click="goToPreviousWeek">&lt;</button>
        <button class="btn-secondary" @click="goToNextWeek">&gt;</button>
        <span class="text-lg font-semibold">{{ currentWeekRange }}</span>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Barber/Team Selector -->
        <select class="form-select" v-model="selectedBarberFilter">
          <option value="all">Todo el equipo</option>
          <option value="scheduled">Equipo programado</option>
          <optgroup label="Barberos Individuales">
            <option v-for="barber in barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
          </optgroup>
        </select>

        <!-- Add Button -->
        <button class="btn-primary" @click="openAddAppointmentModal">Añadir</button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid border border-gray-300 rounded-lg overflow-hidden">
      <!-- Days Header -->
      <div class="calendar-days-header grid grid-cols-8 bg-gray-100 border-b border-gray-300">
        <div class="col-span-1 p-2 font-semibold text-sm text-gray-600"></div> <!-- Empty corner for barber names -->
        <div v-for="day in weekDays" :key="day.date" class="p-2 text-center font-semibold text-sm text-gray-600 border-l border-gray-300">
          {{ day.name }} {{ day.date }}
        </div>
      </div>

      <!-- Calendar Body -->
      <div class="calendar-body grid grid-cols-8">
        <!-- Time Slots Column -->
        <div class="time-slots-column col-span-1 border-r border-gray-300">
          <div v-for="hour in hours" :key="hour" class="h-16 flex items-center justify-center text-xs text-gray-500 border-b border-gray-200 last:border-b-0">
            {{ hour }}
          </div>
        </div>

        <!-- Barber Rows and Appointments -->
        <div class="barber-calendar-area col-span-7 grid grid-cols-7">
          <div v-for="barber in filteredBarbers" :key="barber.id" class="barber-row col-span-7 border-b border-gray-200">
            <div class="barber-name-cell absolute left-0 w-1/8 h-16 flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
              {{ barber.name }}
            </div>
            <div class="barber-schedule grid grid-cols-7">
              <div v-for="day in weekDays" :key="day.date" class="schedule-day relative border-l border-gray-200 h-full">
                <!-- Time slots for each day -->
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="h-16 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50"
                  @click="openAddAppointmentModalWithTime(barber.id, day.fullDate, hour)"
                ></div>
                <!-- Appointments for this barber and day -->
                <div
                  v-for="reservation in getReservationsForBarberAndDay(barber.id, day.fullDate)"
                  :key="reservation.id"
                  class="appointment absolute bg-blue-200 text-blue-800 rounded-md p-1 text-xs overflow-hidden cursor-pointer"
                  :style="getAppointmentStyle(reservation)"
                  @click="viewAppointmentDetails(reservation)"
                >
                  <div class="font-semibold">{{ formatTime(reservation.start_time) }} - {{ formatTime(reservation.end_time) }}</div>
                  <div>{{ reservation.client_name }}</div>
                  <div class="absolute bottom-1 right-1 text-blue-600">▶</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Appointment Modal -->
    <div v-if="isAddAppointmentModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Añadir Cita</h2>
        <form @submit.prevent="submitReservation">
          <div class="mb-4">
            <label for="clientName" class="block text-gray-700 text-sm font-bold mb-2">Nombre del Cliente:</label>
            <input type="text" id="clientName" v-model="newReservation.client_name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
          </div>

          <div class="mb-4">
            <label for="barber" class="block text-gray-700 text-sm font-bold mb-2">Barbero:</label>
            <select id="barber" v-model="newReservation.barber_id" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
              <option v-for="barber in barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label for="service" class="block text-gray-700 text-sm font-bold mb-2">Servicio:</label>
            <select id="service" v-model="newReservation.service_id" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
              <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }} ({{ service.duration_minutes }} min)</option>
            </select>
          </div>

          <div class="mb-4">
            <label for="date" class="block text-gray-700 text-sm font-bold mb-2">Fecha:</label>
            <input type="date" id="date" v-model="newReservation.date" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
          </div>

          <div class="mb-4">
            <label for="time" class="block text-gray-700 text-sm font-bold mb-2">Hora:</label>
            <input type="time" id="time" v-model="newReservation.time" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
          </div>

          <div class="mb-4">
            <label for="clientPhone" class="block text-gray-700 text-sm font-bold mb-2">Teléfono del Cliente (Opcional):</label>
            <input type="tel" id="clientPhone" v-model="newReservation.client_phone" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>

          <div class="mb-4">
            <label for="clientEmail" class="block text-gray-700 text-sm font-bold mb-2">Email del Cliente (Opcional):</label>
            <input type="email" id="clientEmail" v-model="newReservation.client_email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>

          <div class="mb-4">
            <label for="notes" class="block text-gray-700 text-sm font-bold mb-2">Notas (Opcional):</label>
            <textarea id="notes" v-model="newReservation.notes" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
          </div>

          <div class="flex items-center justify-between">
            <button type="submit" class="btn-primary">Guardar Cita</button>
            <button type="button" class="btn-secondary" @click="isAddAppointmentModalOpen = false">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBarberStore } from '../stores/barberStore';
import { useReservationStore } from '../stores/reservationStore';
import { useServiceStore } from '../stores/serviceStore'; // New import
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Import Spanish locale

dayjs.locale('es'); // Set locale globally

const barberStore = useBarberStore();
const reservationStore = useReservationStore();
const serviceStore = useServiceStore(); // New initialization

const currentWeekStart = ref(dayjs().startOf('week'));
const selectedBarberFilter = ref('all'); // 'all', 'scheduled', or barber.id
const isAddAppointmentModalOpen = ref(false);
// Reactive variables to store pre-selected appointment details
const selectedBarberId = ref(null);
const selectedDate = ref(null);
const selectedHour = ref(null);

const newReservation = ref({
  client_name: '',
  barber_id: null,
  service_id: null,
  date: '',
  time: '',
  client_phone: '',
  client_email: '',
  notes: '',
});

const submitReservation = async () => {
  try {
    // Combine date and time into start_time
    const startDateTime = dayjs(`${newReservation.value.date} ${newReservation.value.time}`);

    // Get service duration
    const selectedService = serviceStore.services.find(s => s.id === newReservation.value.service_id);
    if (!selectedService) {
      alert('Por favor, selecciona un servicio válido.');
      return;
    }
    const endDateTime = startDateTime.add(selectedService.duration_minutes, 'minute');

    const reservationData = {
      client_name: newReservation.value.client_name,
      barber_id: newReservation.value.barber_id,
      service_id: newReservation.value.service_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      client_phone: newReservation.value.client_phone,
      client_email: newReservation.value.client_email,
      notes: newReservation.value.notes,
    };

    await reservationStore.addReservation(reservationData);
    alert('Cita guardada exitosamente!');
    isAddAppointmentModalOpen.value = false;
    resetNewReservationForm();
    await fetchReservationsForCurrentWeek(); // Refresh calendar
  } catch (error) {
    alert(`Error al guardar la cita: ${error.message || error}`);
  }
};

const resetNewReservationForm = () => {
  newReservation.value = {
    client_name: '',
    barber_id: null,
    service_id: null,
    date: '',
    time: '',
    client_phone: '',
    client_email: '',
    notes: '',
  };
};

// Watch for changes in selectedBarberId, selectedDate, selectedHour to pre-fill the form
watch([selectedBarberId, selectedDate, selectedHour], () => {
  if (selectedBarberId.value) {
    newReservation.value.barber_id = selectedBarberId.value;
  }
  if (selectedDate.value) {
    newReservation.value.date = selectedDate.value;
  }
  if (selectedHour.value) {
    newReservation.value.time = selectedHour.value.split(':')[0] + ':00'; // Ensure format HH:00
  }
});

// Computed properties for calendar display
const weekDays = computed(() => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = currentWeekStart.value.add(i, 'day');
    days.push({
      name: date.format('ddd'), // e.g., 'Lun'
      date: date.format('DD MMM'), // e.g., '10 Ago'
      fullDate: date.format('YYYY-MM-DD')
    });
  }
  return days;
});

const currentWeekRange = computed(() => {
  const start = currentWeekStart.value.format('DD MMM');
  const end = currentWeekStart.value.add(6, 'day').format('DD MMM, YYYY');
  return `${start} - ${end}`;
});

const hours = computed(() => {
  const h = [];
  for (let i = 8; i <= 20; i++) { // 8 AM to 8 PM
    h.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return h;
});

// Filtered barbers based on selection
const filteredBarbers = computed(() => {
  if (selectedBarberFilter.value === 'all') {
    return barberStore.barbers;
  } else if (selectedBarberFilter.value === 'scheduled') {
    // This would require logic to determine which barbers have appointments in the current week
    // For now, it will return all barbers, or you can implement specific logic here.
    return barberStore.barbers;
  } else {
    return barberStore.barbers.filter(b => b.id === selectedBarberFilter.value);
  }
});

// Methods for navigation
const goToToday = () => {
  currentWeekStart.value = dayjs().startOf('week');
};

const goToPreviousWeek = () => {
  currentWeekStart.value = currentWeekStart.value.subtract(1, 'week');
};

const goToNextWeek = () => {
  currentWeekStart.value = currentWeekStart.value.add(1, 'week');
};

// Method to get reservations for a specific barber and day
const getReservationsForBarberAndDay = (barberId, date) => {
  return reservationStore.reservations.filter(res =>
    res.barber_id === barberId && dayjs(res.start_time).format('YYYY-MM-DD') === date
  );
};

// Method to calculate appointment style (position and height)
const getAppointmentStyle = (reservation) => {
  const start = dayjs(reservation.start_time);
  const end = dayjs(reservation.end_time);
  const startHour = start.hour();
  const startMinute = start.minute();
  const endHour = end.hour();
  const endMinute = end.minute();

  // Calculate top position (relative to the start of the 8 AM hour)
  // Assuming each hour slot is 64px (h-16 in Tailwind, 16 * 4 = 64px)
  const pixelsPerHour = 64;
  const topOffsetMinutes = (startHour - 8) * 60 + startMinute;
  const top = (topOffsetMinutes / 60) * pixelsPerHour;

  // Calculate height based on duration
  const durationMinutes = end.diff(start, 'minute');
  const height = (durationMinutes / 60) * pixelsPerHour;

  return {
    top: `${top}px`,
    height: `${height}px`,
    left: '0', // Appointments span the full width of the day cell
    width: '100%',
  };
};

// Helper to format time
const formatTime = (dateTimeString) => {
  return dayjs(dateTimeString).format('HH:mm');
};

// Modal functions
const openAddAppointmentModalWithTime = (barberId, date, hour) => {
  selectedBarberId.value = barberId;
  selectedDate.value = date;
  selectedHour.value = hour;
  isAddAppointmentModalOpen.value = true;
};

const openAddAppointmentModal = () => {
  selectedBarberId.value = null;
  selectedDate.value = null;
  selectedHour.value = null;
  isAddAppointmentModalOpen.value = true;
};

const viewAppointmentDetails = (reservation) => {
  alert(`Detalles de la cita:
Cliente: ${reservation.client_name}
Barbero: ${barberStore.barbers.find(b => b.id === reservation.barber_id)?.name}
Hora: ${formatTime(reservation.start_time)} - ${formatTime(reservation.end_time)}
Estado: ${reservation.status}`);
  // In a real app, you'd open a detailed modal here
};

const fetchReservationsForCurrentWeek = async () => {
  const startDate = currentWeekStart.value.startOf('day').toISOString();
  const endDate = currentWeekStart.value.endOf('week').endOf('day').toISOString();
  reservationStore.reservations = await reservationStore.fetchReservationsByDateRange(startDate, endDate);
};

// Watch for changes in currentWeekStart to refetch reservations
watch(currentWeekStart, fetchReservationsForCurrentWeek);

// Fetch data on component mount
onMounted(async () => {
  await barberStore.fetchBarbers();
  await serviceStore.fetchServices(); // Fetch services
  await fetchReservationsForCurrentWeek();
});
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: 1fr 7fr; /* 1 column for time slots, 7 for days */
  grid-template-rows: auto 1fr; /* Header row, then main content */
}

.calendar-days-header {
  grid-column: 1 / -1; /* Span all columns */
  display: grid;
  grid-template-columns: 1fr repeat(7, 1fr); /* Explicitly define 8 columns: 1 for the empty cell, 7 for the days */
}

.calendar-body {
  grid-column: 1 / -1; /* Span all columns */
  display: grid;
  grid-template-columns: subgrid;
}

.time-slots-column {
  grid-row: 2 / -1; /* Span from second row to end */
}

.barber-calendar-area {
  grid-column: 2 / -1; /* Span from second column to end */
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7 columns for days */
  position: relative; /* For absolute positioning of barber names */
}

.barber-row {
  display: contents; /* Allows children to be placed directly in the grid */
}

.barber-name-cell {
  grid-column: 1; /* Place in the first column of the barber-calendar-area */
  position: sticky; /* Make it stick when scrolling horizontally */
  left: 0;
  z-index: 10; /* Ensure it's above other content */
  height: 100%; /* Take full height of the row */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px;
  box-sizing: border-box;
}

.barber-schedule {
  grid-column: 1 / -1; /* Span all 7 columns within the barber-row */
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.schedule-day {
  min-height: 600px; /* Adjust based on your desired calendar height (e.g., 13 hours * 64px/hour = 832px) */
  position: relative;
}

.appointment {
  z-index: 20;
}

/* Custom button styles */
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
