<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Renderizar Sidebar y Header solo si el usuario está autenticado y no está en la página de Login -->
    <template v-if="authStore.isAuthenticated && currentRouteName !== 'Login'">
      <Sidebar
        :isOpen="isSidebarOpen"
        :isCollapsed="isSidebarCollapsed"
        @close="closeSidebar"
        @toggleCollapse="toggleDesktopSidebar"
        class="flex-shrink-0"
      />

      <!-- Overlay para móvil cuando el sidebar está abierto -->
      <!-- Overlay cuando el sidebar está abierto (móvil y desktop) -->
      <div
        v-if="
          isSidebarOpen ||
          (!isSidebarCollapsed &&
            authStore.isAuthenticated &&
            currentRouteName !== 'Login')
        "
        @click="closeSidebar"
        class="fixed inset-0 bg-black opacity-50 z-30"
      ></div>

      <div
        class="flex-1 flex flex-col bg-gray-100 transition-all duration-300 ease-in-out min-w-0"
      >
        <!-- Nuevo Header Moderno -->
        <header class="bg-white border-b border-gray-200 shadow-sm z-10">
          <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <!-- Lado Izquierdo: Botón de Hamburguesa, Logo y Título de Sección -->
              <div class="flex items-center space-x-4">
                <!-- Botón de Hamburguesa (para alternar sidebar en desktop) -->
                <button
                  @click="toggleDesktopSidebar"
                  class="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100 hidden lg:block"
                >
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

                <!-- Botón de Hamburguesa (para alternar sidebar en mobile) -->
                <button
                  @click="toggleMobileSidebar"
                  class="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100 lg:hidden"
                >
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

                <!-- Logo de la Empresa (Placeholder) -->
                <div class="flex-shrink-0">
                  <img
                    class="h-8 w-8 rounded-full"
                    src="https://via.placeholder.com/32/0000FF/FFFFFF?text=LOGO"
                    alt="Company Logo"
                  />
                </div>

                <!-- Título de la Vista Actual -->
                <h1 class="text-xl font-semibold text-gray-800">
                  {{ route.meta.title || currentRouteName }}
                </h1>
              </div>

              <!-- Centro: Barra de Búsqueda -->
              <div
                class="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end"
              >
                <div class="max-w-lg w-full lg:max-w-xs">
                  <label for="search" class="sr-only">Buscar</label>
                  <div
                    class="relative text-gray-400 focus-within:text-gray-600"
                  >
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <svg
                        class="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <input
                      id="search"
                      class="block w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-blue-500 focus:text-gray-900"
                      placeholder="Buscar"
                      type="search"
                    />
                  </div>
                </div>
              </div>

              <!-- Lado Derecho: Notificaciones y Perfil -->
              <div class="flex items-center ml-4 md:ml-6">
                <button
                  class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span class="sr-only">Ver notificaciones</span>
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.958V4a1 1 0 10-2 0v1.042A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                </button>

                <!-- Menú de Perfil -->
                <div class="ml-3 relative">
                  <div>
                    <button
                      @click="isProfileMenuOpen = !isProfileMenuOpen"
                      class="max-w-xs bg-gray-200 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span class="sr-only">Abrir menú de usuario</span>
                      <img
                        class="h-8 w-8 rounded-full"
                        src="https://via.placeholder.com/32"
                        alt="User avatar"
                      />
                    </button>
                  </div>
                  <!-- Dropdown del Perfil -->
                  <transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95"
                  >
                    <div
                      v-if="isProfileMenuOpen"
                      class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <router-link
                        to="/profile"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >Tu Perfil</router-link
                      >
                      <router-link
                        to="/settings"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >Configuración</router-link
                      >
                      <a
                        @click="handleLogout"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >Cerrar Sesión</a
                      >
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          class="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8"
        >
          <RouterView />
        </main>
      </div>
    </template>

    <!-- Renderizar solo RouterView si el usuario NO está autenticado o está en la página de Login -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import { useAuthStore } from './stores/authStore';

const isSidebarOpen = ref(false); // For mobile off-canvas
const isSidebarCollapsed = ref(true); // For desktop collapse (starts collapsed)
const isProfileMenuOpen = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const currentRouteName = computed(() => route.name);

const closeSidebar = () => {
  isSidebarOpen.value = false; // For mobile
  isSidebarCollapsed.value = true; // For desktop
};

const toggleMobileSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  if (isSidebarOpen.value) {
    // If opening mobile sidebar, ensure desktop is collapsed
    isSidebarCollapsed.value = true;
  }
};

const toggleDesktopSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  if (!isSidebarCollapsed.value) {
    // If opening desktop sidebar, ensure mobile is closed
    isSidebarOpen.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
