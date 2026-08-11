import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

$(async () => {
  // 无需等待 MVU——数据从消息原文解析。等待当前消息楼层就绪即可。
  await waitUntil(() => getCurrentMessageId() != null && getChatMessages(getCurrentMessageId()).length > 0, {
    timeout: 15000,
  });
  createApp(App).use(createPinia()).mount('#app');
});
