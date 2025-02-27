import { createApp } from 'vue'; // Ensure correct Vue import
import App from './App.vue';
import router from './router'; // Ensure correct router import
import vuetify from './plugins/vuetify'; // Ensure correct Vuetify import

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.mount('#app'); // Ensure it is properly mounted
