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
        <CustomSelect
          :modelValue="selectedBarberFilter"
          @update:modelValue="selectedBarberFilter = $event"
          :options="barberSelectOptions"
          placeholder="Seleccionar Barbero"
        />

        <!-- Add Button -->
        <button class="btn-primary" @click="openAddAppointmentModal">Añadir</button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid border border-gray-300 rounded-lg overflow-hidden">
      <!-- Days Header -->
      <div
        class="calendar-days-header bg-gray-100 border-b border-gray-300"
        :style="{ gridTemplateColumns: '1fr ' + 'repeat(' + weekDays.length + ', 1fr)' }"
      >
        <div class="p-2 font-semibold text-sm text-gray-600"></div>
        <!-- Empty corner for time -->
        <div
          v-for="day in weekDays"
          :key="day.fullDate"
          class="p-2 text-center font-semibold text-sm text-gray-600 border-l border-gray-300"
        >
          {{ day.name }} <br />
          {{ day.date }}
        </div>
      </div>

      <div
        class="calendar-body"
        :style="{ gridTemplateColumns: '1fr ' + 'repeat(' + weekDays.length + ', 1fr)' }"
      >
        <!-- Time Slots Column -->
        <div class="time-slots-column border-r border-gray-300">
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-16 flex items-center justify-center text-xs text-gray-500 border-b border-gray-200 last:border-b-0"
          >
            {{ hour }}
          </div>
        </div>

        <!-- Schedule Grid for each day -->
        <div
          v-for="day in weekDays"
          :key="day.fullDate"
          class="schedule-day relative border-l border-gray-200 h-full"
        >
          <!-- Time slots for each day -->
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-16 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50"
            @click="
              openAddAppointmentModalWithTime(
                selectedBarberFilter === 'all' || selectedBarberFilter === 'scheduled'
                  ? null
                  : selectedBarberFilter,
                day.fullDate,
                hour
              )
            "
          ></div>
          <!-- Appointments for this day -->
          <div
            v-for="reservation in getFilteredReservationsForDay(day.fullDate)"
            :key="reservation.id"
            class="appointment absolute rounded-md p-1 text-xs overflow-hidden cursor-pointer"
            :style="getAppointmentStyle(reservation)"
            @click="viewAppointmentDetails(reservation)"
          >
            <div class="font-semibold">
              {{ formatTime(reservation.start_time) }} -
              {{ formatTime(reservation.end_time) }}
            </div>
            <div>{{ reservation.client_name }}</div>
            <div class="text-gray-200">{{ getBarberName(reservation.barber_id) }}</div>
            <div class="absolute bottom-1 right-1 text-blue-600">▶</div>
          </div>
        </div>
      </div>
    </div>

    <ReservationFormModal
      :show="isAddAppointmentModalOpen"
      :initialBarberId="selectedBarberId"
      :initialDate="selectedDate"
      :initialHour="selectedHour"
      @close="isAddAppointmentModalOpen = false"
      @reservationCreated="fetchReservationsForCurrentWeek"
    />

    <SaleRegistrationModal
      :show="isSaleRegistrationModalOpen"
      :reservation="reservationToSell"
      @close="isSaleRegistrationModalOpen = false"
      @saleProcessed="fetchReservationsForCurrentWeek"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBarberStore } from '../stores/barberStore';
import { useReservationStore } from '../stores/reservationStore';
import { useServiceStore } from '../stores/serviceStore';
import { useStationStore } from '../stores/stationStore';
import { useProductStore } from '../stores/productStore';
import SaleRegistrationModal from '../components/SaleRegistrationModal.vue';
import ReservationFormModal from '../components/ReservationFormModal.vue';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es'); // Set locale globally
import utc from 'dayjs/plugin/utc'; // Import UTC plugin
import localizedFormat from 'dayjs/plugin/localizedFormat'; // Import localizedFormat plugin
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // Import isSameOrAfter plugin

dayjs.extend(utc); // Extend dayjs with UTC plugin
dayjs.extend(localizedFormat); // Extend dayjs with localizedFormat plugin
dayjs.extend(isSameOrAfter); // Extend dayjs with isSameOrAfter plugin

