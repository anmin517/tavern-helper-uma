import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

$(async () => {
  await waitUntil(() => getCurrentMessageId() != null && getChatMessages(getCurrentMessageId()).length > 0, {
    timeout: 15000,
  });
  createApp(App).use(createPinia()).mount('#app');
});
