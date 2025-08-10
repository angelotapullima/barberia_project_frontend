<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">Dashboard y Reportes</h1>

    <!-- Filters -->
    <div class="dashboard-filters">
      <div class="form-group">
        <label for="month" class="form-label">Mes</label>
        <select
          v-model="selectedMonth"
          id="month"
          class="form-select"
        >
          <option v-for="(name, index) in months" :key="index" :value="index + 1">
            {{ name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="year" class="form-label">Año</label>
        <select
          v-model="selectedYear"
          id="year"
          class="form-select"
        >
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div v-if="store.isLoading" class="loading-message">Generando reporte...</div>
    <div v-if="store.error" class="error-message">
      {{ store.error }}
    </div>

    <!-- Main Content -->
    <div v-if="!store.isLoading" class="dashboard-content-grid">
      <!-- Calendar -->
      <div class="dashboard-calendar-card">
        <FullCalendar :options="calendarOptions" />
      </div>

      <!-- Stats Table -->
      <div class="dashboard-stats-card">
        <h2 class="dashboard-stats-title">Reporte de Pagos</h2>
        <table class="dashboard-stats-table">
          <thead class="dashboard-stats-table-head">
            <tr>
              <th class="dashboard-stats-table-th">
                Barbero
              </th>
              <th class="dashboard-stats-table-th-right">
                Generado
              </th>
              <th class="dashboard-stats-table-th-right">Pago</th>
            </tr>
          </thead>
          <tbody class="dashboard-stats-table-body">
            <tr v-for="stat in store.stats" :key="stat.barber_id">
              <td class="dashboard-stats-table-td">{{ stat.barber_name }}</td>
              <td class="dashboard-stats-table-td-right">S/ {{ stat.total_generated.toFixed(2) }}</td>
              <td class="dashboard-stats-table-td-right-bold">S/ {{ stat.payment.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useReportStore } from '@/stores/reportStore';

const store = useReportStore();

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth',
  },
  events: [], // This will be populated from the store
  locale: 'es',
  buttonText: {
    today: 'Hoy',
  },
});

function generateReport() {
  store.fetchReport(selectedYear.value, selectedMonth.value).then(() => {
    calendarOptions.events = store.events;
  });
}

watch([selectedMonth, selectedYear], generateReport);

onMounted(generateReport);
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;
}

.dashboard-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.dashboard-filters {
  display: flex;
  align-items: center;
  gap: 1rem; /* space-x-4 */
  margin-bottom: 1.5rem;
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.form-group {
  /* Already defined in other views, but keeping here for self-containment */
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-select {
  margin-top: 0.25rem;
  display: block;
  width: 100%;
  padding-left: 0.75rem;
  padding-right: 2.5rem; /* pr-10 */
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  outline: none;
  border-radius: 0.375rem;
  /* focus:ring-indigo-500 focus:border-indigo-500 */
  /* This requires more complex CSS for focus states, will omit for now or add later if needed */
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

.dashboard-content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem; /* gap-8 */
}

@media (min-width: 1024px) { /* lg breakpoint */
  .dashboard-content-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.dashboard-calendar-card {
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

@media (min-width: 1024px) { /* lg breakpoint */
  .dashboard-calendar-card {
    grid-column: span 2 / span 2; /* lg:col-span-2 */
  }
}

.dashboard-stats-card {
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

@media (min-width: 1024px) { /* lg breakpoint */
  .dashboard-stats-card {
    grid-column: span 1 / span 1; /* lg:col-span-1 */
  }
}

.dashboard-stats-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.dashboard-stats-table {
  min-width: 100%;
  border-collapse: collapse;
}

.dashboard-stats-table-head {
  background-color: #f9fafb;
}

.dashboard-stats-table-th {
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-stats-table-th-right {
  padding: 0.5rem 1rem;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-stats-table-body {
  background-color: #fff;
}

.dashboard-stats-table-body tr {
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-stats-table-body tr:last-child {
  border-bottom: none;
}

.dashboard-stats-table-td {
  padding: 0.5rem 1rem;
}

.dashboard-stats-table-td-right {
  padding: 0.5rem 1rem;
  text-align: right;
}

.dashboard-stats-table-td-right-bold {
  padding: 0.5rem 1rem;
  text-align: right;
  font-weight: 700;
}
</style>