<template>
  <aside
    :class="[isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded', 'sidebar-main']"
    aria-label="Sidebar"
  >
    <!-- Header -->
    <div class="sidebar-header">
      <div class="sidebar-logo-container">
        <h1 v-if="!isCollapsed" class="sidebar-title">BARBERSHOP</h1>
      </div>

      <!-- Botón colapsar -->
      <button
        @click="emitToggle"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        class="sidebar-toggle-button"
      >
        <svg
          :class="['sidebar-toggle-icon', isCollapsed ? 'rotate-180' : 'rotate-0']"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Menú label -->
    <div v-if="!isCollapsed" class="sidebar-menu-label">Menú</div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="sidebar-nav-list">
        <li v-for="item in items" :key="item.to">
          <router-link :to="item.to" v-slot="{ isActive }">
            <div
              :class="[
                'sidebar-nav-item',
                isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive',
                isCollapsed ? 'sidebar-nav-item-collapsed' : '',
              ]"
              :title="isCollapsed ? item.label : null"
            >
              <span class="sidebar-nav-icon-wrapper">
                <svg
                  v-if="item.icon === 'home'"
                  class="sidebar-nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 12l9-9 9 9M4.5 10.5v9a1.5 1.5 0 001.5 1.5h3m9-11v9a1.5 1.5 0 001.5 1.5h3"
                  />
                </svg>

                <svg
                  v-else-if="item.icon === 'users'"
                  class="sidebar-nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17 20h5v-1a6 6 0 00-5-5.91M8 20h4M8 16a4 4 0 10-4-4 4 4 0 004 4z"
                  />
                </svg>

                <svg
                  v-else-if="item.icon === 'credit-card'"
                  class="sidebar-nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>

                <svg
                  v-else-if="item.icon === 'scissors'"
                  class="sidebar-nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="6" cy="6" r="3"></circle>
                  <circle cx="6" cy="18" r="3"></circle>
                  <path d="M20 4L8.12 15.88"></path>
                  <path d="M14.47 14.48L20 20"></path>
                </svg>

                <svg
                  v-else-if="item.icon === 'map-pin'"
                  class="sidebar-nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 21l-7-7a7 7 0 1114 0l-7 7z"
                  />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>

              <span v-if="!isCollapsed" class="sidebar-nav-label">{{ item.label }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  isCollapsed: { type: Boolean, default: false },
});

const emit = defineEmits(['toggle']);
const emitToggle = () => emit('toggle');

const items = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/barbers', label: 'Barberos', icon: 'users' },
  { to: '/sales', label: 'Ventas', icon: 'credit-card' },
  { to: '/services', label: 'Servicios', icon: 'scissors' },
  { to: '/stations', label: 'Estaciones', icon: 'map-pin' },
];
</script>

<style scoped>
.sidebar-main {
  background: linear-gradient(to bottom, #fff, #f9fafb);
  color: #4b5563;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-right: 1px solid #e5e7eb;
  transition: all 300ms ease-in-out;
}

.sidebar-collapsed {
  width: 5rem;
}

.sidebar-expanded {
  width: 16rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-logo-icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #2563eb;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.sidebar-logo-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #fff;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  color: #1f2937;
}

.sidebar-toggle-button {
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease-in-out;
}

.sidebar-toggle-button:hover {
  background-color: #f3f4f6;
}

.sidebar-toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 200ms;
}

.sidebar-toggle-icon.rotate-180 {
  transform: rotate(180deg);
}

.sidebar-toggle-icon.rotate-0 {
  transform: rotate(0deg);
}

.sidebar-menu-label {
  padding: 0.75rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  flex: 1 1 0%;
  padding: 1rem 0.5rem;
}

.sidebar-nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 200ms;
}

.sidebar-nav-item-active {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-left: 4px solid #2563eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.sidebar-nav-item-inactive {
  color: #4b5563;
}

.sidebar-nav-item-inactive:hover {
  background-color: #f9fafb;
  color: #1d4ed8;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.sidebar-nav-item-collapsed {
  justify-content: center;
}

.sidebar-nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.sidebar-nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  transition: color 200ms;
}

.sidebar-nav-item-inactive:hover .sidebar-nav-icon {
  color: #1d4ed8;
}

.sidebar-nav-label {
  margin-left: 0.75rem;
}
</style>
