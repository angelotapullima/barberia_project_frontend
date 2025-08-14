import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './style.css';
import VueApexCharts from 'vue3-apexcharts';
import { useAuthStore } from './stores/authStore';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Initialize auth store before router to ensure user data is loaded
const authStore = useAuthStore();
authStore.initializeStore();

app.use(router);
app.use(VueApexCharts);

app.mount('#app');
