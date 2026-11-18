import {
  getAuthenticatedUser,
  hasDatabase,
  jsonResponse
} from "../_shared/auth.js";

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

function getSubscriptionPlan(account) {
  const tierStatuses = new Set(["free", "prescription_only", "pro"]);
  if (tierStatuses.has(account.subscription_status)) {
    return account.subscription_status;
  }
  if (["active", "trialing"].includes(account.subscription_status) &&
      tierStatuses.has(account.subscription_plan)) {
    return account.subscription_plan;
  }
  return "free";
}

function getPlanCondition(account, plan) {
  if (["free", "prescription_only", "pro"].includes(account.subscription_status)) {
    return {
      sql: "subscription_status = ?",
      value: account.subscription_status
    };
  }
  if (["active", "trialing"].includes(account.subscription_status)) {
    return {
      sql: "subscription_status IN ('active', 'trialing') AND subscription_plan = ?",
      value: plan
    };
  }
  return {
    sql: "subscription_status = ? AND subscription_plan = 'free'",
    value: account.subscription_status
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  let user;
  let account;
  try {
    user = await getAuthenticatedUser(request, env);
    if (!user) {
      return jsonResponse({ error: "Entre na sua conta para usar o treino de prescrição." }, 401);
    }

    account = await env.DB.prepare(`
      SELECT subscription_status, subscription_plan,
             prescriptions_today_count, last_prescription_date
      FROM users
      WHERE email = ?
    `).bind(user.email).first();
  } catch (error) {
    console.error("Falha ao validar acesso ao treino de prescrição:", error);
    return jsonResponse({ error: "Não foi possível validar seu acesso agora." }, 500);
  }

  if (!account) {
    return jsonResponse({ error: "Conta não encontrada." }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Corpo da requisição inválido." }, 400);
  }

  const prescricaoAluno = typeof body?.prescricaoAluno === "string"
    ? body.prescricaoAluno.trim()
    : "";
  const casoId = typeof body?.casoId === "string" ? body.casoId : "";
  const caso = Object.prototype.hasOwnProperty.call(RUBRICAS_POR_CASO, casoId)
    ? RUBRICAS_POR_CASO[casoId]
    : null;
  if (!caso) {
    return jsonResponse({ error: "Selecione um caso clínico válido." }, 400);
  }
  if (!prescricaoAluno) {
    return jsonResponse({ error: "Informe a prescrição para análise." }, 400);
  }

  const baseUrl = context.env?.BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
  const apiKey = context.env?.API_KEY;
  const model = context.env?.MODEL || "gemini-3.8-flash";
  if (!apiKey) {
    return jsonResponse({ error: "API_KEY não está configurada como segredo no ambiente do Cloudflare Pages." }, 500);
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
    return jsonResponse({ error: "A URL da API de IA não é válida." }, 500);
  }

  const today = new Date().toISOString().split("T")[0];
  const plan = getSubscriptionPlan(account);
  const isFree = plan === "free";
  if (!isFree && plan !== "prescription_only" && plan !== "pro") {
    return jsonResponse({
      requiresUpgrade: true,
      message: "Limite diário atingido. Assine um plano para uso ilimitado."
    }, 403);
  }
  if (isFree &&
      account.last_prescription_date === today &&
      account.prescriptions_today_count >= 1) {
    return jsonResponse({
      requiresUpgrade: true,
      message: "Limite diário atingido. Assine um plano para uso ilimitado."
    }, 403);
  }

  const planCondition = getPlanCondition(account, plan);

  try {
    const update = await env.DB.prepare(`
      UPDATE users
      SET prescriptions_today_count = CASE
            WHEN last_prescription_date = ? THEN prescriptions_today_count + 1
            ELSE 1
          END,
          last_prescription_date = ?
      WHERE email = ?
        AND (${planCondition.sql})
        AND (
          ? != 'free' OR
          (CASE WHEN last_prescription_date = ? THEN prescriptions_today_count ELSE 0 END) < 1
        )
    `).bind(today, today, user.email, planCondition.value, plan, today).run();

    if (update.meta?.changes !== 1) {
      return jsonResponse({
        requiresUpgrade: true,
        message: "Limite diário atingido. Assine um plano para uso ilimitado."
      }, 403);
    }
  } catch (error) {
    console.error("Falha ao atualizar o limite diário de prescrição:", error);
    return jsonResponse({ error: "Não foi possível registrar seu uso agora." }, 500);
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
