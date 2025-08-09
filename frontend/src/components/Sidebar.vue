<template>
  <aside :class="{'w-16': isCollapsed, 'w-64': !isCollapsed}" class="bg-barber-black text-barber-white flex flex-col shadow-lg transition-all duration-300 ease-in-out">
    <div v-if="!isCollapsed" class="p-4 text-2xl font-bold border-b border-barber-gray text-center">Barberia</div>
    <div v-else class="p-4 text-2xl font-bold border-b border-barber-gray text-center">B</div>
    <nav class="flex-1 p-4">
      <ul>
        <li class="mb-2">
          <router-link to="/dashboard" class="flex items-center p-2 rounded-lg hover:bg-barber-gray transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span v-if="!isCollapsed" class="ml-3">Dashboard</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/barbers" class="flex items-center p-2 rounded-lg hover:bg-barber-gray transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span v-if="!isCollapsed" class="ml-3">Barberos</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/sales" class="flex items-center p-2 rounded-lg hover:bg-barber-gray transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span v-if="!isCollapsed" class="ml-3">Ventas</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/services" class="flex items-center p-2 rounded-lg hover:bg-barber-gray transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4.227 4.227l-.707.707M3 12H2m10 18v-1m-6.364-1.636l.707-.707M21 12h-1M4.227 4.227l-.707.707M3 12H2m10 18v-1m-6.364-1.636l.707-.707M12 22V10"></path></svg>
            <span v-if="!isCollapsed" class="ml-3">Servicios</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/stations" class="flex items-center p-2 rounded-lg hover:bg-barber-gray transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span v-if="!isCollapsed" class="ml-3">Estaciones</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  isCollapsed: Boolean
});
</script>

<style scoped>
/* Estilos para el enlace activo de RouterLink */
.router-link-active {
  background-color: #A30000; /* barber-red */
  font-weight: bold;
}
</style>