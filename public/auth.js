/* =========================================================
   Guia Med — auth.js
   ---------------------------------------------------------
   Sistema de conta de usuário 100% client-side.

   IMPORTANTE — leia antes de usar em produção:
   Este site não tem servidor nem banco de dados. Por isso,
   tudo (usuários, senhas com hash, sessão, favoritos) fica
   salvo no localStorage do PRÓPRIO NAVEGADOR de quem acessa.

   Isso significa, na prática:
   - Funciona de verdade: dá pra criar conta, logar, deslogar,
     proteger páginas e guardar favoritos/histórico por usuário.
   - NÃO é multi-dispositivo: a conta criada no notebook não
     aparece no celular, porque não existe um servidor central.
   - NÃO é seguro para dados sensíveis reais: qualquer pessoa
     com acesso ao navegador consegue abrir o DevTools e ver
     os hashes salvos. É adequado para prototipagem, portfólio
     e uso pessoal — não para uma plataforma com dados de
     pacientes ou informações sigilosas.
   - Se um dia vocês quiserem login "de verdade" (multi-
     dispositivo, seguro, recuperação de senha por e-mail),
     é necessário um backend de autenticação (ex: Firebase
     Auth ou Supabase Auth, ambos com planos gratuitos que
     plugam em poucas linhas nesse mesmo front-end).
   ========================================================= */

const CHAVE_USUARIOS  = 'guiamed_usuarios';
const CHAVE_SESSAO    = 'guiamed_sessao';
const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

/* ---------- Criptografia leve (hash + salt) ---------- */

function gerarSalt(){
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function gerarHash(senha, salt){
  const encoder = new TextEncoder();
  const dados = encoder.encode(salt + ':' + senha);
  const bufferHash = await crypto.subtle.digest('SHA-256', dados);
  return Array.from(new Uint8Array(bufferHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function gerarToken(){
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Armazenamento de usuários ---------- */

function getUsuarios(){
  try{ return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '{}'); }
  catch(e){ return {}; }
}
function salvarUsuarios(usuarios){
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function emailValido(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Cadastro ---------- */

async function cadastrarUsuario({ nome, email, senha }){
  nome = (nome || '').trim();
  email = (email || '').trim().toLowerCase();

  if(nome.length < 2) return { ok:false, erro: 'Informe seu nome completo.' };
  if(!emailValido(email)) return { ok:false, erro: 'Informe um e-mail válido.' };
  if((senha || '').length < 8) return { ok:false, erro: 'A senha precisa ter pelo menos 8 caracteres.' };

  const usuarios = getUsuarios();
  if(usuarios[email]) return { ok:false, erro: 'Já existe uma conta com esse e-mail neste navegador.' };

  const salt = gerarSalt();
  const hash = await gerarHash(senha, salt);

  usuarios[email] = {
    nome,
    email,
    salt,
    hash,
    criadoEm: new Date().toISOString()
  };
  salvarUsuarios(usuarios);

  criarSessao(email, nome);
  return { ok:true };
}

/* ---------- Login ---------- */

async function autenticarUsuario({ email, senha }){
  email = (email || '').trim().toLowerCase();
  const usuarios = getUsuarios();
  const usuario = usuarios[email];

  if(!usuario) return { ok:false, erro: 'E-mail ou senha incorretos.' };

  const hashTentativa = await gerarHash(senha, usuario.salt);
  if(hashTentativa !== usuario.hash) return { ok:false, erro: 'E-mail ou senha incorretos.' };

  criarSessao(usuario.email, usuario.nome);
  return { ok:true };
}

/* ---------- Sessão ---------- */

function criarSessao(email, nome){
  const sessao = {
    email, nome,
    token: gerarToken(),
    criadoEm: Date.now(),
    expiraEm: Date.now() + DURACAO_SESSAO_MS
  };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

function getSessaoAtiva(){
  try{
    const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null');
    if(!sessao) return null;
    if(Date.now() > sessao.expiraEm){
      localStorage.removeItem(CHAVE_SESSAO);
      return null;
    }
    return sessao;
  }catch(e){ return null; }
}

function encerrarSessao(){
  localStorage.removeItem(CHAVE_SESSAO);
}

/* ---------- Proteção de rotas ---------- */

// Chame no topo de páginas que exigem login (ex: perfil.html).
// Redireciona para login.html preservando a página de origem.
function exigirLogin(){
  const sessao = getSessaoAtiva();
  if(!sessao){
    const destino = encodeURIComponent(window.location.pathname.split('/').pop());
    window.location.href = 'login.html?redirect=' + destino;
    return null;
  }
  return sessao;
}

/* ---------- Favoritos e histórico por usuário ---------- */

function chaveFavoritos(email){ return 'guiamed_favoritos_' + email; }
function chaveVistos(email){ return 'guiamed_vistos_' + (email || 'anon'); }

function getFavoritos(email){
  if(!email) return [];
  try{ return JSON.parse(localStorage.getItem(chaveFavoritos(email)) || '[]'); }
  catch(e){ return []; }
}

function toggleFavorito(email, idArtigo){
  if(!email) return false;
  const favoritos = getFavoritos(email);
  const idx = favoritos.indexOf(idArtigo);
  if(idx === -1){ favoritos.push(idArtigo); }
  else{ favoritos.splice(idx, 1); }
  localStorage.setItem(chaveFavoritos(email), JSON.stringify(favoritos));
  return favoritos.includes(idArtigo);
}

/* ---------- Toasts (avisos rápidos na tela) ---------- */

function mostrarToast(mensagem, tipo = 'info'){
  let container = document.getElementById('toastContainer');
  if(!container){
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast ' + tipo;
  toast.textContent = mensagem;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3800);
}

/* ---------- Renderização da área de conta no header ---------- */

function iniciais(nome){
  return nome.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

function renderAuthArea(){
  const container = document.getElementById('authArea');
  if(!container) return;
  const sessao = getSessaoAtiva();

  if(!sessao){
    container.innerHTML = `<a href="login.html" class="btn btn-primary btn-sm">Entrar</a>`;
    return;
  }

  container.innerHTML = `
    <div class="user-chip">
      <span class="user-avatar">${iniciais(sessao.nome)}</span>
      <span class="user-name">Olá, ${sessao.nome.split(' ')[0]}</span>
      <a href="perfil.html">Meu perfil</a>
      <button id="logoutBtn" type="button">Sair</button>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    encerrarSessao();
    mostrarToast('Sessão encerrada. Até logo!', 'info');
    setTimeout(() => window.location.href = 'index.html', 600);
  });
}

document.addEventListener('DOMContentLoaded', renderAuthArea);