<template>
  <div class="app-container">
    <!-- Sidebar -->
    <Sidebar :isCollapsed="isSidebarCollapsed" @toggle="isSidebarCollapsed = !isSidebarCollapsed" />

    <!-- Main Content Area -->
    <div
      :class="{ 'sidebar-collapsed': isSidebarCollapsed, 'sidebar-expanded': !isSidebarCollapsed }"
      class="main-content-area"
    >
      <!-- Header/Navbar -->
      <header class="app-header">
        <button @click="toggleSidebar" class="sidebar-toggle-button">
          <svg
            class="icon-6x6"
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
        <h1 class="app-title">Barberia App</h1>
        <div></div>
        <!-- Placeholder for right side if needed -->
      </header>

      <!-- Contenido de la página -->
      <main class="app-main-content">
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
.app-container {
  display: flex;
  height: 100vh;
  background-color: #1A1A1A; /* barber-black */
}

.main-content-area {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition-property: all;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapsed {
  /* margin-left: 5rem; */
}

.sidebar-expanded {
  /* margin-left: 16rem; */
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #A30000; /* barber-red */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.sidebar-toggle-button {
  color: #F5F5F5; /* barber-white */
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.icon-6x6 {
  width: 1.5rem;
  height: 1.5rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #F5F5F5; /* barber-white */
}

.app-main-content {
  flex: 1 1 0%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #F5F5F5; /* barber-white */
  padding: 1rem;
}
</style>
