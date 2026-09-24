/* =========================================================
   Guia Med — script.js
   Toda a lógica de carregamento e renderização do site.
   Não há backend: os dados vêm de dados.json e o "estado"
   do usuário (tema, tópicos vistos) fica em localStorage.
   ========================================================= */

let TODOS_ARTIGOS = [];   // cache em memória depois do primeiro fetch
let TAG_ATIVA = null;     // tag selecionada nos filtros, ou null = todas
let ITENS_VISIVEIS = 4;   // paginação simples do "Ver todos os tópicos"

/* ---------- Utilidades de estado local ---------- */

function getVistos(){
  const sessao = (typeof getSessaoAtiva === 'function') ? getSessaoAtiva() : null;
  const chave = 'guiamed_vistos_' + (sessao ? sessao.email : 'anon');
  try{ return JSON.parse(localStorage.getItem(chave) || '[]'); }
  catch(e){ return []; }
}
function marcarComoVisto(id){
  const sessao = (typeof getSessaoAtiva === 'function') ? getSessaoAtiva() : null;
  const chave = 'guiamed_vistos_' + (sessao ? sessao.email : 'anon');
  const vistos = getVistos();
  if(!vistos.includes(id)){
    vistos.push(id);
    localStorage.setItem(chave, JSON.stringify(vistos));
  }
}

/* ---------- Carregamento dos dados ---------- */

async function carregarDados(){
  if(TODOS_ARTIGOS.length) return TODOS_ARTIGOS;
  const resp = await fetch('dados.json');
  if(!resp.ok) throw new Error('Não foi possível carregar dados.json');
  const dados = await resp.json();
  const vistos = getVistos();
  // aplica o status "visto" salvo localmente por cima do dado bruto do JSON
  TODOS_ARTIGOS = dados.map(a => ({
    ...a,
    status: vistos.includes(a.id) ? 'visto' : (a.status || 'não visto')
  }));
  return TODOS_ARTIGOS;
}

/* ---------- Home: feed de tópicos ---------- */

async function carregarFeed(){
  const lista = document.getElementById('feedList');
  if(!lista) return; // não estamos na home
  try{
    const artigos = await carregarDados();
    montarFiltrosDeTag(artigos);
    renderizarFeed(artigos);
    carregarDestaques(artigos);
  }catch(err){
    lista.innerHTML = '<li>Não foi possível carregar os guias agora. Tente novamente em instantes.</li>';
    console.error(err);
  }
}

function montarFiltrosDeTag(artigos){
  const container = document.getElementById('tagFilters');
  if(!container) return;
  const todasTags = [...new Set(artigos.flatMap(a => a.tags || []))];
  container.innerHTML = '';

  const chipTodas = document.createElement('button');
  chipTodas.className = 'tag-chip active';
  chipTodas.textContent = 'Todas';
  chipTodas.addEventListener('click', () => {
    TAG_ATIVA = null;
    ITENS_VISIVEIS = 4;
    atualizarChipsAtivos(container, chipTodas);
    renderizarFeed(TODOS_ARTIGOS);
  });
  container.appendChild(chipTodas);

  todasTags.forEach(tag => {
    const chip = document.createElement('button');
    chip.className = 'tag-chip';
    chip.textContent = tag;
    chip.addEventListener('click', () => {
      TAG_ATIVA = tag;
      ITENS_VISIVEIS = 4;
      atualizarChipsAtivos(container, chip);
      renderizarFeed(TODOS_ARTIGOS);
    });
    container.appendChild(chip);
  });
}

function atualizarChipsAtivos(container, chipAtivo){
  container.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
  chipAtivo.classList.add('active');
}

function renderizarFeed(artigos){
  const lista = document.getElementById('feedList');
  if(!lista) return;

  let filtrados = artigos;
  if(TAG_ATIVA){
    filtrados = filtrados.filter(a => (a.tags || []).includes(TAG_ATIVA));
  }

  const termoBusca = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  if(termoBusca){
    filtrados = filtrados.filter(a =>
      a.titulo.toLowerCase().includes(termoBusca) ||
      (a.tags || []).some(t => t.toLowerCase().includes(termoBusca)) ||
      (a.tipo || '').toLowerCase().includes(termoBusca)
    );
  }

  const visiveis = filtrados.slice(0, ITENS_VISIVEIS);
  lista.innerHTML = '';

  if(visiveis.length === 0){
    lista.innerHTML = '<li>Nenhum guia encontrado para essa busca.</li>';
  }

  const sessao = (typeof getSessaoAtiva === 'function') ? getSessaoAtiva() : null;
  const favoritos = (sessao && typeof getFavoritos === 'function') ? getFavoritos(sessao.email) : [];

  visiveis.forEach(a => {
    const li = document.createElement('li');
    li.className = 'feed-item' + (a.status === 'visto' ? ' visto' : '');
    li.innerHTML = `
      <div class="feed-meta">
        <span class="tipo">${a.tipo}</span>
        <span>${a.data}</span>
        <span class="status-dot ${a.status === 'visto' ? 'visto' : ''}"></span>
        <span>${a.status}</span>
      </div>
      <h3>${a.titulo}</h3>
      ${a.subtitulo ? `<p class="subtitulo">${a.subtitulo}</p>` : ''}
      <ul class="topicos-list">
        ${(a.topicos || []).slice(0, 5).map(t => `<li>${t}</li>`).join('')}
      </ul>
      <div class="feed-footer">
        <div class="feed-footer-row">
          <span class="duracao">⏱ ${a.duracao}</span>
          <button class="fav-btn ${favoritos.includes(a.id) ? 'active' : ''}" data-id="${a.id}" type="button" title="Favoritar">♥</button>
        </div>
        <a href="artigo.html?id=${a.id}" class="ler-btn">Ler tópico →</a>
      </div>
    `;
    lista.appendChild(li);
  });

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if(loadMoreBtn){
    loadMoreBtn.style.display = filtrados.length > visiveis.length ? 'block' : 'none';
  }
}

