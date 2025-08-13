<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Configuración del Sistema
    </h1>

    <div
      v-if="settingStore.isLoading || userStore.isLoading"
      class="text-center text-gray-500"
    >
      Cargando configuraciones...
    </div>
    <div
      v-if="settingStore.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ settingStore.error }}
    </div>
    <div
      v-if="userStore.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ userStore.error }}
    </div>

    <!-- Sección de Reglas de Pago a Barberos -->
    <div class="bg-white shadow-lg rounded-xl p-8 mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        Reglas de Pago a Barberos
      </h2>
      <form @submit.prevent="handleSavePaymentSettings">
        <div class="mb-4">
          <label
            for="baseSalaryThreshold"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Umbral de Salario Base (S/):</label
          >
          <input
            type="number"
            id="baseSalaryThreshold"
            v-model.number="localSettings.base_salary_threshold"
            class="form-input"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="commissionPercentage"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Porcentaje de Comisión (0.0 - 1.0):</label
          >
          <input
            type="number"
            id="commissionPercentage"
            v-model.number="localSettings.commission_percentage"
            step="0.01"
            min="0"
            max="1"
            class="form-input"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="defaultBaseSalary"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Sueldo Base por Defecto (S/):</label
          >
          <input
            type="number"
            id="defaultBaseSalary"
            v-model.number="localSettings.default_base_salary"
            class="form-input"
            required
          />
        </div>

        <div
          v-if="saveSuccess"
          class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg"
        >
          {{ saveSuccess }}
        </div>

        <button
          type="submit"
          class="btn-primary"
          :disabled="settingStore.isLoading"
        >
          {{ settingStore.isLoading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </form>
    </div>

    <!-- Sección de Gestión de Usuarios -->
    <div class="bg-white shadow-lg rounded-xl p-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Gestión de Usuarios</h2>
      <button @click="openUserModal()" class="btn-primary mb-4">
        Añadir Usuario
      </button>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Nombre
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Email
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Rol
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in userStore.users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ user.role }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="openUserModal(user)"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
              >
                Editar
              </button>
              <button
                @click="confirmDeleteUser(user.id)"
                class="text-red-600 hover:text-red-900"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Usuario -->
    <Modal :show="isUserModalOpen" @close="closeUserModal">
      <template #header>
        <h3 class="text-xl font-bold leading-6 text-gray-900">
          {{ isEditingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario' }}
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="handleSaveUser">
          <div class="mb-4">
            <label
              for="userName"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Nombre:</label
            >
            <input
              type="text"
              id="userName"
              v-model="currentUser.name"
              class="form-input"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="userEmail"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Email:</label
            >
            <input
              type="email"
              id="userEmail"
              v-model="currentUser.email"
              class="form-input"
              required
            />
          </div>
          <div class="mb-4" v-if="!isEditingUser">
            <!-- Contraseña solo al crear -->
            <label
              for="userPassword"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Contraseña:</label
            >
            <input
              type="password"
              id="userPassword"
              v-model="currentUser.password"
              class="form-input"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="userRole"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Rol:</label
            >
            <select
              id="userRole"
              v-model="currentUser.role"
              class="form-input"
              required
            >
              <option value="administrador">Administrador</option>
              <option value="cajero">Cajero</option>
            </select>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="closeUserModal" class="btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="userStore.isLoading"
            >
              {{ userStore.isLoading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useSettingStore } from '../stores/settingStore';
import { useUserStore } from '../stores/userStore'; // Importar el nuevo store de usuarios
import Modal from '../components/Modal.vue'; // Importar el componente Modal

const settingStore = useSettingStore();
const userStore = useUserStore(); // Inicializar el store de usuarios

const localSettings = reactive({
  base_salary_threshold: 0,
  commission_percentage: 0,
  default_base_salary: 0,
});

const saveSuccess = ref(null);

// Lógica para Gestión de Usuarios
const isUserModalOpen = ref(false);
const isEditingUser = ref(false);
const currentUser = reactive({
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'cajero',
});

const openUserModal = (user = null) => {
  userStore.error = null; // Limpiar errores previos
  if (user) {
    isEditingUser.value = true;
    currentUser.id = user.id;
    currentUser.name = user.name;
    currentUser.email = user.email;
    currentUser.role = user.role;
    currentUser.password = ''; // No cargar la contraseña al editar
  } else {
    isEditingUser.value = false;
    currentUser.id = null;
    currentUser.name = '';
    currentUser.email = '';
    currentUser.password = '';
    currentUser.role = 'cajero';
  }
  isUserModalOpen.value = true;
};

const closeUserModal = () => {
  isUserModalOpen.value = false;
};

const handleSaveUser = async () => {
  try {
    if (isEditingUser.value) {
      await userStore.updateUser(currentUser.id, {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      });
    } else {
      await userStore.createUser({
        name: currentUser.name,
        email: currentUser.email,
        password: currentUser.password,
        role: currentUser.role,
      });
    }
    closeUserModal();
    userStore.fetchUsers(); // Refrescar la lista de usuarios
  } catch (error) {
    // El error ya se maneja en el store y se muestra en la UI
  }
};

const confirmDeleteUser = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    try {
      await userStore.deleteUser(id);
      userStore.fetchUsers(); // Refrescar la lista de usuarios
    } catch (error) {
      // El error ya se maneja en el store y se muestra en la UI
    }
  }
};

// Lógica existente para Reglas de Pago

onMounted(async () => {
  await settingStore.fetchAllSettings();
  // Cargar los valores del store en el estado local para el formulario
  localSettings.base_salary_threshold =
    parseFloat(settingStore.getSettingByKey('base_salary_threshold')) || 0;
  localSettings.commission_percentage =
    parseFloat(settingStore.getSettingByKey('commission_percentage')) || 0;
  localSettings.default_base_salary =
    parseFloat(settingStore.getSettingByKey('default_base_salary')) || 0;

  // Cargar usuarios al montar la vista
  userStore.fetchUsers();
});

const handleSavePaymentSettings = async () => {
  saveSuccess.value = null;
  try {
    await settingStore.updateSetting(
      'base_salary_threshold',
      localSettings.base_salary_threshold.toString(),
    );
    await settingStore.updateSetting(
      'commission_percentage',
      localSettings.commission_percentage.toString(),
    );
    await settingStore.updateSetting(
      'default_base_salary',
      localSettings.default_base_salary.toString(),
    );
    saveSuccess.value = 'Configuraciones de pago guardadas exitosamente.';
  } catch (error) {
    // El error ya se maneja en el store y se muestra en la UI
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
.btn-secondary {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out;
}
</style>
