import { store, getters } from '../js/store.js';

const templateHTML = await (await fetch('./Views/FavoritosTemplate.html')).text();

export default {
  template: templateHTML,

  setup() {
    return {
      store,
      produtosFavoritos: getters.produtosFavoritos
    };
  },
};