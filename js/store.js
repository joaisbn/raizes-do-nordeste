const { reactive, computed, watch } = Vue;

// 1. Apenas o Estado (State)
export const store = reactive({
  menuData: { unidades: [], categorias: [], produtos: [], formas_pagamento: [], cupons: [] },
  selectedUnidade: '',
  selectedCategoria: 'todos',
  searchQuery: '',
  carrinho: [],
  favoritos: [],
  formaPagamento: '',

  // Cupom
  cupomInput: '',
  cupomAplicado: null,
  mensagemCupom: '',

  // Autenticação e Perfil
  usuarioLogado: null,
  formLogin: { nome: '', email: '' },
  openAccordion: 'none',
  historicoPedidos: [],

  // LGPD e Checkout
  cpfFidelidade: '',
  lgpdConsentimento: false,
  modalPrivacidadeAberto: false,
  statusCheckout: 'idle',

  // Rastreio
  statusRastreio: 0,
  numeroPedido: '000'
});

// 2. Propriedades Computadas Globais (Getters)
export const getters = {
  produtosFiltrados: computed(() => {
    if (!store.menuData.produtos) return [];
    const query = store.searchQuery.toLowerCase();
    return store.menuData.produtos.filter(p => {
      const naUnidade = p.unidades_disponiveis.includes(store.selectedUnidade);
      const naCategoria = store.selectedCategoria === 'todos' || p.categoria_id === store.selectedCategoria;
      const naBusca = query === '' || p.nome.toLowerCase().includes(query) || p.descricao.toLowerCase().includes(query);
      return naUnidade && naCategoria && naBusca;
    });
  }),

  produtosFavoritos: computed(() => {
    if (!store.menuData.produtos) return [];
    return store.menuData.produtos.filter(p => store.favoritos.includes(p.id));
  }),

  quantidadeTotal: computed(() => store.carrinho.reduce((acc, item) => acc + item.quantidade, 0)),

  valorSubtotal: computed(() => store.carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0)),

  valorDesconto: computed(() => {
    if (!store.cupomAplicado) return 0;
    if (store.cupomAplicado.tipo === 'percentual') {
      return getters.valorSubtotal.value * (store.cupomAplicado.valor / 100);
    }
    return store.cupomAplicado.valor;
  }),

  valorTotal: computed(() => Math.max(0, getters.valorSubtotal.value - getters.valorDesconto.value))
};

// 3. Métodos de Negócio (Actions)
// Evitamos o uso de 'this', referenciando o 'store' e 'getters' diretamente.

store.init = async () => {
  store.carregarStorage();
  await store.carregarMenu();
};

store.carregarMenu = async () => {
  try {
    const response = await fetch('mock.json');
    const data = await response.json();
    store.menuData = data;
    if (data.unidades.length > 0 && !store.selectedUnidade) {
      store.selectedUnidade = data.unidades[0].id;
    }
  } catch (e) {
    console.error("Erro ao carregar mock.json:", e);
  }
};

store.carregarStorage = () => {
  const cartSalvo = localStorage.getItem('raizesCart');
  const favSalvo = localStorage.getItem('raizesFavs');
  const userSalvo = localStorage.getItem('raizesUser');
  const histSalvo = localStorage.getItem('raizesHistorico');

  if (cartSalvo) store.carrinho = JSON.parse(cartSalvo);
  if (favSalvo) store.favoritos = JSON.parse(favSalvo);
  if (userSalvo) store.usuarioLogado = JSON.parse(userSalvo);
  if (histSalvo) store.historicoPedidos = JSON.parse(histSalvo);
};

store.formatarPreco = (valor) => {
  return Number(valor).toFixed(2).replace('.', ',');
};

store.adicionarAoCarrinho = (produto) => {
  const index = store.carrinho.findIndex(item => item.produto.id === produto.id);
  if (index > -1) store.carrinho[index].quantidade++;
  else store.carrinho.push({ produto, quantidade: 1 });
};

