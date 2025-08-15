<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Mi Perfil</h1>

    <div v-if="authStore.isLoading" class="text-center text-gray-500">
      Cargando perfil...
    </div>
    <div
      v-if="authStore.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ authStore.error }}
    </div>

    <div v-if="authStore.user" class="bg-white shadow-lg rounded-xl p-8 mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        Información Personal
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1"
            >Nombre:</label
          >
          <p class="text-gray-900 text-lg">{{ authStore.user.name }}</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1"
            >Email:</label
          >
          <p class="text-gray-900 text-lg">{{ authStore.user.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1"
            >Rol:</label
          >
          <p class="text-gray-900 text-lg">{{ authStore.user.role }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-lg rounded-xl p-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Cambiar Contraseña</h2>
      <form @submit.prevent="handleChangePassword">
        <div class="mb-4">
          <label
            for="oldPassword"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Contraseña Actual:</label
          >
          <input
            type="password"
            id="oldPassword"
            v-model="oldPassword"
            class="form-input"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="newPassword"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Nueva Contraseña:</label
          >
          <input
            type="password"
            id="newPassword"
            v-model="newPassword"
            class="form-input"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="confirmNewPassword"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Confirmar Nueva Contraseña:</label
          >
          <input
            type="password"
            id="confirmNewPassword"
            v-model="confirmNewPassword"
            class="form-input"
            required
          />
        </div>

        <div
          v-if="passwordChangeError"
          class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
        >
          {{ passwordChangeError }}
        </div>
        <div
          v-if="passwordChangeSuccess"
          class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg"
        >
          {{ passwordChangeSuccess }}
        </div>

        <button
          type="submit"
          class="btn-primary"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api'; // Import the centralized Axios instance

const authStore = useAuthStore();

const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const passwordChangeError = ref(null);
const passwordChangeSuccess = ref(null);

onMounted(() => {
  // Asegurarse de que el usuario esté cargado en el store
  if (!authStore.user) {
    // Si no está cargado, intentar inicializarlo desde localStorage
    authStore.initializeStore();
  }
});

const handleChangePassword = async () => {
  passwordChangeError.value = null;
  passwordChangeSuccess.value = null;

  if (newPassword.value !== confirmNewPassword.value) {
    passwordChangeError.value = 'Las nuevas contraseñas no coinciden.';
    return;
  }

  authStore.isLoading = true; // Activar indicador de carga
  try {
    const token = authStore.token;
    if (!token) {
      passwordChangeError.value =
        'No autenticado. Por favor, inicia sesión de nuevo.';
      return;
    }

    await api.put(
      `/auth/change-password`,
      {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      },
    );
    passwordChangeSuccess.value = 'Contraseña actualizada exitosamente.';
    oldPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    if (error.response && error.response.data && error.response.data.message) {
      passwordChangeError.value = error.response.data.message;
    } else {
      passwordChangeError.value =
        'Error al cambiar la contraseña. Inténtalo de nuevo.';
    }
  } finally {
    authStore.isLoading = false; // Desactivar indicador de carga
  }
};
</script>

<style scoped>
.form-input {
  @apply block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out;
}
.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition duration-150 ease-in-out;
}
</style>
