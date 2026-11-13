import { store, getters } from '../js/store.js';

const templateHTML = await (await fetch('./Views/CarrinhoTemplate.html')).text();

export default {
  template: templateHTML,
  
  setup() {
    const router = VueRouter.useRouter();
    const finalizar = () => store.iniciarPagamento(router);

    return {
      store,
      valorSubtotal: getters.valorSubtotal,
      valorDesconto: getters.valorDesconto,
      valorTotal: getters.valorTotal,
      finalizar
    };
  },
};