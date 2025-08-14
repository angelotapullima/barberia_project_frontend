<template>
  <div class="calendar-dashboard p-4 min-h-screen">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-6">
      Calendario de Citas
    </h1>

    <!-- Calendar Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm"
    >
      <div class="flex items-center space-x-3 mb-4 sm:mb-0">
        <button class="btn-icon" @click="goToPreviousWeek">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <span class="text-xl font-semibold text-gray-800">{{
          currentWeekRange
        }}</span>
        <button class="btn-icon" @click="goToNextWeek">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button class="btn-outline ml-4" @click="goToToday">Hoy</button>
      </div>

      <div
        class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto"
      >
        <!-- Barber/Team Selector -->
        <CustomSelect
          :modelValue="selectedBarberFilter"
          @update:modelValue="selectedBarberFilter = $event"
          :options="barberSelectOptions"
          placeholder="Seleccionar Barbero"
          class="w-full sm:w-48"
        />

        <!-- Add Button -->
        <button
          class="btn-primary w-full sm:w-48"
          @click="openAddAppointmentModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Añadir Cita
        </button>
      </div>
    </div>

    <!-- Main Calendar Grid -->
    <div class="relative">
      <div
        class="calendar-main-grid grid grid-cols-[60px_repeat(7,_minmax(0,_1fr))] gap-px bg-gray-200 rounded-lg overflow-hidden shadow-lg"
      >
        <!-- Time Axis Header (empty corner) -->
        <div class="bg-white p-2 border-b border-r border-gray-200 h-[76px]"></div>

        <!-- Day Headers -->
        <div
          v-for="day in weekDays"
          :key="day.fullDate"
          class="day-header bg-white p-2 text-center font-semibold text-gray-700 border-b border-r border-gray-200 h-[76px]"
          :class="{
            'bg-blue-50 text-blue-700':
              day.fullDate === dayjs().format('YYYY-MM-DD'),
          }"
        >
          <span class="block text-xs uppercase">{{ day.name }}</span>
          <span class="block text-xl font-bold">{{
            day.date.split(' ')[0]
          }}</span>
          <span class="block text-xs text-gray-500">{{
            day.date.split(' ')[1]
          }}</span>
        </div>

        <!-- Time Axis and Day Columns -->
        <template v-for="(hour, index) in hours" :key="hour">
          <!-- Time Label -->
          <div
            class="time-label bg-white p-2 text-right text-xs text-gray-500 border-r border-gray-200 flex items-start justify-end pr-2"
            :style="{ height: '60px' }"
          >
            <span v-if="index % 2 !== 1">{{ hour.slice(0, 5) }}</span>
          </div>
          <!-- Day Cells -->
          <div
            v-for="day in weekDays"
            :key="day.fullDate + '-' + hour"
            class="day-cell relative bg-white border-b border-r border-gray-200 h-[60px] cursor-pointer hover:bg-blue-50"
            @click="
              openAddAppointmentModalWithTime(
                selectedBarberFilter === 'all' ||
                  selectedBarberFilter === 'scheduled'
                  ? null
                  : selectedBarberFilter,
                day.fullDate,
                hour,
              )
            "
          >
            <!-- Cells are now empty, serving as the background grid -->
          </div>
        </template>
      </div>

      <!-- Appointments Overlay -->
      <div
        class="appointments-overlay absolute top-[76px] left-[60px] right-0 bottom-0 grid grid-cols-7 gap-px pointer-events-none"
      >
        <div
          v-for="day in weekDays"
          :key="day.fullDate"
          class="day-column relative"
        >
          <div
            v-for="reservation in getFilteredReservationsForDay(day.fullDate)"
            :key="reservation.id"
            class="appointment absolute flex flex-col justify-between rounded-lg p-2 text-gray-800 bg-white border border-gray-200 border-l-8 shadow-lg cursor-pointer pointer-events-auto overflow-hidden"
            :style="getAppointmentStyle(reservation)"
            @click.stop="viewAppointmentDetails(reservation)"
          >
            <!-- Top part with info -->
            <div class="flex-grow">
              <div class="font-bold text-sm text-gray-900 truncate">
                {{ reservation.client_name }}
              </div>
              <div class="text-xs text-gray-600 truncate">
                {{ getBarberName(reservation.barber_id) }}
              </div>
              <div class="text-xs text-gray-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                {{ formatTime(reservation.start_time) }} - {{ formatTime(reservation.end_time) }}
              </div>
            </div>

            <!-- Bottom part with status -->
            <div
              class="status-tag text-xs font-semibold text-center py-1 px-2 rounded-md mt-2 self-start"
              :class="{
                'bg-yellow-100 text-yellow-800': reservation.status !== 'completed',
                'bg-green-100 text-green-800': reservation.status === 'completed'
              }"
            >
              {{ reservation.status === 'completed' ? 'Pagado' : 'Reservado' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Current Time Indicator -->
      <div
        v-if="showCurrentTimeIndicator"
        class="current-time-indicator absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none"
        :style="{ top: currentTimeIndicatorPosition }"
      >
        <div
          class="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"
        ></div>
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

    <SaleDetailsModal
      :show="isSaleDetailsModalOpen"
      :reservationId="selectedReservationId"
      @close="isSaleDetailsModalOpen = false"
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
import SaleDetailsModal from '../components/SaleDetailsModal.vue';
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
  barberStore.barbers.forEach((barber) => {
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
const isSaleDetailsModalOpen = ref(false);
const selectedReservationId = ref(null);

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

const currentTimeIndicatorPosition = computed(() => {
  const now = dayjs();
  const startHour = 8; // Calendar starts at 8:00 AM
  const totalMinutesFromStart = (now.hour() - startHour) * 60 + now.minute();
  const pixelsPerMinute = 60 / 30; // 60px height for 30 minutes
  const top = totalMinutesFromStart * pixelsPerMinute;
  const headerHeight = 76; // Height of the day headers

  // Only return a value if the current time is within the displayed hours
  if (now.hour() >= startHour && now.hour() <= 22) {
    return `${top + headerHeight}px`;
  }
  return '-9999px'; // Position off-screen if not in range
});

const showCurrentTimeIndicator = computed(() => {
  const now = dayjs();
  return now.isSame(currentWeekStart.value, 'week');
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
  reservations.sort((a, b) => dayjs(a.start_time).local().diff(dayjs(b.start_time).local()));

  const processedReservations = [];
  const columns = []; // Stores the end time of the last reservation in each column

  reservations.forEach((res) => {
    const start = dayjs(res.start_time).local(); // Added .local()
    const end = dayjs(res.end_time).local();     // Added .local()

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
  processedReservations.forEach((res) => {
    const overlappingGroup = processedReservations.filter((otherRes) => {
      const resStart = dayjs(res.start_time).local(); // Added .local()
      const resEnd = dayjs(res.end_time).local();     // Added .local()
      const otherResStart = dayjs(otherRes.start_time).local(); // Added .local()
      const otherResEnd = dayjs(otherRes.end_time).local();     // Added .local()

      // Check for overlap
      return resStart.isBefore(otherResEnd) && otherResStart.isBefore(resEnd);
    });

    const maxColumnsInGroup =
      Math.max(...overlappingGroup.map((o) => o.column)) + 1;
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
    (res) => dayjs(res.start_time).local().format('YYYY-MM-DD') === date,
  );

  if (
    selectedBarberFilter.value !== 'all' &&
    selectedBarberFilter.value !== 'scheduled'
  ) {
    reservationsForDay = reservationsForDay.filter(
      (res) => res.barber_id === selectedBarberFilter.value,
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

  const pixelsPerHalfHour = 60; // Adjusted to match h-[60px] in template
  const topOffsetMinutes = (startHour - 8) * 60 + startMinute;
  const top = (topOffsetMinutes / 30) * pixelsPerHalfHour;

  const durationMinutes = end.diff(start, 'minute');
  let height = (durationMinutes / 30) * pixelsPerHalfHour;

  // Ensure a minimum height for the appointment card to prevent overflow
  if (height < 90) {
    height = 90;
  }

  const barberColor = barberColors.value[reservation.barber_id] || {
    bgColor: '#4299e1', // Default color
  };

  return {
    top: `${top}px`,
    height: `${height}px`,
    left: reservation.calculatedLeft,
    width: reservation.calculatedWidth,
    borderLeftColor: barberColor.bgColor,
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
  if (reservation.status === 'completed') {
    selectedReservationId.value = reservation.id;
    isSaleDetailsModalOpen.value = true;
  } else {
    reservationToSell.value = reservation;
    isSaleRegistrationModalOpen.value = true;
  }
};

const fetchReservationsForCurrentWeek = async () => {
  const startDate = currentWeekStart.value.startOf('day').toISOString();
  const endDate = currentWeekStart.value
    .endOf('week')
    .endOf('day')
    .toISOString();
  await reservationStore.fetchReservationsByDateRange(startDate, endDate);
};

watch(currentWeekStart, fetchReservationsForCurrentWeek);
watch(selectedBarberFilter, fetchReservationsForCurrentWeek); // Watch barber filter to refetch

onMounted(async () => {
  await barberStore.getAllBarbers();
  assignBarberColors(); // Call after barbers are fetched
  await serviceStore.fetchServices();
  await stationStore.fetchStations();
  await productStore.fetchProducts();
  await fetchReservationsForCurrentWeek();
});
</script>

<style scoped>
/* Custom button styles */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50;
}

.btn-icon {
  @apply p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50;
}

.appointment {
  z-index: 20;
  /* color: white; - Removed, now applied directly in template */
  /* border: 1px solid; - Removed, now border-l-4 in template */
  border-radius: 0.5rem; /* Tailwind's rounded-lg */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); - Removed, now shadow-md in template */
  padding: 0.25rem 0.5rem; /* Tailwind's p-1 px-2 */
  line-height: 1.2;
}

.current-time-indicator {
  width: calc(100% - 60px); /* Adjust for the time axis column width */
  left: 60px; /* Align with the start of the day columns */
}
</style>
