(() => {
  const SESSION_SECONDS = 10 * 60;
  const screens = {
    briefing: document.getElementById('briefingScreen'),
    simulation: document.getElementById('simulationScreen'),
    debrief: document.getElementById('debriefScreen')
  };
  const workspace = document.querySelector('.osce-workspace');
  const messageList = document.getElementById('messageList');
  const chatInput = document.getElementById('chatInput');
  const chatForm = document.getElementById('chatForm');
  const sendButton = document.getElementById('sendButton');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerContainer = document.getElementById('timerContainer');
  const transcript = [];
  let secondsRemaining = SESSION_SECONDS;
  let timerInterval = null;
  let responseIndex = 0;
  let sessionEnded = false;
  const findings = { vitals: false, ecg: false, chestXray: false };

  const patientResponses = [
    'Estou com muita falta de ar, doutor.',
    'Começou ontem à noite. Hoje está pior.',
    'Piora quando me deito e melhora um pouco quando fico sentado.',
    'Tenho pressão alta, mas não lembro o nome do remédio que tomo.',
    'Não tive febre nem tosse. Estou bem preocupado com essa falta de ar.',
    'Não sei dizer, doutor. Isso nunca aconteceu desse jeito antes.'
  ];

  const vitalSigns = [
    { label: 'Pressão arterial', value: '150/90', unit: 'mmHg' },
    { label: 'Frequência cardíaca', value: '108', unit: 'bpm' },
    { label: 'Frequência respiratória', value: '26', unit: 'irpm' },
    { label: 'Saturação O₂', value: '91', unit: '%' },
    { label: 'Temperatura', value: '36,8', unit: '°C' }
  ];

  const examinationResults = {
    ecg: {
      title: 'Eletrocardiograma',
      summary: 'Ritmo sinusal, frequência aumentada. Sem alterações agudas do segmento ST nesta simulação.'
    },
    chestXray: {
      title: 'Radiografia de tórax',
      summary: 'Opacidades intersticiais bilaterais e silhueta cardíaca aumentada no cenário fictício.'
    }
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([screen, element]) => {
      element.hidden = screen !== name;
    });
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function updateTimer() {
    timerDisplay.textContent = formatTime(secondsRemaining);
    timerContainer.classList.toggle('is-urgent', secondsRemaining <= 60);
    timerContainer.setAttribute('aria-label', `${formatTime(secondsRemaining)} restantes`);
  }

  function startTimer() {
    clearInterval(timerInterval);
    secondsRemaining = SESSION_SECONDS;
    updateTimer();
    timerInterval = window.setInterval(() => {
      secondsRemaining -= 1;
      updateTimer();
      if (secondsRemaining <= 0) finishSession();
    }, 1000);
  }

  function addMessage(role, text) {
    const message = { role, text, time: new Date() };
    transcript.push(message);

    const article = document.createElement('article');
    article.className = `osce-message is-${role}`;
    const avatar = document.createElement('span');
    avatar.className = 'osce-message-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = role === 'doctor' ? 'DR' : 'JM';

    const body = document.createElement('div');
    body.className = 'osce-message-body';
    const name = document.createElement('span');
    name.className = 'osce-message-name';
    name.textContent = role === 'doctor' ? 'Você · Médico' : 'João Martins · Paciente';
    const bubble = document.createElement('div');
    bubble.className = 'osce-message-bubble';
    bubble.textContent = text;
    const time = document.createElement('time');
    time.className = 'osce-message-time';
    time.dateTime = message.time.toISOString();
    time.textContent = message.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    body.append(name, bubble, time);
    article.append(avatar, body);
    messageList.appendChild(article);
    messageList.scrollTop = messageList.scrollHeight;
  }

  function normalizedText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function showVitals() {
    if (findings.vitals) return;
    findings.vitals = true;
    document.getElementById('vitalsEmpty').hidden = true;
    const results = document.getElementById('vitalsResults');
    results.hidden = false;
    vitalSigns.forEach((vital) => {
      const card = document.createElement('div');
      card.className = 'osce-vital-card';
      const label = document.createElement('span');
      label.textContent = vital.label;
      const value = document.createElement('strong');
      value.textContent = vital.value;
      const unit = document.createElement('small');
      unit.textContent = vital.unit;
      card.append(label, value, unit);
      results.appendChild(card);
    });
    addMessage('patient', 'A equipe verificou: pressão 150 por 90, pulso 108, respiração 26 por minuto, saturação 91% e temperatura 36,8 graus.');
  }

  function showExam(examKey) {
    if (findings[examKey]) return;
    findings[examKey] = true;
    const result = examinationResults[examKey];
    document.getElementById('examsEmpty').hidden = true;
    const card = document.createElement('article');
    card.className = 'osce-exam-card';
    const status = document.createElement('span');
    status.textContent = 'RESULTADO DISPONÍVEL';
    const title = document.createElement('strong');
    title.textContent = result.title;
    const summary = document.createElement('p');
    summary.textContent = result.summary;
    card.append(status, title, summary);
    document.getElementById('examResults').appendChild(card);
    const examCount = document.getElementById('examCount');
    const total = Number(findings.ecg) + Number(findings.chestXray);
    examCount.textContent = String(total);
    examCount.hidden = false;
    selectSupportTab('exams');
  }

  function processRequest(text) {
    const normalized = normalizedText(text);
    const requestsVitals = /sinais vitais|verificar.*(sinais|vital|pressao|saturacao)|aferir.*(pressao|sinais)|pressao arterial|frequencia cardiaca|saturacao|temperatura|pulso/.test(normalized);
    const requestsEcg = /\becg\b|eletrocardiograma/.test(normalized);
    const requestsXray = /raio.?x|radiografia|rx de torax/.test(normalized);
    const vitalsAlreadyAvailable = findings.vitals;

    if (requestsVitals && !findings.vitals) showVitals();
    const requestedExams = [];
    if (requestsEcg && !findings.ecg) {
      showExam('ecg');
      requestedExams.push('eletrocardiograma');
    }
    if (requestsXray && !findings.chestXray) {
      showExam('chestXray');
      requestedExams.push('radiografia de tórax');
    }
    if (requestedExams.length) {
      addMessage('patient', `O ${requestedExams.join(' e ')} foi realizado${requestedExams.length > 1 ? 's' : ''}. Você pode consultar o resultado no painel de exames.`);
    } else if (requestsVitals && vitalsAlreadyAvailable) {
      addMessage('patient', 'Os sinais vitais já estão disponíveis no painel clínico.');
    } else if (!requestsVitals) {
      const response = patientResponses[responseIndex % patientResponses.length];
      responseIndex += 1;
      addMessage('patient', response);
    }
  }

  function selectSupportTab(tab) {
    const isVitals = tab === 'vitals';
    document.getElementById('vitalsTab').classList.toggle('is-active', isVitals);
    document.getElementById('vitalsTab').setAttribute('aria-selected', String(isVitals));
    document.getElementById('examsTab').classList.toggle('is-active', !isVitals);
    document.getElementById('examsTab').setAttribute('aria-selected', String(!isVitals));
    document.getElementById('vitalsPanel').hidden = !isVitals;
    document.getElementById('examsPanel').hidden = isVitals;
  }

  function setMobilePanel(panel) {
    workspace.dataset.mobileView = panel;
    document.querySelectorAll('.osce-mobile-tab').forEach((tab) => {
      const isActive = tab.dataset.mobilePanel === panel;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  function renderChecklist() {
    const submittedText = normalizedText(transcript.filter((message) => message.role === 'doctor').map((message) => message.text).join(' '));
    const criteria = [
      { label: 'Investigou sintomas e início do quadro', met: /quando|comec|inicio|piora|melhora|sintoma/.test(submittedText) },
      { label: 'Perguntou sobre alergias', met: /alerg/.test(submittedText) },
      { label: 'Solicitou ECG', met: findings.ecg },
      { label: 'Propôs furosemida', met: /furosemida|furosemide/.test(submittedText) }
    ];
    const passed = criteria.filter((criterion) => criterion.met).length;
    document.getElementById('scoreValue').textContent = String(passed * 2.5).replace('.', ',');
    document.getElementById('checklistTotal').textContent = `${passed} de ${criteria.length}`;
    const list = document.getElementById('checklist');
    list.replaceChildren();

    criteria.forEach((criterion) => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = criterion.label;
      const status = document.createElement('span');
      status.className = `osce-check-status ${criterion.met ? 'is-met' : 'is-missing'}`;
      status.textContent = criterion.met ? '✓ Realizado' : '○ Não identificado';
      item.append(label, status);
      list.appendChild(item);
    });

    const strengths = [];
    if (criteria[0].met) strengths.push('explorou aspectos da história clínica');
    if (findings.vitals) strengths.push('solicitou sinais vitais');
    if (findings.ecg) strengths.push('solicitou um ECG');
    const missingItems = [];
    if (!criteria[1].met) missingItems.push('perguntar sobre alergias');
    if (!criteria[3].met) missingItems.push('explicitar sua proposta de conduta');
    const feedback = strengths.length
      ? `Você ${strengths.join(' e ')}.${missingItems.length ? ` Para completar a avaliação, lembre-se de ${missingItems.join(' e ')}.` : ' Você contemplou todos os critérios deste checklist.'}`
      : `Você concluiu a estação e iniciou a prática de atendimento. Na próxima tentativa, explore o início e a evolução dos sintomas, solicite sinais vitais e exames pertinentes${missingItems.length ? ` e lembre-se de ${missingItems.join(' e ')}` : ''}.`;
    document.getElementById('feedbackText').textContent = feedback;
  }

  function finishSession() {
    if (sessionEnded) return;
    sessionEnded = true;
    clearInterval(timerInterval);
    timerInterval = null;
    chatInput.disabled = true;
    sendButton.disabled = true;
    document.getElementById('finishButton').disabled = true;
    renderChecklist();
    showScreen('debrief');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openModal(modal) {
    modal.hidden = false;
    const closeButton = modal.querySelector('[data-close-modal]');
    if (closeButton) closeButton.focus();
  }

  function closeModal(modal) {
    modal.hidden = true;
  }

  function renderTranscript() {
    const list = document.getElementById('transcriptList');
    list.replaceChildren();
    if (!transcript.length) {
      const empty = document.createElement('p');
      empty.className = 'osce-transcript-empty';
      empty.textContent = 'Nenhuma mensagem foi enviada durante esta sessão.';
      list.appendChild(empty);
      return;
    }
    transcript.forEach((message) => {
      const entry = document.createElement('article');
      entry.className = `osce-transcript-entry ${message.role === 'doctor' ? 'is-doctor' : ''}`;
      const speaker = document.createElement('strong');
      speaker.textContent = message.role === 'doctor' ? 'Você · Médico' : 'João Martins · Paciente';
      const text = document.createElement('p');
      text.textContent = message.text;
      entry.append(speaker, text);
      list.appendChild(entry);
    });
  }

  document.getElementById('startButton').addEventListener('click', () => {
    sessionEnded = false;
    responseIndex = 0;
    transcript.length = 0;
    messageList.replaceChildren();
    chatInput.value = '';
    chatInput.disabled = false;
    sendButton.disabled = false;
    document.getElementById('finishButton').disabled = false;
    findings.vitals = false;
    findings.ecg = false;
    findings.chestXray = false;
    document.getElementById('vitalsEmpty').hidden = false;
    document.getElementById('vitalsResults').replaceChildren();
    document.getElementById('vitalsResults').hidden = true;
    document.getElementById('examsEmpty').hidden = false;
    document.getElementById('examResults').replaceChildren();
    document.getElementById('examCount').hidden = true;
    selectSupportTab('vitals');
    setMobilePanel('chat');
    showScreen('simulation');
    addMessage('patient', 'Olá, doutor. Estou com falta de ar desde ontem à noite.');
    startTimer();
    chatInput.focus();
  });

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text || sessionEnded) return;
    addMessage('doctor', text);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    processRequest(text);
    chatInput.focus();
  });

  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 100)}px`;
  });

  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });

  document.getElementById('finishButton').addEventListener('click', finishSession);
  document.getElementById('vitalsTab').addEventListener('click', () => selectSupportTab('vitals'));
  document.getElementById('examsTab').addEventListener('click', () => selectSupportTab('exams'));
  document.querySelectorAll('.osce-mobile-tab').forEach((tab) => {
    tab.addEventListener('click', () => setMobilePanel(tab.dataset.mobilePanel));
  });

  const scenarioModal = document.getElementById('scenarioModal');
  const transcriptModal = document.getElementById('transcriptModal');
  document.getElementById('scenarioButton').addEventListener('click', () => openModal(scenarioModal));
  document.getElementById('transcriptButton').addEventListener('click', () => {
    renderTranscript();
    openModal(transcriptModal);
  });

  [scenarioModal, transcriptModal].forEach((modal) => {
    modal.querySelectorAll('[data-close-modal]').forEach((button) => {
      button.addEventListener('click', () => closeModal(modal));
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      [scenarioModal, transcriptModal].forEach((modal) => {
        if (!modal.hidden) closeModal(modal);
      });
    }
  });

  document.getElementById('backToMenuButton').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    secondsRemaining = SESSION_SECONDS;
    updateTimer();
    sessionEnded = false;
    showScreen('briefing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
