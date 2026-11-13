import { store, getters } from './store.js';
import { router } from './router.js';

const { createApp, onMounted } = Vue;

const app = createApp({
    setup() {
        onMounted(() => {
            store.init();
        });

        return {
            store,
            quantidadeTotal: getters.quantidadeTotal
        };
    }
});

app.use(router);
app.mount('#app');