<template>
  <div class="custom-select-wrapper">
    <div
      class="custom-select"
      :class="{ 'open': isOpen }"
      @click="toggleDropdown"
    >
      <div class="selected-option">
        {{ selectedOptionLabel }}
      </div>
      <div class="arrow" :class="{ 'rotated': isOpen }"></div>
    </div>
    <ul class="options-list" :class="{ 'show': isOpen }">
      <li
        v-for="option in options"
        :key="option.value"
        @click="selectOption(option)"
        :class="{ 'selected': option.value === modelValue }"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: null,
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => value.every(option => 'value' in option && 'label' in option),
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const selectedOptionLabel = computed(() => {
  const selected = props.options.find(option => option.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

// Close dropdown if clicked outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.custom-select-wrapper')) {
    isOpen.value = false;
  }
};

watch(isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%; /* Adjust as needed */
}

.custom-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.custom-select.open {
  border-color: #8B5CF6; /* Example focus color */
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25); /* Example focus ring */
}

.selected-option {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #6B7280; /* Gray arrow */
  transition: transform 0.2s;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.options-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px; /* Scrollable if many options */
  overflow-y: auto;
  z-index: 100; /* Ensure it's above other content */
  display: none; /* Hidden by default */
}

.options-list.show {
  display: block;
}

.options-list li {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.options-list li:hover {
  background-color: #f3f4f6; /* Light gray on hover */
}

.options-list li.selected {
  background-color: #e5e7eb; /* Slightly darker gray for selected */
  font-weight: bold;
}
</style>