const barberStore = useBarberStore();
const reservationStore = useReservationStore();
const serviceStore = useServiceStore();
const stationStore = useStationStore();
const productStore = useProductStore();

import CustomSelect from '../components/CustomSelect.vue'; // Import CustomSelect component

// Define a set of colors for barbers
const colors = [
  '#EF4444', // Red-500
  '#3B82F6', // Blue-500
  '#10B981', // Green-500
  '#F59E0B', // Amber-500
  '#6366F1', // Indigo-500
  '#EC4899', // Pink-500
  '#8B5CF6', // Purple-500
];

// Reactive map to store barber colors
const barberColors = ref({});

// Function to assign colors to barbers
const assignBarberColors = () => {
  barberStore.barbers.forEach((barber, index) => {
    barberColors.value[barber.id] = {
      bgColor: colors[index % colors.length],
      borderColor: colors[index % colors.length].replace('500', '700'), // Darker shade for border
    };
  });
};

const barberSelectOptions = computed(() => {
  const options = [
    { label: 'Todo el equipo', value: 'all' },
    { label: 'Equipo programado', value: 'scheduled' },
  ];
  barberStore.barbers.forEach(barber => {
    options.push({
      label: barber.name,
      value: barber.id,
      style: {
        backgroundColor: barberColors.value[barber.id]?.bgColor,
        color: 'white',
      },
    });
  });
  return options;
});

const currentWeekStart = ref(dayjs().startOf('week'));
const selectedBarberFilter = ref('all'); // Keep this
const isAddAppointmentModalOpen = ref(false);
const isSaleRegistrationModalOpen = ref(false);
const reservationToSell = ref(null);

const selectedBarberId = ref(null);
const selectedDate = ref(null);
const selectedHour = ref(null);

const weekDays = computed(() => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = currentWeekStart.value.add(i, 'day');
    days.push({
      name: date.format('ddd'),
      date: date.format('DD MMM'),
      fullDate: date.format('YYYY-MM-DD'),
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
  for (let i = 8; i <= 22; i++) {
    h.push(`${i.toString().padStart(2, '0')}:00`);
    if (i < 22) {
      h.push(`${i.toString().padStart(2, '0')}:30`);
    }
  }
  return h;
});

// No longer needed as filteredBarbers is used only for the dropdown
// const filteredBarbers = computed(() => {
//   if (selectedBarberFilter.value === 'all') {
//     return barberStore.barbers;
//   } else if (selectedBarberFilter.value === 'scheduled') {
//     return barberStore.barbers;
//   } else {
//     return barberStore.barbers.filter((b) => b.id === selectedBarberFilter.value);
//   }
// });

const goToToday = () => {
  currentWeekStart.value = dayjs().startOf('week');
};

const goToPreviousWeek = () => {
  currentWeekStart.value = currentWeekStart.value.subtract(1, 'week');
};

const goToNextWeek = () => {
  currentWeekStart.value = currentWeekStart.value.add(1, 'week');
};

const calculateOverlappingAppointmentsLayout = (reservations) => {
  if (!reservations || reservations.length === 0) {
    return [];
  }

  // Sort reservations by start time
  reservations.sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)));

  const processedReservations = [];
  const columns = []; // Stores the end time of the last reservation in each column

  reservations.forEach(res => {
    const start = dayjs(res.start_time);
    const end = dayjs(res.end_time);

    let assignedColumn = -1;

    // Try to fit the reservation into an existing column
    for (let i = 0; i < columns.length; i++) {
      if (start.isSameOrAfter(columns[i])) {
        assignedColumn = i;
        break;
      }
    }

    // If no column found, create a new one
    if (assignedColumn === -1) {
      assignedColumn = columns.length;
      columns.push(null); // Placeholder for new column
    }

    // Update the end time for the assigned column
    columns[assignedColumn] = end;

    // Store the column index with the reservation
    processedReservations.push({ ...res, column: assignedColumn });
  });

  // Now calculate max columns needed for each overlap group and assign final left/width
  processedReservations.forEach(res => {
    const overlappingGroup = processedReservations.filter(otherRes => {
      const resStart = dayjs(res.start_time);
      const resEnd = dayjs(res.end_time);
      const otherResStart = dayjs(otherRes.start_time);
      const otherResEnd = dayjs(otherRes.end_time);

      // Check for overlap
      return (resStart.isBefore(otherResEnd) && otherResStart.isBefore(resEnd));
    });

    const maxColumnsInGroup = Math.max(...overlappingGroup.map(o => o.column)) + 1;
    const baseColumnWidth = 100 / maxColumnsInGroup;
    const effectiveWidth = baseColumnWidth * 0.98; // Each event takes 98% of its allocated column space
    const margin = baseColumnWidth * 0.01; // 1% margin on each side within its column
    const leftOffset = res.column * baseColumnWidth + margin;

    res.calculatedLeft = `${leftOffset}%`;
    res.calculatedWidth = `${effectiveWidth}%`;
  });

  return processedReservations;
};

