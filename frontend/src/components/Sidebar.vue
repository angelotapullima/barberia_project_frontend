<template>
  <aside
    :class="[
      isCollapsed ? 'w-20' : 'w-64',
      'bg-white opacity-100 text-gray-700 flex flex-col shadow-lg transition-all duration-300 ease-in-out',
    ]"
    aria-label="Sidebar"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
          <svg
            class="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h1 v-if="!isCollapsed" class="text-lg font-bold tracking-wide text-gray-800">
          BARBERSHOP
        </h1>
      </div>

      <!-- Botón colapsar -->
      <button
        @click="emitToggle"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        class="p-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <svg
          :class="[
            'w-5 h-5 transform transition-transform duration-200',
            isCollapsed ? 'rotate-180' : 'rotate-0',
          ]"
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
    <div
      v-if="!isCollapsed"
      class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
    >
      Menú
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4">
      <ul class="space-y-1">
        <li v-for="item in items" :key="item.to">
          <router-link :to="item.to" v-slot="{ isActive }">
            <div
              :class="[
                'group flex items-center px-3 py-2.5 rounded-md text-sm font-semibold tracking-wide transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700 hover:shadow-sm',
                isCollapsed ? 'justify-center' : '',
              ]"
              :title="isCollapsed ? item.label : null"
            >
              <span class="flex items-center justify-center w-8 h-8 flex-shrink-0">
                <svg
                  v-if="item.icon === 'home'"
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
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
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
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
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
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
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
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
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
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

                <svg
                  v-else-if="item.icon === 'calendar'"
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </span>

              <span v-if="!isCollapsed" class="ml-3">{{ item.label }}</span>
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
  { to: '/reservations', label: 'Reservas', icon: 'calendar' }, // New item for Reservations
];
</script>

<style scoped>
/* Nada extra porque todo se maneja con Tailwind */
</style>
