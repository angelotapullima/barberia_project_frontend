<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

    <div
      :class="{ 'ml-0': isSidebarCollapsed, 'ml-0': !isSidebarCollapsed }"
      class="flex-1 flex flex-col bg-barber-white transition-all duration-300 ease-in-out"
    >
      <header class="flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-200">
        <button @click="toggleSidebar" class="text-gray-600 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Barberia App</h1>
        <div></div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import Sidebar from './components/Sidebar.vue';

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<style scoped>
/* Puedes añadir estilos específicos de App.vue aquí si es necesario */
</style>
