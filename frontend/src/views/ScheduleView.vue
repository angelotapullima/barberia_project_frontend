<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Distribución y Agenda</h1>
    <p class="mb-6 text-gray-600">
      Haz clic en una fecha y hora en el calendario para registrar una nueva venta directamente.
    </p>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Importante para el dateClick
import { useReportStore } from '@/stores/reportStore';

const store = useReportStore();
const router = useRouter();

const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  events: [],
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    week: 'Semana',
    day: 'Día',
  },
  dateClick: (info) => {
    // Función para que la cajera agregue una venta al hacer clic
    const selectedDate = info.dateStr.split('T')[0];
    const selectedTime = info.dateStr.split('T')[1] ? info.dateStr.split('T')[1].substring(0, 5) : '00:00';
    
    // Redirigir a la vista de registro de ventas con la fecha y hora seleccionadas
    router.push({
      path: '/sales',
      query: { date: selectedDate, time: selectedTime },
    });
  },
  editable: true,
  selectable: true,
});

// Obtener los eventos del calendario (ventas por día)
function getCalendarEvents() {
  // Usamos el mes y año actual por defecto
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  store.fetchReport(currentYear, currentMonth).then(() => {
    calendarOptions.events = store.events;
  });
}

onMounted(() => {
  getCalendarEvents();
});
</script>
