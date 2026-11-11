function formatarTempoRelativo(value){
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return 'data indisponível';

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];
  const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  for(const [unit, length] of units){
    if(Math.abs(seconds) >= length){
      return relative.format(Math.round(seconds / length), unit);
    }
  }
  return relative.format(seconds, 'second');
}

function mostrarEstadoForum(mensagem, erro = false){
  const status = document.getElementById('forumStatus');
  status.textContent = mensagem;
  status.classList.toggle('has-error', erro);
}

function renderizarComentarios(comentarios){
  const list = document.getElementById('forumComments');
  list.replaceChildren();

  if(comentarios.length === 0){
    const empty = document.createElement('li');
    empty.className = 'forum-empty';
    empty.textContent = 'Ainda não há mensagens. Que tal iniciar a discussão?';
    list.appendChild(empty);
    return;
  }

  comentarios.slice().reverse().forEach((comment) => {
    const item = document.createElement('li');
    item.className = 'forum-comment';

    const avatar = document.createElement('span');
    avatar.className = 'forum-avatar';
    avatar.textContent = iniciais(comment.name || 'Usuário');
    avatar.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.className = 'forum-comment-content';
    const header = document.createElement('div');
    header.className = 'forum-comment-meta';

    const author = document.createElement('strong');
    author.textContent = comment.name || 'Usuário';
    const time = document.createElement('time');
    time.dateTime = comment.createdAt;
    time.textContent = formatarTempoRelativo(comment.createdAt);
    time.title = new Date(comment.createdAt).toLocaleString('pt-BR');
    header.append(author, time);

    const text = document.createElement('p');
    text.className = 'forum-comment-text';
    text.textContent = comment.body;
    content.append(header, text);
    item.append(avatar, content);
    list.appendChild(item);
  });
}

async function carregarComentarios(guideId){
  const response = await fetch(`/api/forum?guideId=${encodeURIComponent(guideId)}`);
  let data;
  try{
    data = await response.json();
  }catch{
    throw new Error('O servidor retornou uma resposta inválida ao carregar a discussão.');
  }
  if(!response.ok){
    throw new Error(data?.error || 'Não foi possível carregar a discussão.');
  }
  renderizarComentarios(Array.isArray(data.comments) ? data.comments : []);
}

async function inicializarForum(guideId){
  const section = document.getElementById('forumSection');
  if(!section) return;
  section.hidden = false;

  const form = document.getElementById('forumForm');
  const notice = document.getElementById('forumLoginNotice');
  const loginLink = document.getElementById('forumLoginLink');
  const message = document.getElementById('forumMessage');
  const charCount = document.getElementById('forumCharCount');
  const submitButton = document.getElementById('forumSubmit');
  const destination = `artigo.html?id=${encodeURIComponent(guideId)}`;
  loginLink.href = `login.html?redirect=${encodeURIComponent(destination)}`;
  let sessionError = '';

  message.addEventListener('input', () => {
    charCount.textContent = `${message.value.length}/2000`;
  });

  try{
    const sessao = await validarSessaoServidor();
    form.hidden = !sessao;
    notice.hidden = Boolean(sessao);
  }catch(error){
    form.hidden = true;
    notice.hidden = true;
    sessionError = error.message;
    mostrarEstadoForum(error.message, true);
  }

  try{
    mostrarEstadoForum('Carregando discussão...');
    await carregarComentarios(guideId);
    mostrarEstadoForum(sessionError, Boolean(sessionError));
  }catch(error){
    mostrarEstadoForum(sessionError ? `${sessionError} ${error.message}` : error.message, true);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = message.value.trim();
    if(!text || text.length > 2000) return;

    submitButton.disabled = true;
    mostrarEstadoForum('Enviando mensagem...');
    try{
      const response = await fetch('/api/forum', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId: String(guideId), message: text })
      });
      let data;
      try{
        data = await response.json();
      }catch{
        throw new Error('O servidor retornou uma resposta inválida.');
      }
      if(!response.ok){
        if(response.status === 401){
          form.hidden = true;
          notice.hidden = false;
          validarSessaoServidor().catch((error) => {
            console.error('Não foi possível atualizar a sessão:', error);
          });
        }
        throw new Error(data?.error || 'Não foi possível enviar a mensagem.');
      }

      message.value = '';
      charCount.textContent = '0/2000';
      await carregarComentarios(guideId);
      mostrarEstadoForum('Mensagem publicada.');
    }catch(error){
      mostrarEstadoForum(error.message, true);
    }finally{
      submitButton.disabled = false;
    }
  });
}