store.alterarQuantidade = (index, delta) => {
  const nova = store.carrinho[index].quantidade + delta;
  if (nova > 0) store.carrinho[index].quantidade = nova;
  else store.carrinho.splice(index, 1);
};

store.toggleFavorito = (id) => {
  const idx = store.favoritos.indexOf(id);
  if (idx > -1) store.favoritos.splice(idx, 1);
  else store.favoritos.push(id);
};

store.fazerLogin = () => {
  store.usuarioLogado = { nome: store.formLogin.nome, email: store.formLogin.email };
};

store.fazerLogout = () => {
  store.usuarioLogado = null;
  store.formLogin = { nome: '', email: '' };
  store.openAccordion = 'none';
};

store.toggleAccordion = (section) => {
  store.openAccordion = store.openAccordion === section ? 'none' : section;
};

store.aplicarCupom = () => {
  const codigoDigitado = store.cupomInput.trim().toUpperCase();
  if (!store.menuData.cupons) return;
  const cupomEncontrado = store.menuData.cupons.find(c => c.codigo === codigoDigitado && c.ativo);

  if (!cupomEncontrado) {
    store.mensagemCupom = "Cupom inválido ou expirado.";
    store.cupomAplicado = null;
  } else if (getters.valorSubtotal.value < cupomEncontrado.valor_minimo) {
    store.mensagemCupom = `Este cupom exige compras acima de R$ ${store.formatarPreco(cupomEncontrado.valor_minimo)}.`;
    store.cupomAplicado = null;
  } else {
    store.cupomAplicado = cupomEncontrado;
    store.mensagemCupom = "Cupom aplicado com sucesso!";
  }
};

store.removerCupom = () => {
  store.cupomAplicado = null;
  store.cupomInput = '';
  store.mensagemCupom = '';
};

store.iniciarPagamento = (router) => {
  if (store.cpfFidelidade.length > 0 && !store.lgpdConsentimento) {
    alert("Aceite a política de privacidade para usar o CPF.");
    return;
  }
  store.statusCheckout = 'loading';

  setTimeout(() => {
    store.statusCheckout = 'idle';
    const numPedidoGerado = Math.floor(Math.random() * 900) + 100;
    store.numeroPedido = numPedidoGerado;

    const dataAtual = new Date();
    const novoPedido = {
      id: numPedidoGerado,
      data: dataAtual.toLocaleDateString('pt-BR') + ' às ' + dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      itens: store.carrinho.map(i => ({ nome: i.produto.nome, quantidade: i.quantidade })),
      total: getters.valorTotal.value
    };
    store.historicoPedidos.unshift(novoPedido);

    store.carrinho = [];
    store.removerCupom();
    store.cpfFidelidade = '';
    store.lgpdConsentimento = false;

    store.statusRastreio = 0;
    router.push('/rastreio');

    setTimeout(() => {
      store.statusRastreio = 1;
      setTimeout(() => {
        store.statusRastreio = 2;
      }, 6000);
    }, 4000);
  }, 2000);
};

// 4. Watchers de Persistência
watch(() => store.carrinho, (val) => {
  localStorage.setItem('raizesCart', JSON.stringify(val));
  if (store.cupomAplicado && getters.valorSubtotal.value < store.cupomAplicado.valor_minimo) {
    store.removerCupom();
    store.mensagemCupom = "Cupom removido (valor mínimo não atingido).";
  }
}, { deep: true });

watch(() => store.favoritos, (val) => localStorage.setItem('raizesFavs', JSON.stringify(val)), { deep: true });
watch(() => store.usuarioLogado, (val) => localStorage.setItem('raizesUser', JSON.stringify(val)), { deep: true });
watch(() => store.historicoPedidos, (val) => localStorage.setItem('raizesHistorico', JSON.stringify(val)), { deep: true });