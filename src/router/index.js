import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

import BarbersView from '@/views/BarbersView.vue';
import ProductsView from '@/views/ProductsView.vue';
import InventoryReportView from '@/views/InventoryReportView.vue';
import StationsView from '@/views/StationsView.vue';
import ServicesView from '@/views/ServicesView.vue';
import SalesView from '@/views/SalesView.vue';
import ReservationsView from '@/views/ReservationsView.vue';
import CalendarView from '@/views/CalendarView.vue';
import DashboardView from '@/views/DashboardView.vue';
import LoginView from '@/views/LoginView.vue'; // Import LoginView
import ProfileView from '@/views/ProfileView.vue'; // Import LoginView
import SettingsView from '@/views/SettingsView.vue'; // Import LoginView

import ReportsView from '@/views/ReportsView.vue';
import StationUsageReportView from '@/views/StationUsageReportView.vue';
import CustomerFrequencyReportView from '@/views/CustomerFrequencyReportView.vue';
import PeakHoursReportView from '@/views/PeakHoursReportView.vue';
import ComprehensiveSalesReportView from '@/views/ComprehensiveSalesReportView.vue';
import ServicesProductsSalesReportView from '@/views/ServicesProductsSalesReportView.vue';
import BarberPaymentsReportView from '@/views/BarberPaymentsReportView.vue'; // New import

const routes = [
  { path: '/', component: DashboardView, name: 'Dashboard' },
  { path: '/sales', component: SalesView, name: 'SalesRegistration' }, // Changed component to SalesView
  { path: '/barbers', component: BarbersView, name: 'Barbers' },
  { path: '/stations', component: StationsView, name: 'Stations' },
  { path: '/services', component: ServicesView, name: 'Services' },
  { path: '/products', component: ProductsView, name: 'Products' },
  { path: '/reservations', component: ReservationsView, name: 'Reservations' },
  { path: '/schedule', component: CalendarView, name: 'Schedule' },
  { path: '/login', component: LoginView, name: 'Login' },
  { path: '/profile', component: ProfileView, name: 'Profile' },
  { path: '/settings', component: SettingsView, name: 'Settings' },

  // Rutas de reportes
  { path: '/reports', component: ReportsView, name: 'Reports' },
  {
    path: '/reports/inventory',
    component: InventoryReportView,
    name: 'InventoryReport',
  },
  {
    path: '/reports/station-usage',
    component: StationUsageReportView,
    name: 'StationUsageReport',
  },
  {
    path: '/reports/customer-frequency',
    component: CustomerFrequencyReportView,
    name: 'CustomerFrequencyReport',
  },
  {
    path: '/reports/peak-hours',
    component: PeakHoursReportView,
    name: 'PeakHoursReport',
  },
  {
    path: '/reports/sales/comprehensive',
    component: ComprehensiveSalesReportView,
    name: 'ComprehensiveSalesReport',
  },
  {
    path: '/reports/sales/by-type',
    component: ServicesProductsSalesReportView,
    name: 'ServicesProductsSalesReport',
  },
  {
    path: '/reports/barber-payments-detailed', // New route
    component: BarberPaymentsReportView,
    name: 'BarberPaymentsReport',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  // Si el store no ha sido inicializado, lo hacemos
  if (!authStore.user && !authStore.token) {
    authStore.initializeStore();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.name !== 'Login'; // Todas las rutas requieren autenticación excepto /login

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login' }); // Redirigir al login si no está autenticado y la ruta lo requiere
  } else if (isAuthenticated && to.name === 'Login') {
    next({ name: 'Dashboard' }); // Redirigir al dashboard si ya está autenticado e intenta ir al login
  } else {
    next(); // Continuar con la navegación
  }
});

export default router;
