<template>
  <aside class="w-64 bg-gray-800 text-white flex flex-col shadow-lg">
    <div class="p-4 text-2xl font-bold border-b border-gray-700 text-center">Barberia</div>
    <nav class="flex-1 p-4">
      <ul>
        <li class="mb-2">
          <router-link to="/dashboard" class="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <span class="ml-3">Dashboard</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/barbers" class="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <span class="ml-3">Barberos</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/sales" class="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <span class="ml-3">Ventas</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/services" class="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <span class="ml-3">Servicios</span>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/stations" class="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <span class="ml-3">Estaciones</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
/* Estilos para el enlace activo de RouterLink */
.router-link-active {
  background-color: #4a5568; /* Un gris más claro para el elemento activo */
  font-weight: bold;
}
</style>