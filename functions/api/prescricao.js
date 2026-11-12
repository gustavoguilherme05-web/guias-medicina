const RUBRICAS_POR_CASO = {
  'amigdalite-bacteriana-aguda': {
    caso: 'Faringoamigdalite aguda provável por estreptococo do grupo A em mulher de 19 anos, com febre, exsudato tonsilar e linfonodos cervicais dolorosos. Sem alergias conhecidas.',
    diretriz: `- Avalie a probabilidade de infecção estreptocócica e a necessidade de teste rápido/cultura conforme disponibilidade, protocolo local e critérios clínicos; não presuma que todo exsudato exige antibiótico.
- Se houver indicação de tratar provável infecção estreptocócica: amoxicilina 500 mg VO a cada 12 horas por 10 dias (ou esquema equivalente recomendado localmente).
- Analgesia/antitérmico: paracetamol ou dipirona em dose apropriada; considerar ibuprofeno se não houver contraindicação.
- Oriente hidratação, medidas de conforto e retorno se piora, dificuldade respiratória/deglutição importante, desidratação ou persistência da febre/sintomas.`
  },
  'hipertensao-inicio-tratamento': {
    caso: 'Homem de 52 anos, assintomático, sem comorbidades ou lesão de órgão-alvo, com média domiciliar de 148/92 mmHg por duas semanas e PA de consultório de 150/94 mmHg. Função renal e eletrólitos normais.',
    diretriz: `- Considere hipertensão estágio 1 e início de monoterapia associado a mudanças de estilo de vida.
- Opções iniciais: enalapril (por exemplo, 5 mg VO 1 vez ao dia), losartana (50 mg VO 1 vez ao dia) ou hidroclorotiazida (12,5 mg VO 1 vez ao dia), ajustando conforme diretriz local e perfil do paciente. Prescrever apenas uma opção.
- Para IECA/BRA, avaliar creatinina e potássio após início/ajuste; para tiazídico, monitorar eletrólitos e efeitos metabólicos. Reavaliar pressão, tolerabilidade e adesão em algumas semanas.
- Oriente redução de sal, atividade física, controle de peso, moderação de álcool e seguimento; não indicar combinação inicial automaticamente neste caso.`
  },
  'exacerbacao-leve-asma': {
    caso: 'Mulher de 24 anos com asma, sintomas leves de exacerbação após exposição a mofo, interrompeu o corticoide inalatório no último mês. SpO₂ 96%, FC 92 bpm, FR 22 irpm, sibilos expiratórios difusos, sem sinais de esforço respiratório.',
    diretriz: `- Avalie gravidade e resposta clínica; salbutamol inalatório 100 mcg, 2 a 4 jatos com espaçador como resgate, repetindo conforme resposta e plano de ação. Falha de resposta ou piora exige avaliação urgente.
- Oriente retomada imediata do corticoide inalatório de manutenção previamente prescrito e adesão contínua; confira técnica inalatória e plano de ação. Considere estratégia com corticoide-formoterol conforme o tratamento já indicado e protocolo vigente.
- Não recomendar SABA como único tratamento de manutenção. Oriente evitar o gatilho e procurar urgência se dispneia importante, dificuldade para falar, cianose, sonolência ou piora/saturação baixa.`
  },
  'gastroenterite-desidratacao-leve': {
    caso: 'Homem de 30 anos com cinco episódios de diarreia aquosa e dois de vômito em 24 horas, sede e cansaço. Mucosas levemente secas, turgor preservado, PA 110/70 mmHg, FC 88 bpm, sem peritonismo.',
    diretriz: `- Priorize solução de reidratação oral em pequenos volumes frequentes e reposição das perdas após evacuações; reavalie hidratação e tolerância oral.
- Antiemético, como ondansetrona, pode ser considerado por curto período se o vômito impedir hidratação, após avaliar contraindicações e risco de prolongamento do QT. Antiespasmódico não é de uso rotineiro; se considerado para cólica, avaliar contraindicações e não mascarar sinais de alarme.
- Oriente alimentação conforme tolerância, higiene das mãos e retorno se incapacidade de ingerir líquidos, redução importante da diurese, sangue nas fezes, febre alta, dor intensa/localizada ou sinais de desidratação. Não prescrever antibiótico empírico neste quadro sem indicação específica.`
  },
  'cistite-nao-complicada-28': {
    caso: 'Mulher de 28 anos com disúria, polaciúria, urgência e desconforto suprapúbico há três dias. Afebril, sem dor lombar ou corrimento vaginal, Giordano negativo.',
    diretriz: `- Opções para cistite não complicada incluem nitrofurantoína 100 mg VO a cada 6 horas por 5 dias (ou formulação de liberação modificada a cada 12 horas, conforme apresentação/protocolo), fosfomicina 3 g VO em dose única ou sulfametoxazol-trimetoprima 800/160 mg VO a cada 12 horas por 3 dias quando apropriado e a resistência local permitir.
- Verifique possibilidade de gestação, função renal, alergias, interações e fatores de complicação antes de escolher o antibiótico; evite quinolonas como primeira linha. Urocultura é indicada em situações selecionadas, não necessariamente em cistite típica não complicada.
- Fenazopiridina 100–200 mg VO a cada 8 horas por no máximo 2 dias pode ser considerada para disúria, observando contraindicações; analgésico simples é alternativa. Oriente hidratação conforme sede e retorno se febre, dor lombar, vômitos ou piora.`
  },
  'itu-nao-complicada': {
    caso: 'Cistite aguda não complicada em mulher hígida de 26 anos, com disúria, polaciúria e urgência há dois dias. Sem febre, dor lombar, Giordano negativo ou sintomas vaginais.',
    diretriz: `- Opções de primeira linha: nitrofurantoína 100 mg VO a cada 6 horas por 5 dias (ou formulação de liberação modificada a cada 12 horas, conforme apresentação), fosfomicina 3 g VO em dose única ou sulfametoxazol-trimetoprima 800/160 mg VO a cada 12 horas por 3 dias quando apropriado e a resistência local permitir.
- Evite fluoroquinolonas como primeira linha e tratamentos prolongados sem indicação. Considere fatores de complicação, alergias e contraindicações.
- Fenazopiridina 100–200 mg VO a cada 8 horas por no máximo 2 dias ou analgésico simples podem ser usados para alívio. Oriente hidratação conforme sede e sinais de alarme, como febre, dor lombar ou piora.`
  }
};

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corpo da requisição inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const prescricaoAluno = typeof body?.prescricaoAluno === "string"
    ? body.prescricaoAluno.trim()
    : "";
  const casoId = typeof body?.casoId === "string" ? body.casoId : "";
  const caso = Object.prototype.hasOwnProperty.call(RUBRICAS_POR_CASO, casoId)
    ? RUBRICAS_POR_CASO[casoId]
    : null;
  if (!caso) {
    return new Response(JSON.stringify({ error: "Selecione um caso clínico válido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!prescricaoAluno) {
    return new Response(JSON.stringify({ error: "Informe a prescrição para análise." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const baseUrl = context.env?.BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
  const apiKey = context.env?.API_KEY;
  const model = context.env?.MODEL || "gemini-3.8-flash";
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API_KEY não está configurada como segredo no ambiente do Cloudflare Pages." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const systemPrompt = `
Você é um preceptor médico sênior avaliando a prescrição de um interno de medicina.

CASO CLÍNICO:
${caso.caso}

PRESCRIÇÃO DO ALUNO:
${prescricaoAluno}

DIRETRIZES DE REFERÊNCIA:
${caso.diretriz}

SUA TAREFA:
Analise a prescrição do aluno considerando o caso e as diretrizes acima. Não invente dados ausentes, sinalize contraindicações e ressalte que a decisão deve seguir protocolos locais e supervisão clínica. Responda exatamente nesta estrutura em Markdown:

### 1. Classificação Geral
[Adequada | Parcialmente Adequada | Incorreta]

### 2. Análise da Conduta Principal
- **Escolha e indicação:** [Avalie a adequação da conduta ao caso]
- **Posologia e duração:** [Avalie dose, via, frequência e duração quando aplicável]

### 3. Sintomáticos e Orientação
- **Alívio sintomático:** [Avalie medicamentos sintomáticos e segurança]
- **Medidas gerais e segurança:** [Cheque seguimento, monitorização e sinais de alarme]

### 4. Prescrição Modelo Recomendada
[Apresente uma sugestão educacional de prescrição baseada nas diretrizes, incluindo medidas não farmacológicas e ressalvas relevantes.]
`;

  let endpoint;
  try {
    endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/chat/completions`);
    if (!["http:", "https:"].includes(endpoint.protocol)) throw new Error("Protocolo inválido.");
  } catch {
    return new Response(JSON.stringify({ error: "A URL da API de IA não é válida." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.1
      })
    });
  } catch {
    return new Response(JSON.stringify({ error: "Não foi possível conectar à API de IA." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return new Response(JSON.stringify({ error: "O serviço de análise retornou uma resposta inválida." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!response.ok) {
    return new Response(JSON.stringify({ error: `A API de IA retornou um erro (${response.status}).` }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  const analiseTexto = data.choices?.[0]?.message?.content;
  if (typeof analiseTexto !== "string" || !analiseTexto.trim()) {
    return new Response(JSON.stringify({ error: "O serviço de análise não retornou um feedback válido." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ analise: analiseTexto }), {
    headers: { "Content-Type": "application/json" }
  });
}
