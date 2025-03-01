import { createApp } from 'vue';
import { createPinia } from 'pinia'; // ✅ Import Pinia
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

const pinia = createPinia(); // ✅ Create Pinia instance

const app = createApp(App);
app.use(pinia); // ✅ Ensure Pinia is used before calling stores
app.use(router);
app.use(vuetify);
app.mount('#app');