const getFilteredReservationsForDay = (date) => {
  let reservationsForDay = reservationStore.reservations.filter(
    (res) => dayjs(res.start_time).local().format('YYYY-MM-DD') === date
  );

  if (selectedBarberFilter.value !== 'all' && selectedBarberFilter.value !== 'scheduled') {
    reservationsForDay = reservationsForDay.filter(
      (res) => res.barber_id === selectedBarberFilter.value
    );
  } else if (selectedBarberFilter.value === 'scheduled') {
    // This logic needs to be implemented if 'scheduled' means something specific
    // For now, it will behave like 'all' if no specific logic is provided.
    // You might want to filter for barbers who have *any* reservation in the current week.
  }

  // Calculate layout for overlapping appointments
  return calculateOverlappingAppointmentsLayout(reservationsForDay);
};

const getAppointmentStyle = (reservation) => {
  const start = dayjs(reservation.start_time).local();
  const end = dayjs(reservation.end_time).local();
  const startHour = start.hour();
  const startMinute = start.minute();

  const pixelsPerHalfHour = 64; // h-16 in Tailwind is 64px
  const topOffsetMinutes = (startHour - 8) * 60 + startMinute;
  const top = (topOffsetMinutes / 30) * pixelsPerHalfHour;

  const durationMinutes = end.diff(start, 'minute');
  const height = (durationMinutes / 30) * pixelsPerHalfHour;

  const barberColor = barberColors.value[reservation.barber_id] || { bgColor: '#4299e1', borderColor: '#2b6cb0' }; // Default if color not found

  return {
    top: `${top}px`,
    height: `${height}px`,
    left: reservation.calculatedLeft, // Use calculated left
    width: reservation.calculatedWidth, // Use calculated width
    backgroundColor: barberColor.bgColor,
    borderColor: barberColor.borderColor,
  };
};

const formatTime = (dateTimeString) => {
  return dayjs(dateTimeString).format('HH:mm');
};

const getBarberName = (barberId) => {
  const barber = barberStore.barbers.find((b) => b.id === barberId);
  return barber ? barber.name : 'Desconocido';
};

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
  reservationToSell.value = reservation;
  isSaleRegistrationModalOpen.value = true;
};

const fetchReservationsForCurrentWeek = async () => {
  const startDate = currentWeekStart.value.startOf('day').toISOString();
  const endDate = currentWeekStart.value.endOf('week').endOf('day').toISOString();
  await reservationStore.fetchReservationsByDateRange(startDate, endDate);
};

watch(currentWeekStart, fetchReservationsForCurrentWeek);
watch(selectedBarberFilter, fetchReservationsForCurrentWeek); // Watch barber filter to refetch

onMounted(async () => {
  await barberStore.fetchBarbers();
  assignBarberColors(); // Call after barbers are fetched
  await serviceStore.fetchServices();
  await stationStore.fetchStations();
  await productStore.fetchProducts();
  await fetchReservationsForCurrentWeek();
});
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-rows: auto 1fr;
}

.calendar-days-header {
  display: grid;
}

.calendar-body {
  display: grid;
}

.schedule-day {
  min-height: 1856px; /* Adjusted for 8 AM to 10 PM (14.5 hours * 64px/half-hour = 1856px) */
  position: relative;
}

.appointment {
  z-index: 20;
  color: white;
  border: 1px solid; /* Border color will be dynamic */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Custom button styles */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50;
}


</style>
