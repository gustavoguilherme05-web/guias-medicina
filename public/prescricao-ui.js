const CASOS_LEGACY = [
  {
    id: 'amigdalite-bacteriana-aguda',
    titulo: 'Amigdalite bacteriana aguda',
    secoes: [
      {
        titulo: 'Identificação e história',
        texto: 'Paciente de 19 anos, sexo feminino, com dor de garganta intensa há 2 dias, febre (38,8 °C) e odinofagia. Nega alergias conhecidas.'
      },
      {
        titulo: 'Exame físico',
        itens: [
          'Oroscopia: hiperemia acentuada de orofaringe com exsudato purulento folicular em ambas as amígdalas.',
          'Linfonodos submandibulares aumentados e dolorosos bilateralmente.',
          'Ausculta cardiopulmonar sem alterações.'
        ]
      },
      {
        titulo: 'Recado',
        texto: 'A receita deve incluir via de administração, droga, dose e recado para o paciente.'
      }
    ]
  },
  {
    id: 'hipertensao-inicio-tratamento',
    titulo: 'Hipertensão arterial — início de tratamento',
    secoes: [
      {
        titulo: 'Identificação e história',
        texto: 'Paciente de 52 anos, sexo masculino, assintomático, sem comorbidades prévias ou lesões de órgão-alvo. Traz diário de pressão arterial de 2 semanas com médias de 148/92 mmHg.'
      },
      {
        titulo: 'Exame físico e exames',
        itens: [
          'PA em consulta: 150/94 mmHg, confirmada em ambos os braços.',
          'IMC: 28 kg/m².',
          'Função renal e eletrólitos normais; ECG sem sinais de hipertrofia ventricular esquerda.'
        ]
      },
      {
        titulo: 'Recado',
        texto: 'A receita deve incluir via de administração, droga, dose e recado para o paciente.'
      }
    ]
  },
  {
    id: 'exacerbacao-leve-asma',
    titulo: 'Exacerbação leve de asma',
    secoes: [
      {
        titulo: 'Identificação e história',
        texto: 'Paciente de 24 anos, sexo feminino, com asma conhecida, relata piora da falta de ar e chiado após exposição a mofo no final de semana. Usava corticoide inalatório de manutenção, mas interrompeu o uso no último mês.'
      },
      {
        titulo: 'Exame físico',
        itens: [
          'SpO₂ em ar ambiente: 96%; FC: 92 bpm; FR: 22 irpm.',
          'Murmúrio vesicular presente com sibilos expiratórios difusos.',
          'Sem tiragem intercostal ou uso de musculatura acessória.'
        ]
      },
      {
        titulo: 'Recado',
        texto: 'A receita deve incluir via de administração, droga, dose e recado para o paciente.'
      }
    ]
  },
  {
    id: 'gastroenterite-desidratacao-leve',
    titulo: 'Gastroenterite aguda com desidratação leve',
    secoes: [
      {
        titulo: 'Identificação e história',
        texto: 'Paciente de 30 anos, sexo masculino, com 5 episódios de diarreia aquosa e 2 episódios de vômito nas últimas 24 horas. Relata sede aumentada e cansaço.'
      },
      {
        titulo: 'Exame físico',
        itens: [
          'Mucosas levemente secas, turgor cutâneo preservado.',
          'PA: 110/70 mmHg; FC: 88 bpm.',
          'Abdômen ruidoso, doloroso difusamente à palpação profunda, sem sinais de peritonite.'
        ]
      },
      {
        titulo: 'Recado',
        texto: 'A receita deve incluir via de administração, droga, dose e recado para o paciente.'
      }
    ]
  },
  {
    id: 'cistite-nao-complicada-28',
    titulo: 'Cistite aguda não complicada',
    secoes: [
      {
        titulo: 'Identificação e história',
        texto: 'Paciente de 28 anos, sexo feminino, com disúria, polaciúria, urgência miccional e desconforto suprapúbico há 3 dias. Sem febre, dor lombar ou corrimento vaginal.'
      },
      {
        titulo: 'Exame físico',
        itens: [
          'Sinais vitais normais; temperatura: 36,5 °C.',
          'Dor leve à palpação em região hipogástrica.',
          'Sinal de Giordano negativo.'
        ]
      },
      {
        titulo: 'Recado',
        texto: 'A receita deve incluir via de administração, droga, dose e recado para o paciente.'
      }
    ]
  },
];
const CASOS_CLINICOS = [...window.PRESCRIPTION_CASES, ...CASOS_LEGACY];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('prescricaoForm');
  if (!form) return;

  const listView = document.getElementById('listaCasosView');
  const resolutionView = document.getElementById('resolucaoCasoView');
  const caseList = document.getElementById('casosClinicosLista');
  const caseDetails = document.getElementById('casoClinicoCompleto');
  const submitButton = document.getElementById('analisarPrescricao');
  const result = document.getElementById('prescricaoResult');
  const status = document.getElementById('prescricaoStatus');
  const analysis = document.getElementById('prescricaoAnalysis');
  const upgrade = document.getElementById('prescricaoUpgrade');

  function getContexto(caso) {
    const secao = caso.secoes.find((item) => item.titulo.toLowerCase() === 'contexto');
    return secao?.texto || caso.contexto || 'Atendimento ambulatorial';
  }

  function getHistoria(caso) {
    const historia = caso.secoes.find((item) => item.titulo.toLowerCase() === 'história') ||
      caso.secoes.find((item) => item.titulo.toLowerCase().startsWith('história')) ||
      caso.secoes.find((item) => item.titulo.toLowerCase().includes('história')) ||
      caso.secoes.find((item) => item.titulo.toLowerCase().includes('identificação'));
    return historia?.texto || historia?.itens?.join(' ') || '';
  }

  function renderizarPrevia(caso) {
    const card = document.createElement('a');
    card.className = 'caso-preview-card';
    card.href = `prescricao.html?caso=${encodeURIComponent(caso.id)}`;

    const contexto = document.createElement('span');
    contexto.className = 'caso-preview-contexto';
    contexto.textContent = getContexto(caso);
    const titulo = document.createElement('span');
    titulo.className = 'caso-preview-titulo';
    titulo.textContent = caso.titulo;
    const historia = document.createElement('span');
    historia.className = 'caso-preview-historia';
    historia.textContent = getHistoria(caso);
    const acao = document.createElement('span');
    acao.className = 'caso-preview-acao';
    acao.textContent = 'Resolver Caso';

    card.append(contexto, titulo, historia, acao);
    caseList.appendChild(card);
  }

  function renderizarCasoCompleto(caso) {
    const article = document.createElement('article');
    article.className = 'caso-completo';
    const header = document.createElement('header');
    const contexto = document.createElement('span');
    contexto.className = 'caso-completo-contexto';
    contexto.textContent = getContexto(caso);
    const titulo = document.createElement('h2');
    titulo.textContent = caso.titulo;
    header.append(contexto, titulo);
    article.appendChild(header);

    caso.secoes
      .filter((secao) => secao.titulo.toLowerCase() !== 'contexto')
      .forEach((secao) => {
        const bloco = document.createElement('section');
        bloco.className = 'caso-completo-secao';
        const subtitulo = document.createElement('h3');
        subtitulo.textContent = secao.titulo;
        bloco.appendChild(subtitulo);

        if (secao.texto) {
          const texto = document.createElement('p');
          texto.textContent = secao.texto;
          bloco.appendChild(texto);
        }

        if (secao.itens) {
          const lista = document.createElement('ul');
          secao.itens.forEach((item) => {
            const linha = document.createElement('li');
            linha.textContent = item;
            lista.appendChild(linha);
          });
          bloco.appendChild(lista);
        }

        article.appendChild(bloco);
      });

    caseDetails.replaceChildren(article);
  }

  CASOS_CLINICOS.forEach(renderizarPrevia);

  const requestedCaseId = new URLSearchParams(window.location.search).get('caso');
  if (!requestedCaseId) return;

  listView.hidden = true;
  resolutionView.hidden = false;
  const casoSelecionado = CASOS_CLINICOS.find((caso) => caso.id === requestedCaseId);
  if (!casoSelecionado) {
    caseDetails.textContent = 'Caso não encontrado. Volte para a lista e escolha outro caso.';
    form.hidden = true;
    return;
  }

  renderizarCasoCompleto(casoSelecionado);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Analisando...';
    result.hidden = false;
    result.classList.remove('has-error');
    status.textContent = 'A análise pode levar alguns instantes.';
    analysis.textContent = '';
    upgrade.hidden = true;
    let requiresUpgrade = false;

    try {
      const response = await fetch('/api/prescricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casoId: casoSelecionado.id,
          prescricaoAluno: form.elements.prescricaoAluno.value.trim()
        })
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('A API retornou uma resposta inválida. Verifique a configuração e tente novamente.');
      }

      if (!response.ok) {
        requiresUpgrade = data?.requiresUpgrade === true;
        throw new Error(data?.error || data?.message || 'Não foi possível analisar a prescrição. Tente novamente.');
      }
      if (typeof data?.analise !== 'string' || !data.analise.trim()) {
        throw new Error('A API não retornou uma análise válida. Tente novamente.');
      }

      status.textContent = 'Análise concluída.';
      analysis.textContent = data.analise;
    } catch (error) {
      result.classList.add('has-error');
      upgrade.hidden = !requiresUpgrade;
      status.textContent = error instanceof TypeError
        ? 'Não foi possível conectar à API. Verifique a conexão e tente novamente.'
        : error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Analisar prescrição';
    }
  });
});
