<template>
  <div class="products-view p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
      Gestión de Inventario de Productos
    </h1>

    <div v-if="productStore.loading" class="text-center text-gray-600">
      Cargando productos...
    </div>
    <div v-if="productStore.error" class="text-center text-red-500">
      {{ productStore.error }}
    </div>

    <!-- Productos con bajo stock -->
    <div
      v-if="productStore.lowStockProducts.length > 0"
      class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 shadow-md"
      role="alert"
    >
      <p class="font-bold">¡Alerta de Bajo Stock!</p>
      <ul class="list-disc ml-5">
        <li v-for="product in productStore.lowStockProducts" :key="product.id">
          {{ product.name }} (Stock actual: {{ product.stock_quantity }} /
          Mínimo: {{ product.min_stock_level }})
        </li>
      </ul>
    </div>

    <!-- Botón para añadir nuevo producto -->
    <button
      @click="openCreateModal"
      class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 shadow-lg transition duration-300 ease-in-out"
    >
      Añadir Nuevo Producto
    </button>

    <!-- Tabla de Productos -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Nombre
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Precio
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Stock
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Stock Mínimo
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in productStore.products"
            :key="product.id"
            class="hover:bg-gray-50"
          >
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ product.name }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              S/. {{ (product.price || 0).toFixed(2) }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ product.stock_quantity }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ product.min_stock_level }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <button
                @click="openEditModal(product)"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
              >
                Editar
              </button>
              <button
                @click="openUpdateStockModal(product)"
                class="text-green-600 hover:text-green-900 mr-3"
              >
                Actualizar Stock
              </button>
              <button
                @click="deleteProduct(product.id)"
                class="text-red-600 hover:text-red-900"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modales -->
    <Modal :show="showCreateModal" @close="closeCreateModal">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">
        Añadir Nuevo Producto
      </h3>
      <form @submit.prevent="createProduct">
        <div class="mb-4">
          <label
            for="newProductName"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Nombre:</label
          >
          <input
            type="text"
            id="newProductName"
            v-model="newProduct.name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="newProductPrice"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Precio:</label
          >
          <input
            type="number"
            id="newProductPrice"
            v-model.number="newProduct.price"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="newProductStock"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Stock Inicial:</label
          >
          <input
            type="number"
            id="newProductStock"
            v-model.number="newProduct.stock_quantity"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="newProductMinStock"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Stock Mínimo:</label
          >
          <input
            type="number"
            id="newProductMinStock"
            v-model.number="newProduct.min_stock_level"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Guardar
          </button>
          <button
            type="button"
            @click="closeCreateModal"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>

    <Modal :show="showEditModal" @close="closeEditModal">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">Editar Producto</h3>
      <form @submit.prevent="updateProduct">
        <div class="mb-4">
          <label
            for="editProductName"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Nombre:</label
          >
          <input
            type="text"
            id="editProductName"
            v-model="editedProduct.name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="editProductPrice"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Precio:</label
          >
          <input
            type="number"
            id="editProductPrice"
            v-model.number="editedProduct.price"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="editProductMinStock"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Stock Mínimo:</label
          >
          <input
            type="number"
            id="editProductMinStock"
            v-model.number="editedProduct.min_stock_level"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            @click="closeEditModal"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>

    <Modal :show="showUpdateStockModal" @close="closeUpdateStockModal">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">
        Actualizar Stock de {{ productToUpdateStock?.name }}
      </h3>
      <form @submit.prevent="submitUpdateStock">
        <div class="mb-4">
          <label
            for="updateStockQuantity"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Nueva Cantidad en Stock:</label
          >
          <input
            type="number"
            id="updateStockQuantity"
            v-model.number="stockUpdateQuantity"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Actualizar
          </button>
          <button
            type="button"
            @click="closeUpdateStockModal"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import Modal from '../components/Modal.vue'; // Asegúrate de que la ruta sea correcta

const productStore = useProductStore();

// Modales
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showUpdateStockModal = ref(false);

// Datos para formularios
const newProduct = ref({
  name: '',
  price: 0,
  stock_quantity: 0,
  min_stock_level: 0,
});
const editedProduct = ref(null);
const productToUpdateStock = ref(null);
const stockUpdateQuantity = ref(0);

// Funciones para abrir/cerrar modales
const openCreateModal = () => {
  newProduct.value = {
    name: '',
    price: 0,
    stock_quantity: 0,
    min_stock_level: 0,
  };
  showCreateModal.value = true;
};
const closeCreateModal = () => (showCreateModal.value = false);

const openEditModal = (product) => {
  editedProduct.value = { ...product };
  showEditModal.value = true;
};
const closeEditModal = () => (showEditModal.value = false);

const openUpdateStockModal = (product) => {
  productToUpdateStock.value = { ...product };
  stockUpdateQuantity.value = product.stock_quantity; // Set current stock as default
  showUpdateStockModal.value = true;
};
const closeUpdateStockModal = () => (showUpdateStockModal.value = false);

// Acciones CRUD
const createProduct = async () => {
  try {
    await productStore.createProduct(newProduct.value);
    closeCreateModal();
    await productStore.fetchProducts(); // Refresh list
  } catch (error) {
    // Error handled by store, display message in UI
  }
};

const updateProduct = async () => {
  try {
    await productStore.updateProduct(
      editedProduct.value.id,
      editedProduct.value,
    );
    closeEditModal();
    await productStore.fetchProducts(); // Refresh list
  } catch (error) {
    // Error handled by store
  }
};

const submitUpdateStock = async () => {
  try {
    await productStore.updateProductStock(
      productToUpdateStock.value.id,
      stockUpdateQuantity.value,
    );
    closeUpdateStockModal();
    await productStore.fetchProducts(); // Refresh list
  } catch (error) {
    // Error handled by store
  }
};

const deleteProduct = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    try {
      await productStore.deleteProduct(id);
      await productStore.fetchProducts(); // Refresh list
    } catch (error) {
      // Error handled by store
    }
  }
};

// Cargar productos al montar el componente
onMounted(() => {
  productStore.fetchProducts();
  productStore.fetchLowStockProducts();
});
</script>

<style scoped>
/* Puedes añadir estilos específicos aquí si es necesario */
</style>