/* ---------- Favoritar (event delegation — anexado uma única vez) ---------- */

function configurarFavoritos(){
  const lista = document.getElementById('feedList');
  if(!lista) return;
  lista.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');
    if(!btn) return;

    const sessao = (typeof getSessaoAtiva === 'function') ? getSessaoAtiva() : null;
    if(!sessao){
      mostrarToast('Crie uma conta gratuita para favoritar guias.', 'info');
      setTimeout(() => window.location.href = 'login.html', 900);
      return;
    }

    const id = Number(btn.dataset.id);
    const agoraAtivo = toggleFavorito(sessao.email, id);
    btn.classList.toggle('active', agoraAtivo);
    mostrarToast(agoraAtivo ? 'Guia adicionado aos favoritos.' : 'Guia removido dos favoritos.', 'sucesso');
  });
}

function carregarDestaques(artigos){
  const container = document.getElementById('destaquesList');
  if(!container) return;
  const destaques = artigos.filter(a => a.destaque).slice(0, 3);
  container.innerHTML = destaques.map((a, i) => `
    <a href="artigo.html?id=${a.id}" class="destaque-item">
      <span class="destaque-num">0${i + 1}</span>
      <span>${a.titulo}</span>
    </a>
  `).join('');
}

/* ---------- Busca em tempo real ---------- */

function buscarArtigos(){
  const input = document.getElementById('searchInput');
  if(!input) return;
  input.addEventListener('input', () => {
    ITENS_VISIVEIS = 4;
    renderizarFeed(TODOS_ARTIGOS);
  });
}

/* ---------- Página do artigo ---------- */

async function exibirArtigo(){
  const container = document.getElementById('artigoConteudo');
  if(!container) return; // não estamos na página de artigo

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));

  try{
    const artigos = await carregarDados();
    const artigo = artigos.find(a => a.id === id);

    if(!artigo){
      container.innerHTML = '<p>Guia não encontrado. <a href="index.html">Voltar para a lista</a>.</p>';
      return;
    }

    document.title = artigo.titulo + ' — Guia Med';
    document.getElementById('pageTitle').textContent = artigo.titulo + ' — Guia Med';

    const sessao = (typeof getSessaoAtiva === 'function') ? getSessaoAtiva() : null;
    const favoritos = (sessao && typeof getFavoritos === 'function') ? getFavoritos(sessao.email) : [];
    const jaFavoritado = favoritos.includes(artigo.id);

    container.innerHTML = `
      <div class="artigo-meta">
        <span>${artigo.tipo}</span>
        <span>${artigo.data}</span>
        <span>⏱ ${artigo.duracao}</span>
        <button class="fav-btn ${jaFavoritado ? 'active' : ''}" id="favBtnArtigo" type="button" title="Favoritar">♥</button>
      </div>
      <h1>${artigo.titulo}</h1>
      <div class="artigo-corpo">${artigo.conteudo}</div>
    `;

    document.getElementById('favBtnArtigo').addEventListener('click', (e) => {
      const sessaoAtual = (typeof getSessaoAtiva === 'function') ? getSessaoAtiva() : null;
      if(!sessaoAtual){
        mostrarToast('Crie uma conta gratuita para favoritar guias.', 'info');
        setTimeout(() => window.location.href = 'login.html', 900);
        return;
      }
      const ativo = toggleFavorito(sessaoAtual.email, artigo.id);
      e.currentTarget.classList.toggle('active', ativo);
      mostrarToast(ativo ? 'Guia adicionado aos favoritos.' : 'Guia removido dos favoritos.', 'sucesso');
    });

    marcarComoVisto(artigo.id);
  }catch(err){
    container.innerHTML = '<p>Não foi possível carregar este guia agora.</p>';
    console.error(err);
  }
}

/* ---------- Menu mobile ---------- */

function configurarMenuMobile(){
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navLinks');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

/* ---------- Modo escuro ---------- */

function configurarModoEscuro(){
  const toggle = document.getElementById('darkToggle');
  if(!toggle) return;
  const salvo = localStorage.getItem('guiamed_tema');
  if(salvo === 'dark'){
    document.body.classList.add('dark');
    toggle.textContent = '☀️';
  }
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const escuro = document.body.classList.contains('dark');
    localStorage.setItem('guiamed_tema', escuro ? 'dark' : 'light');
    toggle.textContent = escuro ? '☀️' : '🌙';
  });
}

/* ---------- Botão voltar ao topo ---------- */

function configurarBackToTop(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Ver todos os tópicos (paginação simples) ---------- */

function configurarLoadMore(){
  const btn = document.getElementById('loadMoreBtn');
  if(!btn) return;
  btn.addEventListener('click', () => {
    ITENS_VISIVEIS += 4;
    renderizarFeed(TODOS_ARTIGOS);
  });
}

/* ---------- Inicialização ---------- */

document.addEventListener('DOMContentLoaded', () => {
  configurarMenuMobile();
  configurarModoEscuro();
  configurarBackToTop();
  configurarLoadMore();
  configurarFavoritos();
  buscarArtigos();
  carregarFeed();   // não faz nada se não houver #feedList na página
  exibirArtigo();   // não faz nada se não houver #artigoConteudo na página
});