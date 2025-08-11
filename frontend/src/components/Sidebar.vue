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
        <li v-for="item in items" :key="item.label">
          <template v-if="item.hasChildren">
            <div
              @click="toggleSubmenu(item.label)"
              :class="[
                'group flex items-center px-3 py-2.5 rounded-md text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer',
                openSubmenu === item.label
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

                <svg
                  v-else-if="item.icon === 'chart-bar'"
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 20V10M18 20V4M6 20v-6" />
                </svg>

                <svg 
                  v-else-if="item.icon === 'clipboard-list'" 
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <line x1="12" y1="11" x2="12" y2="17"></line>
                    <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>

                <svg
                  v-else-if="item.icon === 'box'"
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 7L12 4L4 7L12 10L20 7Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 17L12 20L20 17" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 7V17" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10V20" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 7V17" />
                </svg>
              </span>

              <span v-if="!isCollapsed" class="ml-3">{{ item.label }}</span>
              
              <!-- Flecha de despliegue -->
              <svg
                v-if="!isCollapsed"
                :class="[
                  'w-4 h-4 ml-auto transform transition-transform duration-200',
                  openSubmenu === item.label ? 'rotate-90' : 'rotate-0',
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
            <ul v-if="openSubmenu === item.label && !isCollapsed" class="ml-8 mt-1 space-y-1">
              <li v-for="subItem in item.children" :key="subItem.label">
                <router-link :to="subItem.to" v-slot="{ isActive }">
                  <div
                    :class="[
                      'group flex items-center px-3 py-2.5 rounded-md text-sm font-semibold tracking-wide transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700 hover:shadow-sm',
                    ]"
                  >
                    <span class="flex items-center justify-center w-8 h-8 flex-shrink-0">
                      <!-- Puedes usar un icono diferente para sub-items o dejarlo vacío -->
                      <svg
                        v-if="subItem.icon === 'chart-bar'"
                        class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M12 20V10M18 20V4M6 20v-6" />
                      </svg>
                      <svg
                        v-else-if="subItem.icon === 'box'"
                        class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7L12 4L4 7L12 10L20 7Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 17L12 20L20 17" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 7V17" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 10V20" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7V17" />
                      </svg>
                    </span>
                    <span class="ml-3">{{ subItem.label }}</span>
                  </div>
                </router-link>
              </li>
            </ul>
          </template>
          <template v-else>
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

                  <svg
                    v-else-if="item.icon === 'chart-bar'"
                    class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 20V10M18 20V4M6 20v-6" />
                  </svg>

                  <svg 
                    v-else-if="item.icon === 'clipboard-list'" 
                    class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2">
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <line x1="12" y1="11" x2="12" y2="17"></line>
                      <line x1="9" y1="14" x2="15" y2="14"></line>
                  </svg>

                  <svg
                    v-else-if="item.icon === 'box'"
                    class="w-5 h-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7L12 4L4 7L12 10L20 7Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 17L12 20L20 17" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 7V17" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 10V20" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7V17" />
                  </svg>
                </span>

                <span v-if="!isCollapsed" class="ml-3">{{ item.label }}</span>
              </div>
            </router-link>
          </template>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

defineProps({
  isCollapsed: { type: Boolean, default: false },
});

const emit = defineEmits(['toggle']);
const emitToggle = () => emit('toggle');

const openSubmenu = ref(null); // State for open submenu

const toggleSubmenu = (label) => {
  if (openSubmenu.value === label) {
    openSubmenu.value = null; // Close if already open
  } else {
    openSubmenu.value = label; // Open this submenu
  }
};

const items = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/schedule', label: 'Distribución', icon: 'clipboard-list' },
  {
    label: 'Reportes', 
    icon: 'chart-bar', 
    hasChildren: true,
    children: [
      { to: '/reports', label: 'General', icon: 'chart-bar' },
      { to: '/reports/inventory', label: 'Inventario', icon: 'box' },
      { to: '/reports/station-usage', label: 'Uso de Estaciones', icon: 'chart-bar' },
      { to: '/reports/customer-frequency', label: 'Frecuencia Clientes', icon: 'chart-bar' },
      { to: '/reports/peak-hours', label: 'Horas Pico', icon: 'chart-bar' },
      { to: '/reports/sales/comprehensive', label: 'Ventas Detallado', icon: 'credit-card' },
      { to: '/reports/sales/by-type', label: 'Ventas por Tipo', icon: 'credit-card' },
    ]
  },
  { to: '/barbers', label: 'Barberos', icon: 'users' },
  { to: '/sales', label: 'Ventas', icon: 'credit-card' },
  { to: '/services', label: 'Servicios', icon: 'scissors' },
  { to: '/stations', label: 'Estaciones', icon: 'map-pin' },
  { to: '/reservations', label: 'Reservas', icon: 'calendar' },
  { to: '/products', label: 'Productos', icon: 'box' },
];
</script>

<style scoped>
/* Nada extra porque todo se maneja con Tailwind */
</style>
