<template>
  <div class="container mx-auto">
    <!-- Add Product Button -->
    <div class="flex justify-end mb-4">
      <button @click="openProductModal(null)" class="btn-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        Añadir Producto
      </button>
    </div>

    <!-- Product List Table -->
    <div v-if="productStore.loading" class="text-center text-gray-500">
      Cargando productos...
    </div>
    <div v-else-if="productStore.error" class="text-center text-red-500">
      Error: {{ productStore.error }}
    </div>
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden p-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nombre
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Descripción
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Precio
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Stock
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Stock Mínimo
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Categoría
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Activo
            </th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in productStore.products" :key="product.id">
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
            >
              {{ product.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ product.description || 'N/A' }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right"
            >
              S/ {{ product.price.toFixed(2) }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right"
            >
              {{ product.stock_quantity }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right"
            >
              {{ product.min_stock_level }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ product.category || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': product.is_active,
                  'bg-red-100 text-red-800': !product.is_active,
                }"
              >
                {{ product.is_active ? 'Sí' : 'No' }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                @click="openProductModal(product)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Editar
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

    <!-- Product Modal -->
    <Modal :show="isProductModalOpen" @close="closeProductModal">
      <template #header>
        <h3 class="text-xl font-bold">
          {{ currentProduct?.id ? 'Editar Producto' : 'Añadir Producto' }}
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="saveProduct">
          <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2"
              >Nombre:</label
            >
            <input
              type="text"
              id="name"
              v-model="productForm.name"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="description"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Descripción:</label
            >
            <textarea
              id="description"
              v-model="productForm.description"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          <div class="mb-4">
            <label
              for="price"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Precio:</label
            >
            <input
              type="number"
              id="price"
              v-model.number="productForm.price"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              step="0.01"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="stock_quantity"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Stock Actual:</label
            >
            <input
              type="number"
              id="stock_quantity"
              v-model.number="productForm.stock_quantity"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="min_stock_level"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Stock Mínimo:</label
            >
            <input
              type="number"
              id="min_stock_level"
              v-model.number="productForm.min_stock_level"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="category"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Categoría:</label
            >
            <input
              type="text"
              id="category"
              v-model="productForm.category"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div class="mb-4 flex items-center">
            <input
              type="checkbox"
              id="is_active"
              v-model="productForm.is_active"
              class="mr-2"
            />
            <label for="is_active" class="text-gray-700 text-sm font-bold"
              >Activo</label
            >
          </div>
          <div class="flex items-center justify-between">
            <button type="submit" class="btn-primary">Guardar</button>
            <button
              type="button"
              class="btn-secondary"
              @click="closeProductModal"
            >
              Cancelar
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import Modal from '../components/Modal.vue'; // Assuming you have a generic Modal component

const productStore = useProductStore();

const isProductModalOpen = ref(false);
const currentProduct = ref(null); // To hold the product being edited
const productForm = ref({
  name: '',
  description: '',
  price: 0,
  stock_quantity: 0,
  min_stock_level: 0,
  category: '',
  is_active: true,
});

const openProductModal = (product) => {
  currentProduct.value = product;
  if (product) {
    // Populate form for editing
    productForm.value = { ...product };
  } else {
    // Reset form for adding new
    productForm.value = {
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      min_stock_level: 0,
      category: '',
      is_active: true,
    };
  }
  isProductModalOpen.value = true;
};

const closeProductModal = () => {
  isProductModalOpen.value = false;
  currentProduct.value = null;
};

const saveProduct = async () => {
  try {
    if (currentProduct.value?.id) {
      // Update existing product
      await productStore.updateProduct(
        currentProduct.value.id,
        productForm.value,
      );
      alert('Producto actualizado exitosamente!');
    } else {
      // Add new product
      await productStore.addProduct(productForm.value);
      alert('Producto añadido exitosamente!');
    }
    closeProductModal();
    await productStore.fetchProducts(); // Refresh list
  } catch (error) {
    alert(`Error al guardar el producto: ${error.message || error}`);
  }
};

const deleteProduct = async (id) => {
  if (
    confirm(
      '¿Estás seguro de que quieres eliminar este producto? (Se marcará como inactivo)',
    )
  ) {
    try {
      await productStore.deleteProduct(id);
      alert('Producto eliminado (inactivado) exitosamente!');
      await productStore.fetchProducts(); // Refresh list
    } catch (error) {
      alert(`Error al eliminar el producto: ${error.message || error}`);
    }
  }
};

onMounted(() => {
  productStore.fetchProducts();
});
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50;
}
</style>
