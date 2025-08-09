import { createRouter, createWebHistory } from 'vue-router';
import BarbersView from '@/views/BarbersView.vue';

import StationsView from '@/views/StationsView.vue';

import ServicesView from '@/views/ServicesView.vue';

import SalesView from '@/views/SalesView.vue';

import DashboardView from '@/views/DashboardView.vue';

const routes = [
  { path: '/', component: DashboardView, name: 'Dashboard' },
  { path: '/sales', component: SalesView, name: 'Sales' },
  { path: '/barbers', component: BarbersView, name: 'Barbers' },
  { path: '/stations', component: StationsView, name: 'Stations' },
  { path: '/services', component: ServicesView, name: 'Services' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
