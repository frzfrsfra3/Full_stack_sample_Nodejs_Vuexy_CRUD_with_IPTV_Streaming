// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'

// createApp(App).mount('#app')
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import vuetify from './plugins/vuetify'; // you need to set up Vuetify
import axios from './plugins/axios';
import './plugins/socket'; // initialize socket client

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      // your translations
    },
  },
});

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(i18n);
app.use(vuetify);
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$can = () => true;  
app.mount('#app');