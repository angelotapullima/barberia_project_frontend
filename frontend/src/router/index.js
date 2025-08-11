import { createRouter, createWebHistory } from 'vue-router';
import BarbersView from '@/views/BarbersView.vue';
import ProductsView from '@/views/ProductsView.vue';
import InventoryReportView from '@/views/InventoryReportView.vue';

import StationsView from '@/views/StationsView.vue';

import ServicesView from '@/views/ServicesView.vue';

import SalesView from '@/views/SalesView.vue'; // This is now SalesRegistrationView
import SalesListView from '@/views/SalesListView.vue'; // New component for sales list
import ReservationsView from '@/views/ReservationsView.vue'; // New component for reservations
import ScheduleView from '@/views/ScheduleView.vue'; // Vista para el calendario de distribución

import DashboardView from '@/views/DashboardView.vue';

// Importar las nuevas vistas de reportes
import ReportsView from '@/views/ReportsView.vue'; // La vista placeholder
import StationUsageReportView from '@/views/StationUsageReportView.vue';
import CustomerFrequencyReportView from '@/views/CustomerFrequencyReportView.vue';
import PeakHoursReportView from '@/views/PeakHoursReportView.vue';
import ComprehensiveSalesReportView from '@/views/ComprehensiveSalesReportView.vue';
import ServicesProductsSalesReportView from '@/views/ServicesProductsSalesReportView.vue';

const routes = [
  { path: '/', component: DashboardView, name: 'Dashboard' },
  { path: '/sales/register', component: SalesView, name: 'SalesRegistration' }, // Renamed route
  { path: '/sales', component: SalesListView, name: 'SalesList' }, // New route for sales list
  { path: '/barbers', component: BarbersView, name: 'Barbers' },
  { path: '/stations', component: StationsView, name: 'Stations' },
  { path: '/services', component: ServicesView, name: 'Services' },
  { path: '/products', component: ProductsView, name: 'Products' },
  { path: '/reservations', component: ReservationsView, name: 'Reservations' }, // New route for reservations
  { path: '/schedule', component: ScheduleView, name: 'Schedule' }, // Nueva ruta para la agenda

  // Rutas de reportes
  { path: '/reports', component: ReportsView, name: 'Reports' }, // La vista principal de reportes (placeholder)
  { path: '/reports/inventory', component: InventoryReportView, name: 'InventoryReport' },
  { path: '/reports/station-usage', component: StationUsageReportView, name: 'StationUsageReport' },
  { path: '/reports/customer-frequency', component: CustomerFrequencyReportView, name: 'CustomerFrequencyReport' },
  { path: '/reports/peak-hours', component: PeakHoursReportView, name: 'PeakHoursReport' },
  { path: '/reports/sales/comprehensive', component: ComprehensiveSalesReportView, name: 'ComprehensiveSalesReport' },
  { path: '/reports/sales/by-type', component: ServicesProductsSalesReportView, name: 'ServicesProductsSalesReport' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;