const CHAVE_SESSAO = 'guiamed_sessao';
const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

function getSessaoAtiva(){
  try{
    const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null');
    if(!sessao || Date.now() > sessao.expiraEm){
      localStorage.removeItem(CHAVE_SESSAO);
      return null;
    }
    return sessao;
  }catch(e){ return null; }
}

function removerSessaoLocal(){
  try{
    localStorage.removeItem(CHAVE_SESSAO);
  }catch(error){
    console.error('Não foi possível limpar a sessão local:', error);
  }
}

function salvarSessaoLocal(usuario){
  const sessao = {
    email: usuario.email,
    nome: usuario.name,
    expiraEm: Date.now() + DURACAO_SESSAO_MS
  };
  try{
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  }catch(error){
    console.error('Não foi possível salvar o cache local da sessão:', error);
  }
  renderAuthArea(sessao);
  return sessao;
}

async function validarSessaoServidor(){
  const response = await fetch('/api/auth/session', { credentials: 'same-origin' });
  let data;
  try{
    data = await response.json();
  }catch{
    throw new Error('O servidor retornou uma resposta de sessão inválida.');
  }
  if(!response.ok){
    throw new Error(data?.error || 'Não foi possível validar a sessão.');
  }
  if(!data.user){
    removerSessaoLocal();
    renderAuthArea(null);
    return null;
  }
  return salvarSessaoLocal(data.user);
}

async function enviarDadosAutenticacao(endpoint, dados){
  try{
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    let data;
    try{
      data = await response.json();
    }catch{
      return { ok:false, erro:'O servidor retornou uma resposta inválida. Tente novamente.' };
    }
    if(!response.ok){
      return { ok:false, erro:data?.error || 'Não foi possível concluir a solicitação.' };
    }
    salvarSessaoLocal(data.user);
    return { ok:true };
  }catch{
    return { ok:false, erro:'Não foi possível conectar ao servidor. Tente novamente.' };
  }
}

function cadastrarUsuario({ nome, email, senha }){
  return enviarDadosAutenticacao('/api/auth/register', { nome, email, senha });
}

function autenticarUsuario({ email, senha }){
  return enviarDadosAutenticacao('/api/auth/login', { email, senha });
}

async function encerrarSessao(){
  let response;
  try{
    response = await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'same-origin'
    });
  }catch{
    throw new Error('Não foi possível conectar ao servidor para encerrar a sessão.');
  }

  if(!response.ok){
    let data;
    try{ data = await response.json(); }catch{}
    throw new Error(data?.error || 'Não foi possível encerrar a sessão.');
  }
  removerSessaoLocal();
}

function exigirLogin(){
  const sessao = getSessaoAtiva();
  if(!sessao){
    const destino = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
    window.location.href = 'login.html?redirect=' + destino;
    return null;
  }
  return sessao;
}

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

function iniciais(nome){
  return nome.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

function renderAuthArea(sessao = getSessaoAtiva()){
  const container = document.getElementById('authArea');
  if(!container) return;
  container.replaceChildren();

  if(!sessao){
    const login = document.createElement('a');
    login.href = 'login.html';
    login.className = 'btn btn-primary btn-sm';
    login.textContent = 'Entrar';
    container.appendChild(login);
    return;
  }

  const chip = document.createElement('div');
  chip.className = 'user-chip';
  const avatar = document.createElement('span');
  avatar.className = 'user-avatar';
  avatar.textContent = iniciais(sessao.nome);
  const greeting = document.createElement('span');
  greeting.className = 'user-name';
  greeting.textContent = `Olá, ${sessao.nome.split(' ')[0]}`;
  const profile = document.createElement('a');
  profile.href = 'perfil.html';
  profile.textContent = 'Meu perfil';
  const logout = document.createElement('button');
  logout.type = 'button';
  logout.textContent = 'Sair';
  logout.addEventListener('click', async () => {
    logout.disabled = true;
    try{
      await encerrarSessao();
      mostrarToast('Sessão encerrada. Até logo!', 'info');
      window.location.href = 'index.html';
    }catch(error){
      logout.disabled = false;
      mostrarToast(error.message, 'erro');
    }
  });

  chip.append(avatar, greeting, profile, logout);
  container.appendChild(chip);
}

document.addEventListener('DOMContentLoaded', () => {
  renderAuthArea();
  validarSessaoServidor().catch((error) => {
    console.error('Não foi possível validar a sessão:', error);
  });
});
