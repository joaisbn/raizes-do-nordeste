import { store } from '../js/store.js';

const templateHTML = await (await fetch('./Views/RastreioTemplate.html')).text();

export default {
  template: templateHTML,

  setup() {
    return { store };
  },
};