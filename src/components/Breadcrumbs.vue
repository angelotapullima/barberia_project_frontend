<template>
  <nav aria-label="breadcrumb">
    <ol
      class="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 p-3 rounded-md"
    >
      <li v-for="(item, index) in items" :key="index" class="flex items-center">
        <router-link
          v-if="!item.disabled"
          :to="item.to"
          class="hover:text-gray-900 hover:underline"
        >
          {{ item.text }}
        </router-link>
        <span v-else class="font-semibold text-gray-700 cursor-default">
          {{ item.text }}
        </span>
        <svg
          v-if="index < items.length - 1"
          class="w-4 h-4 mx-2 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [], // Example: [{ text: 'Home', to: '/', disabled: false }, { text: 'Category', disabled: true }]
  },
});
</script>
