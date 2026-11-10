const CASOS_CLINICOS = [
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
        titulo: 'Objetivo da prescrição',
        texto: 'Propor tratamento de primeira linha para provável faringoamigdalite estreptocócica (ex.: amoxicilina), além de analgesia e antitérmico.'
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
        titulo: 'Objetivo da prescrição',
        texto: 'Iniciar monoterapia anti-hipertensiva em dose inicial apropriada (ex.: enalapril, losartana ou hidroclorotiazida) e orientar medidas não farmacológicas.'
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
        titulo: 'Objetivo da prescrição',
        texto: 'Prescrever broncodilatador inalatório de resgate (ex.: salbutamol), orientar a retomada do tratamento de manutenção e indicar sinais de alarme.'
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
        titulo: 'Objetivo da prescrição',
        texto: 'Prescrever sais de reidratação oral, considerar sintomáticos com segurança e orientar dieta, hidratação e sinais de alarme. Evitar antibiótico empírico.'
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
        titulo: 'Objetivo da prescrição',
        texto: 'Prescrever opção antimicrobiana indicada para cistite aguda não complicada (ex.: nitrofurantoína, fosfomicina ou sulfametoxazol-trimetoprima) e analgesia urinária, se necessária.'
      }
    ]
  },
  {
    id: 'itu-nao-complicada',
    titulo: 'Disúria em mulher jovem',
    secoes: [
      {
        titulo: 'Identificação',
        texto: 'Paciente do sexo feminino, 26 anos, hígida.'
      },
      {
        titulo: 'Queixa principal',
        texto: '“Dor e ardor para urinar há 2 dias.”'
      },
      {
        titulo: 'História da moléstia atual',
        texto: 'Paciente refere início progressivo de disúria, polaciúria (aumento da frequência urinária) e urgência miccional há 48 horas. Relata sensação de esvaziamento incompleto da bexiga e desconforto suprapúbico leve. Nega febre, calafrios, dor lombar, náuseas ou dor nos flancos. Nega corrimento vaginal ou prurido vulvar.'
      },
      {
        titulo: 'Exame físico',
        itens: [
          'Sinais vitais: PA 110x70 mmHg | FC 76 bpm | FR 14 irpm | Temperatura axilar 36,5 °C | SatO₂ 98% em ar ambiente.',
          'Geral: bom estado geral, corada, hidratada e anictérica.',
          'Abdômen: plano, flácido, indolor à palpação profunda em andar superior. Discreta dor à palpação profunda em região suprapúbica. Sem sinais de peritonismo.',
          'Sinal de Giordano (punho-percussão lombar): negativo bilateralmente.'
        ]
      }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('prescricaoForm');
  if (!form) return;

  const caseSelect = document.getElementById('casoSelecionado');
  const caseDetails = document.getElementById('casoClinicoDetalhes');
  const submitButton = document.getElementById('analisarPrescricao');
  const result = document.getElementById('prescricaoResult');
  const status = document.getElementById('prescricaoStatus');
  const analysis = document.getElementById('prescricaoAnalysis');

  CASOS_CLINICOS.forEach((caso) => {
    const option = document.createElement('option');
    option.value = caso.id;
    option.textContent = caso.titulo;
    caseSelect.appendChild(option);
  });

  function renderizarCaso(caso) {
    caseDetails.replaceChildren();
    caso.secoes.forEach((secao) => {
      const bloco = document.createElement('section');
      const titulo = document.createElement('h3');
      titulo.textContent = secao.titulo;
      bloco.appendChild(titulo);

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

      caseDetails.appendChild(bloco);
    });
  }

  function obterCasoSelecionado() {
    return CASOS_CLINICOS.find((caso) => caso.id === caseSelect.value);
  }

  caseSelect.addEventListener('change', () => {
    const caso = obterCasoSelecionado();
    if (caso) renderizarCaso(caso);
    result.hidden = true;
  });
  renderizarCaso(obterCasoSelecionado());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const caso = obterCasoSelecionado();
    if (!caso) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Analisando...';
    result.hidden = false;
    result.classList.remove('has-error');
    status.textContent = 'A análise pode levar alguns instantes.';
    analysis.textContent = '';

    try {
      const response = await fetch('/api/prescricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casoId: caso.id,
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
        throw new Error(data?.error || 'Não foi possível analisar a prescrição. Tente novamente.');
      }
      if (typeof data?.analise !== 'string' || !data.analise.trim()) {
        throw new Error('A API não retornou uma análise válida. Tente novamente.');
      }

      status.textContent = 'Análise concluída.';
      analysis.textContent = data.analise;
    } catch (error) {
      result.classList.add('has-error');
      status.textContent = error instanceof TypeError
        ? 'Não foi possível conectar à API. Verifique a conexão e tente novamente.'
        : error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Analisar prescrição';
    }
  });
});
