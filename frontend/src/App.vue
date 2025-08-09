<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header/Navbar (opcional, pero común en diseños modernos) -->
      <header class="flex items-center justify-between p-4 bg-white shadow-md">
        <h1 class="text-xl font-semibold text-gray-800">Barberia App</h1>
        <!-- Aquí se podría añadir un menú de usuario o notificaciones -->
      </header>

      <!-- Contenido de la página -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import Sidebar from './components/Sidebar.vue'; // Importar el nuevo componente Sidebar
</script>

<style scoped>
/* Puedes añadir estilos específicos de App.vue aquí si es necesario */
</style>