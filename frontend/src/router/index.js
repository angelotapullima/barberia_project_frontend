import { createRouter, createWebHistory } from 'vue-router';
import BarbersView from '@/views/BarbersView.vue';

import StationsView from '@/views/StationsView.vue';

import ServicesView from '@/views/ServicesView.vue';

import SalesView from '@/views/SalesView.vue'; // This is now SalesRegistrationView
import SalesListView from '@/views/SalesListView.vue'; // New component for sales list
import ReservationsView from '@/views/ReservationsView.vue'; // New component for reservations
import ScheduleView from '@/views/ScheduleView.vue'; // Vista para el calendario de distribución

import DashboardView from '@/views/DashboardView.vue';

const routes = [
  { path: '/', component: DashboardView, name: 'Dashboard' },
  { path: '/sales/register', component: SalesView, name: 'SalesRegistration' }, // Renamed route
  { path: '/sales', component: SalesListView, name: 'SalesList' }, // New route for sales list
  { path: '/barbers', component: BarbersView, name: 'Barbers' },
  { path: '/stations', component: StationsView, name: 'Stations' },
  { path: '/services', component: ServicesView, name: 'Services' },
  { path: '/reservations', component: ReservationsView, name: 'Reservations' }, // New route for reservations
  { path: '/reports', component: () => import('@/views/ReportsView.vue'), name: 'Reports' },
  { path: '/schedule', component: ScheduleView, name: 'Schedule' }, // Nueva ruta para la agenda
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
