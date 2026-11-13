import { store, getters } from '../js/store.js';

const templateHTML = await (await fetch('./Views/HomeTemplate.html')).text();

export default {
  template: templateHTML,
  setup() {
    return {
      store,
      produtosFiltrados: getters.produtosFiltrados
    };
  }
};