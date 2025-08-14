<template>
  <div
    class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-700 relative overflow-hidden"
  >
    <!-- Fondo con patrón sutil -->
    <div
      class="absolute inset-0 z-0 opacity-10"
      style="
        background-image: url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='006060' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M3634v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm1212V8h-2v4h-4v2h4v4h2v-4h4v-2h-4zM012V8h-2v4H-4v2h4v4h2v-4h4v-2H0zm024v-4h-2v4H-4v2h4v4h2v-4h4v-2H0zm024v-4h-2v4H-4v2h4v4h2v-4h4v-2H0zM240v-4h-2v4h-4v2h4v4h2V6h4V4h-4zm024v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm024v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm240v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2448v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-24v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM480v-4h-2v4h-4v2h4v4h2V6h4V4h-4zm024v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
      "
    ></div>

    <div
      class="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl z-10 transform transition-all duration-300 hover:scale-105"
    >
      <div>
        <h2 class="mt-6 text-center text-4xl font-extrabold text-gray-900">
          Bienvenido
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Inicia sesión para acceder al panel de administración.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only"
              >Correo Electrónico</label
            >
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-200"
              placeholder="Correo Electrónico"
              v-model="email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-200"
              placeholder="Contraseña"
              v-model="password"
            />
          </div>
        </div>

        <div
          v-if="authStore.error"
          class="text-red-600 text-sm text-center font-medium"
        >
          {{ authStore.error }}
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            :disabled="authStore.isLoading"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-6 w-6 text-indigo-500 group-hover:text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ authStore.isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
};
</script>
