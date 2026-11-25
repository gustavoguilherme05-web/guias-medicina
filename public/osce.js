(() => {
  const SESSION_SECONDS = 15 * 60;
  const cases = window.OSCE_CASES || [];
  const requestedCaseId = new URLSearchParams(window.location.search).get('caso');
  const activeCase = cases.find((item) => item.id === requestedCaseId);
  const screens = {
    catalog: document.getElementById('caseListScreen'),
    briefing: document.getElementById('briefingScreen'),
    simulation: document.getElementById('simulationScreen'),
    debrief: document.getElementById('debriefScreen')
  };
  const workspace = document.querySelector('.osce-workspace');
  const messageList = document.getElementById('messageList');
  const chatInput = document.getElementById('chatInput');
  const chatForm = document.getElementById('chatForm');
  const sendButton = document.getElementById('sendButton');
  const aiStatus = document.getElementById('aiStatus');
  const retryDebriefButton = document.getElementById('retryDebriefButton');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerContainer = document.getElementById('timerContainer');
  const transcript = [];
  let secondsRemaining = SESSION_SECONDS;
  let timerInterval = null;
  let sessionEnded = false;
  let waitingForPatient = false;
  let trialSessionToken = null;
  const findings = {
    vitals: false,
    physicalExam: false,
    ecg: false,
    chestXray: false,
    echo: false,
    labs: false,
    renalLabs: false,
    urinalysis: false,
    uacr: false,
    troponin: false,
    gasometry: false,
    hemogram: false,
    crp: false,
    liverLabs: false,
    paracentesis: false,
    venousDoppler: false
  };

  const vitalSignsByCase = {
    'icc-cronica-otimizacao': [
      { label: 'Pressão arterial', value: '120/80', unit: 'mmHg' },
      { label: 'Frequência cardíaca', value: '74', unit: 'bpm' },
      { label: 'Frequência respiratória', value: '14', unit: 'irpm' },
      { label: 'Saturação O₂', value: '97', unit: '% em ar ambiente' }
    ],
    'edema-doenca-renal-cronica': [
      { label: 'Pressão arterial', value: '158/96', unit: 'mmHg' },
      { label: 'Frequência cardíaca', value: '78', unit: 'bpm' },
      { label: 'Frequência respiratória', value: '18', unit: 'irpm' },
      { label: 'Saturação O₂', value: '96', unit: '% em ar ambiente' },
      { label: 'Peso atual', value: '84', unit: 'kg · +4 kg em 3 semanas' }
    ],
    'cirrose-hepatica-ascite': [
      { label: 'Pressão arterial', value: '150/90', unit: 'mmHg' },
      { label: 'Frequência cardíaca', value: '110', unit: 'bpm' },
      { label: 'Frequência respiratória', value: '24', unit: 'irpm' },
      { label: 'Saturação O₂', value: '98', unit: '% em ar ambiente' },
      { label: 'Temperatura', value: '36,5', unit: '°C' },
      { label: 'Peso', value: '110', unit: 'kg' }
    ],
    'erisipela-mid': [
      { label: 'Pressão arterial', value: '110/80', unit: 'mmHg' },
      { label: 'Frequência cardíaca', value: '88', unit: 'bpm' },
      { label: 'Frequência respiratória', value: '14', unit: 'irpm' },
      { label: 'Saturação O₂', value: '99', unit: '% em ar ambiente' },
      { label: 'Temperatura', value: '37,0', unit: '°C' }
    ]
  };

  const examinationResultsByCase = {
    'icc-cronica-otimizacao': {
      physicalExam: {
        title: 'Exame físico',
        summary: 'Bom estado geral, corado, hidratado, acianótico e anictérico. Extremidades quentes e bem perfundidas, TEC 2 segundos. Ritmo cardíaco regular em 2 tempos, bulhas normofonéticas, sem sopros ou B3. Sem turgência jugular. Murmúrio vesicular presente e simétrico, sem ruídos adventícios. Membros inferiores sem edema, panturrilhas livres e pulsos periféricos presentes e simétricos.'
      },
      echo: {
        title: 'Ecocardiograma transtorácico recente',
        summary: 'FEVE: 32%, compatível com disfunção sistólica importante do ventrículo esquerdo.'
      },
      labs: {
        title: 'Função renal e eletrólitos',
        summary: 'Exames laboratoriais básicos dentro da normalidade e estáveis nesta estação.'
      }
    },
    'edema-doenca-renal-cronica': {
      physicalExam: {
        title: 'Exame físico',
        summary: 'Bom estado geral, descorado (+/4+), acianótico e anictérico. Edema bipalpebral. Tireoide sem alterações à palpação. Ritmo cardíaco regular em 2 tempos, bulhas normofonéticas, sem sopros ou estase jugular a 45°. Murmúrio vesicular presente nos ápices e diminuído nas bases, com macicez à percussão nas bases bilateralmente e broncofonia diminuída. Abdômen globoso, indolor, ruídos hidroaéreos presentes e hepatimetria normal. Edema bilateral, simétrico, frio, indolor, pré-tibial e maleolar, cacifo 3+/4+ (Godet positivo); pulsos presentes e simétricos.'
      },
      renalLabs: {
        title: 'Bioquímica sérica',
        summary: 'Creatinina: 2,1 mg/dL · Ureia: 84 mg/dL · TFGe: 32 mL/min/1,73 m² · Potássio: 5,1 mEq/L · Sódio: 138 mEq/L · Glicemia de jejum: 162 mg/dL · HbA1c: 8,7%.'
      },
      urinalysis: {
        title: 'Urina tipo 1 (EAS)',
        summary: 'Aspecto ligeiramente turvo, densidade 1.015, pH 5,5, proteínas +++ (300 mg/dL), glicose ++, cetonas e sangue ausentes. 2 leucócitos e 1 hemácia por campo; sem nitrito ou cilindros patológicos.'
      },
      uacr: {
        title: 'Relação albumina/creatinina urinária (UACR)',
        summary: '450 mg/g (referência < 30 mg/g).'
      }
    },
    'cirrose-hepatica-ascite': {
      physicalExam: {
        title: 'Exame físico',
        summary: 'Regular estado geral, descorado 2+/4+, desidratado 1+/4+, acianótico e ictérico 2+/4+. Lúcido e orientado, com abertura ocular espontânea e obediência a comandos. Acantose nigricans em axilas e região inguinal, eritema palmar bilateral e ginecomastia. Sem linfonodos palpáveis; oroscopia sem lesões visíveis. Bulhas rítmicas em 2 tempos, sem sopros. Murmúrio vesicular bilateral, globalmente reduzido e sem ruídos adventícios. Abdômen distendido, ascite volumosa, indolor, piparote positivo, macicez móvel e semicírculo de Skoda positivos; sem massas ou visceromegalias, fígado palpável com bordas irregulares e romboides. Edema bilateral 1+/4+, dermatite ocre, sem empastamento, extremidades quentes e TEC < 3 segundos.'
      },
      liverLabs: {
        title: 'Albumina sérica e exames para avaliação hepática',
        status: 'RESULTADO PARCIAL',
        summary: 'Albumina sérica: 2,5 g/dL. Bilirrubina total, TP/INR e demais exames necessários ao Child-Pugh não têm resultados disponíveis nesta estação.'
      },
      paracentesis: {
        title: 'Paracentese diagnóstica e de alívio',
        summary: 'Volume retirado: 10 L. Celularidade: 80 células/mm³; neutrófilos: 60%; linfomononucleares: 40%; albumina do líquido ascítico: 1,3 g/dL.'
      }
    },
    'erisipela-mid': {
      physicalExam: {
        title: 'Exame físico',
        summary: 'Bom estado geral, corado, hidratado, acianótico e anictérico. Pupilas isocóricas e fotorreagentes, lúcido e orientado, força grau V globalmente. Sem outras lesões cutâneas visíveis ou linfonodos palpáveis. Orofaringe sem lesões. Bulhas rítmicas em 2 tempos, sem sopros; murmúrio vesicular bilateral, sem ruídos adventícios. Abdômen plano, flácido e indolor, sem massas ou visceromegalias. Edema 2+/4+, quente, eritematoso, elástico e bem delimitado na região medial do membro inferior direito; sem empastamento da panturrilha. Movimentação livre apesar da dor, membro contralateral sem edema ou empastamento, pulsos presentes e firmes, TEC < 3 segundos.'
      },
      venousDoppler: {
        title: 'Doppler venoso do membro inferior direito',
        summary: 'Ausência de TVP. Espessamento e aumento da ecogenicidade do tecido celular subcutâneo, com aumento da vascularização ao Doppler colorido, predominando na região de maior alteração cutânea; achados compatíveis com processo inflamatório/infeccioso de partes moles. Sem coleções líquidas organizadas ou abscessos nas áreas avaliadas.'
      }
    },
    'icc-aguda-perfil-b': {
      physicalExam: {
        title: 'Exame físico',
        summary: 'Paciente taquipneico, usando musculatura acessória e pálido, com extremidades quentes e bem perfundidas e TEC 2 segundos. Bulhas taquicárdicas, ritmo regular, B3 audível em ápice e turgência jugular patológica a 45°. Estertores crepitantes difusos até o terço médio dos dois hemitórax. Edema bilateral de membros inferiores 2+/4+, cacifo positivo, frio e indolor.'
      },
      ecg: {
        title: 'Eletrocardiograma',
        available: false,
        summary: 'Solicitado. Esta estação não fornece o resultado.'
      },
      troponin: {
        title: 'Troponina',
        available: false,
        summary: 'Solicitada. Esta estação não fornece o resultado.'
      },
      chestXray: {
        title: 'Radiografia de tórax',
        available: false,
        summary: 'Solicitada. Esta estação não fornece o resultado.'
      },
      gasometry: {
        title: 'Gasometria arterial',
        available: false,
        summary: 'Solicitada. Esta estação não fornece o resultado.'
      },
      hemogram: {
        title: 'Hemograma',
        available: false,
        summary: 'Solicitado. Esta estação não fornece o resultado.'
      },
      crp: {
        title: 'Proteína C-reativa (PCR)',
        available: false,
        summary: 'Solicitada. Esta estação não fornece o resultado.'
      },
      labs: {
        title: 'Função renal e eletrólitos',
        available: false,
        summary: 'Solicitados. Esta estação não fornece o resultado.'
      }
    }
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([screen, element]) => {
      if (screen === 'catalog') {
        element.hidden = name !== 'catalog';
      } else {
        element.hidden = screen !== name;
      }
    });
  }

  function renderCaseCatalog() {
    const list = document.getElementById('osceCaseList');
    cases.forEach((item) => {
      const card = document.createElement('a');
      card.className = 'osce-case-card';
      card.href = `osce.html?caso=${encodeURIComponent(item.id)}`;

      const eyebrow = document.createElement('span');
      eyebrow.className = 'osce-eyebrow';
      eyebrow.textContent = `${item.station} · ${item.specialty}`;
      const title = document.createElement('strong');
      title.textContent = item.title;
      const summary = document.createElement('p');
      summary.textContent = item.summary;
      const detail = document.createElement('span');
      detail.className = 'osce-case-card-action';
      detail.textContent = 'Conhecer caso →';
      card.append(eyebrow, title, summary, detail);
      list.appendChild(card);
    });
  }

  function setCaseContent() {
    const stationLabel = `${activeCase.station} · ${activeCase.specialty}`;
    document.getElementById('briefingEyebrow').textContent = stationLabel;
    document.getElementById('briefingTitle').textContent = activeCase.title;
    document.getElementById('briefingPatient').textContent = `${activeCase.patientName} · ${activeCase.age} anos`;
    document.getElementById('briefingScenario').textContent = activeCase.scenario;
    document.getElementById('briefingSetting').textContent = activeCase.setting;
    const name = document.getElementById('sessionPatientName');
    name.replaceChildren();
    name.append(document.createTextNode(activeCase.patientName));
    const age = document.createElement('span');
    age.textContent = ` · ${activeCase.age} anos`;
    name.appendChild(age);
    document.querySelector('.osce-avatar-patient').textContent = activeCase.initials;
    document.getElementById('scenarioEyebrow').textContent = stationLabel;
    document.getElementById('scenarioModalText').textContent = activeCase.scenario;
    document.getElementById('scenarioModalSetting').textContent = activeCase.setting;
    document.getElementById('transcriptEyebrow').textContent = stationLabel;
    document.getElementById('reportCaseCaption').textContent =
      `${activeCase.station} · ${activeCase.specialty} · ${activeCase.patientName}, ${activeCase.age} anos`;
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
    avatar.textContent = role === 'doctor' ? 'DR' : activeCase.initials;

    const body = document.createElement('div');
    body.className = 'osce-message-body';
    const name = document.createElement('span');
    name.className = 'osce-message-name';
    name.textContent = role === 'doctor' ? 'Você · Médico' : `${activeCase.patientName} · Paciente`;
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
    (vitalSignsByCase[activeCase.id] || []).forEach((vital) => {
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
  }

  function showExam(examKey) {
    if (findings[examKey]) return;
    const result = examinationResultsByCase[activeCase.id]?.[examKey];
    if (!result) return;
    findings[examKey] = true;
    document.getElementById('examsEmpty').hidden = true;
    const card = document.createElement('article');
    card.className = 'osce-exam-card';
    const status = document.createElement('span');
    status.textContent = result.status ||
      (result.available === false ? 'SEM RESULTADO NESTA ESTAÇÃO' : 'RESULTADO DISPONÍVEL');
    const title = document.createElement('strong');
    title.textContent = result.title;
    const summary = document.createElement('p');
    summary.textContent = result.summary;
    card.append(status, title, summary);
    document.getElementById('examResults').appendChild(card);
    const examCount = document.getElementById('examCount');
    const total = Object.entries(findings)
      .filter(([key]) => key !== 'vitals')
      .reduce((count, [, requested]) => count + Number(requested), 0);
    examCount.textContent = String(total);
    examCount.hidden = false;
    selectSupportTab('exams');
  }

  function processRequest(text) {
    const normalized = normalizedText(text);
    const requestsVitals = /sinais vitais|verificar.*(sinais|vital|pressao|saturacao)|aferir.*(pressao|sinais)|pressao arterial|frequencia cardiaca|saturacao|temperatura|pulso|peso|ganho de peso/.test(normalized);
    const requestsPhysicalExam = /exame fisico|examinar|ausculta|auscultar|palpar|palpacao|turgencia jugular|jugular|cacifo|godet|tireoide|ascite|figado|exame das pernas|avaliar edema/.test(normalized);
    const requestsEcg = /\becg\b|eletrocardiograma/.test(normalized);
    const requestsXray = /raio.?x|radiografia|rx de torax/.test(normalized);
    const requestsTroponin = /troponina/.test(normalized);
    const requestsGasometry = /gasometria|gasometria arterial/.test(normalized);
    const requestsHemogram = /hemograma/.test(normalized);
    const requestsCrp = /\bpcr\b|proteina c reativa/.test(normalized);
    const requestsEcho = /ecocardiograma|ecocardiografia|eco cardiograma/.test(normalized);
    const requestsVenousDoppler = /doppler|ultrassom.*(venoso|perna)|ultrassonografia.*(venosa|perna)/.test(normalized);
    const requestsLabs = /funcao renal|creatinina|eletr[oó]litos|potassio|exames laboratoriais|laboratorio/.test(normalized);
    const requestsLiverLabs = /child.?pugh|funcao hepatica|hepatograma|bilirrubina|albumina serica|albumina no sangue|inr|rni|protrombina|coagulograma|transaminases/.test(normalized);
    const requestsParacentesis = /paracentese|puncao.*ascite|drenagem.*ascite/.test(normalized);
    const requestsGeneralLabs = /exames laboratoriais|exames de triagem renal|triagem renal/.test(normalized);
    const requestsRenalLabs = /funcao renal|creatinina|ureia|tfge|taxa de filtracao|potassio|sodio|glicemia|glicose|hba1c|hemoglobina glicada/.test(normalized);
    const requestsUrinalysis = /\beas\b|urina tipo ?1|urinalise|sedimentoscopia/.test(normalized);
    const requestsUacr = /uacr|albumina\/creatinina|relacao albumina|albuminuria|proteinuria/.test(normalized);
    const vitalsAlreadyAvailable = findings.vitals;

    if (requestsVitals && !findings.vitals) showVitals();
    if (requestsPhysicalExam && !findings.physicalExam) showExam('physicalExam');
    if (requestsEcg && !findings.ecg) {
      showExam('ecg');
    }
    if (requestsXray && !findings.chestXray) {
      showExam('chestXray');
    }
    if (requestsTroponin && !findings.troponin) showExam('troponin');
    if (requestsGasometry && !findings.gasometry) showExam('gasometry');
    if (requestsHemogram && !findings.hemogram) showExam('hemogram');
    if (requestsCrp && !findings.crp) showExam('crp');
    if (requestsEcho && !findings.echo) showExam('echo');
    if (activeCase.id === 'edema-doenca-renal-cronica') {
      if ((requestsGeneralLabs || requestsRenalLabs) && !findings.renalLabs) showExam('renalLabs');
      if ((requestsGeneralLabs || requestsUrinalysis) && !findings.urinalysis) showExam('urinalysis');
      if ((requestsGeneralLabs || requestsUacr) && !findings.uacr) showExam('uacr');
    } else if (activeCase.id === 'cirrose-hepatica-ascite') {
      if ((requestsLabs || requestsLiverLabs) && !findings.liverLabs) showExam('liverLabs');
      if (requestsParacentesis && !findings.paracentesis) showExam('paracentesis');
    } else if (activeCase.id === 'erisipela-mid') {
      if (requestsVenousDoppler && !findings.venousDoppler) showExam('venousDoppler');
    } else if (requestsLabs && !findings.labs) {
      showExam('labs');
    }
    if (requestsVitals && vitalsAlreadyAvailable) selectSupportTab('vitals');
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

  const checklistCriteria = activeCase?.checklist || [];

  function conversationMessages() {
    return transcript.map((message) => ({
      role: message.role === 'doctor' ? 'user' : 'assistant',
      content: message.text
    }));
  }

  async function requestAi(mode, messages) {
    const response = await fetch('/api/osce-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, messages, trialSessionToken, caseId: activeCase.id })
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('O serviço de IA retornou uma resposta inválida.');
    }
    if (!response.ok) throw new Error(data.error || data.message || 'Não foi possível obter uma resposta da IA.');
    if (typeof data.content !== 'string' || !data.content.trim()) {
      throw new Error('A IA retornou uma resposta vazia.');
    }
    return data.content.trim();
  }

  function parseDebrief(content) {
    const cleanedContent = content.replace(/```(?:json)?/gi, '').trim();
    const firstBrace = cleanedContent.indexOf('{');
    const lastBrace = cleanedContent.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('A resposta do preceptor não contém um JSON válido.');
    }

    let result;
    try {
      result = JSON.parse(cleanedContent.slice(firstBrace, lastBrace + 1));
    } catch {
      throw new Error('Não foi possível interpretar o JSON do preceptor.');
    }

    const score = result?.finalScore;
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 10) {
      throw new Error('A resposta do preceptor contém uma nota inválida.');
    }
    if (!Array.isArray(result.checklist) || result.checklist.length !== checklistCriteria.length) {
      throw new Error('A resposta do preceptor contém um checklist inválido.');
    }
    const completedById = new Map();
    result.checklist.forEach((item) => {
      if (!checklistCriteria.some((criterion) => criterion.id === item?.id) ||
          typeof item.completed !== 'boolean' ||
          completedById.has(item.id)) {
        throw new Error('A resposta do preceptor contém itens de checklist inválidos.');
      }
      completedById.set(item.id, item.completed);
    });
    if (completedById.size !== checklistCriteria.length || typeof result.comment !== 'string' || !result.comment.trim()) {
      throw new Error('A resposta do preceptor está incompleta.');
    }

    return {
      score,
      checklist: checklistCriteria.map((criterion) => ({
        ...criterion,
        met: completedById.get(criterion.id)
      })),
      comment: result.comment.trim()
    };
  }

  function renderChecklist(result) {
    const passed = result.checklist.filter((criterion) => criterion.met).length;
    document.getElementById('scoreValue').textContent = String(result.score).replace('.', ',');
    document.getElementById('checklistTotal').textContent = `${passed} de ${result.checklist.length}`;
    const list = document.getElementById('checklist');
    list.replaceChildren();

    result.checklist.forEach((criterion) => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = criterion.label;
      const status = document.createElement('span');
      status.className = `osce-check-status ${criterion.met ? 'is-met' : 'is-missing'}`;
      status.textContent = criterion.met ? '✓ Realizado' : '○ Não identificado';
      item.append(label, status);
      list.appendChild(item);
    });

    document.getElementById('feedbackText').textContent = result.comment;
  }

  async function evaluateDebrief() {
    retryDebriefButton.hidden = true;
    document.getElementById('scoreValue').textContent = '…';
    document.getElementById('checklistTotal').textContent = 'Avaliando';
    document.getElementById('checklist').replaceChildren();
    document.getElementById('feedbackText').textContent = 'O preceptor está avaliando a conversa…';
    try {
      const content = await requestAi('debrief', conversationMessages());
      renderChecklist(parseDebrief(content));
    } catch (error) {
      document.getElementById('scoreValue').textContent = '—';
      document.getElementById('checklistTotal').textContent = 'Indisponível';
      document.getElementById('feedbackText').textContent = `Não foi possível gerar a avaliação: ${error.message}`;
      retryDebriefButton.hidden = false;
    }
  }

  function finishSession() {
    if (sessionEnded) return;
    sessionEnded = true;
    clearInterval(timerInterval);
    timerInterval = null;
    chatInput.disabled = true;
    sendButton.disabled = true;
    document.getElementById('finishButton').disabled = true;
    showScreen('debrief');
    evaluateDebrief();
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
      speaker.textContent = message.role === 'doctor' ? 'Você · Médico' : `${activeCase.patientName} · Paciente`;
      const text = document.createElement('p');
      text.textContent = message.text;
      entry.append(speaker, text);
      list.appendChild(entry);
    });
  }

  document.getElementById('startButton').addEventListener('click', async () => {
    sessionEnded = false;
    waitingForPatient = false;
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    trialSessionToken = Array.from(tokenBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    transcript.length = 0;
    messageList.replaceChildren();
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;
    aiStatus.textContent = 'Conectando ao paciente…';
    aiStatus.hidden = false;
    document.getElementById('finishButton').disabled = false;
    Object.keys(findings).forEach((key) => {
      findings[key] = false;
    });
    document.getElementById('vitalsEmpty').hidden = false;
    document.getElementById('vitalsResults').replaceChildren();
    document.getElementById('vitalsResults').hidden = true;
    document.getElementById('examsEmpty').hidden = false;
    document.getElementById('examResults').replaceChildren();
    document.getElementById('examCount').hidden = true;
    document.querySelectorAll('.osce-notes-fields textarea').forEach((field) => {
      field.value = '';
    });
    selectSupportTab('vitals');
    setMobilePanel('chat');
    showScreen('simulation');
    startTimer();
    try {
      const greeting = await requestAi('patient', conversationMessages());
      if (!sessionEnded) {
        addMessage('patient', greeting);
        aiStatus.hidden = true;
      }
    } catch (error) {
      if (!sessionEnded) {
        aiStatus.textContent = `Não foi possível iniciar a conversa: ${error.message}`;
      }
    } finally {
      if (!sessionEnded) {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
      }
    }
  });

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text || sessionEnded || waitingForPatient) return;
    addMessage('doctor', text);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    processRequest(text);
    waitingForPatient = true;
    chatInput.disabled = true;
    sendButton.disabled = true;
    aiStatus.hidden = true;
    try {
      const reply = await requestAi('patient', conversationMessages());
      if (!sessionEnded) addMessage('patient', reply);
    } catch (error) {
      aiStatus.textContent = `Não foi possível obter resposta do paciente: ${error.message}`;
      aiStatus.hidden = false;
    } finally {
      waitingForPatient = false;
      if (!sessionEnded) {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
      }
    }
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
  retryDebriefButton.addEventListener('click', evaluateDebrief);
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
    showScreen('catalog');
    window.history.replaceState({}, '', 'osce.html');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('backToCasesButton').addEventListener('click', () => {
    window.location.href = 'osce.html';
  });

  renderCaseCatalog();
  if (activeCase) {
    setCaseContent();
    showScreen('briefing');
  } else {
    showScreen('catalog');
  }

})();
