import HomeView from '../Views/HomeView.js';
import FavoritosView from '../Views/FavoritosView.js';
import CarrinhoView from '../Views/CarrinhoView.js';
import PerfilView from '../Views/PerfilView.js';
import RastreioView from '../Views/RastreioView.js';

const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/favoritos', name: 'favoritos', component: FavoritosView },
    { path: '/carrinho', name: 'carrinho', component: CarrinhoView },
    { path: '/perfil', name: 'perfil', component: PerfilView },
    { path: '/rastreio', name: 'rastreio', component: RastreioView }
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes
});