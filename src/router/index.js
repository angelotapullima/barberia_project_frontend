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
import PaymentConfirmationView from '@/views/PaymentConfirmationView.vue';

const routes = [
  {
    path: '/',
    component: DashboardView,
    name: 'Dashboard',
    meta: { title: 'Dashboard' },
  },
  {
    path: '/sales',
    component: SalesView,
    name: 'SalesRegistration',
    meta: { title: 'Registro de Ventas' },
  }, // Changed component to SalesView
  {
    path: '/barbers',
    component: BarbersView,
    name: 'Barbers',
    meta: { title: 'Gestión de Barberos' },
  },

  {
    path: '/payments',
    component: BarberPaymentsReportView,
    name: 'Payments',
    meta: { title: 'Pagos a Barberos' },
  }, // Changed to BarberPaymentsReportView
  {
    path: '/stations',
    component: StationsView,
    name: 'Stations',
    meta: { title: 'Estaciones' },
  },
  {
    path: '/services',
    component: ServicesView,
    name: 'Services',
    meta: { title: 'Servicios' },
  },
  {
    path: '/products',
    component: ProductsView,
    name: 'Products',
    meta: { title: 'Productos' },
  },
  {
    path: '/reservations',
    component: ReservationsView,
    name: 'Reservations',
    meta: { title: 'Reservas' },
  },
  {
    path: '/schedule',
    component: CalendarView,
    name: 'Schedule',
    meta: { title: 'Calendario de Citas' },
  },
  {
    path: '/login',
    component: LoginView,
    name: 'Login',
    meta: { title: 'Iniciar Sesión' },
  },
  {
    path: '/profile',
    component: ProfileView,
    name: 'Profile',
    meta: { title: 'Mi Perfil' },
  }, // Import LoginView
  {
    path: '/settings',
    component: SettingsView,
    name: 'Settings',
    meta: { title: 'Configuración' },
  }, // Import LoginView,

  // Rutas de reportes
  {
    path: '/reports',
    component: ReportsView,
    name: 'Reports',
    meta: { title: 'Reportes' },
  },
  {
    path: '/reports/inventory',
    component: InventoryReportView,
    name: 'InventoryReport',
    meta: { title: 'Reporte de Inventario' },
  },
  {
    path: '/reports/station-usage',
    component: StationUsageReportView,
    name: 'StationUsageReport',
    meta: { title: 'Reporte de Uso de Estaciones' },
  },
  {
    path: '/reports/customer-frequency',
    component: CustomerFrequencyReportView,
    name: 'CustomerFrequencyReport',
    meta: { title: 'Reporte de Frecuencia de Clientes' },
  },
  {
    path: '/reports/peak-hours',
    component: PeakHoursReportView,
    name: 'PeakHoursReport',
    meta: { title: 'Reporte de Horas Pico' },
  },
  {
    path: '/reports/sales/comprehensive',
    component: ComprehensiveSalesReportView,
    name: 'ComprehensiveSalesReport',
    meta: { title: 'Reporte Detallado de Ventas' },
  },
  {
    path: '/reports/sales/by-type',
    component: ServicesProductsSalesReportView,
    name: 'ServicesProductsSalesReport',
    meta: { title: 'Reporte de Ventas por Tipo' },
  },
  {
    path: '/reports/barber-payments-detailed', // New route
    component: BarberPaymentsReportView,
    name: 'BarberPaymentsReport',
    meta: { title: 'Reporte de Pagos a Barberos' },
  },
  {
    path: '/payment/confirm',
    name: 'PaymentConfirm',
    component: PaymentConfirmationView,
    meta: { title: 'Confirmación de Pago' },
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
