import {
  getAuthenticatedUser,
  hasDatabase,
  hashText,
  jsonResponse
} from "../_shared/auth.js";

const OSCE_CHECKLIST = [
  { id: "symptoms", label: "Investigou sintomas e início do quadro" },
  { id: "allergies", label: "Perguntou sobre alergias" },
  { id: "ecg", label: "Solicitou ECG" },
  { id: "furosemide", label: "Propôs furosemida" }
];

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_MODEL = "gemini-3.8-flash";
const OSCE_TRIAL_SESSION_TTL_MS = 15 * 60 * 1000;
const OSCE_UPGRADE_REQUIRED = {
  requiresUpgrade: true,
  message: "Teste do OSCE esgotado. Assine o plano PRO para uso ilimitado."
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

const PATIENT_PROMPT = `Você é João Martins, paciente fictício de 65 anos atendido em uma UPA. Responda sempre em português brasileiro, em primeira pessoa, de maneira coloquial, breve e natural.

Interprete estritamente o papel do paciente. Nunca revele ou sugira um diagnóstico, não aja como médico e não dê orientações clínicas. Responda somente ao que o médico perguntar, sem antecipar informações.
Se o histórico estiver vazio, inicie a consulta com uma saudação breve e diga apenas que está com falta de ar.

Fatos do caso, que só devem ser revelados quando perguntados:
- Falta de ar iniciada ontem à noite, pior hoje; piora ao deitar e melhora um pouco sentado.
- Tem pressão alta e não sabe o nome do remédio que usa.
- Nega febre e tosse. Não sabe informar outros antecedentes ou alergias sem ser perguntado.
- Se pedirem sinais vitais: pressão 150/90 mmHg, frequência cardíaca 108 bpm, frequência respiratória 26 irpm, saturação 91% e temperatura 36,8 °C.
- Se pedirem exame físico, descreva apenas: alerta, fala frases completas, desconforto respiratório leve, estertores bibasais e edema bilateral discreto em membros inferiores.
- Se pedirem ECG: ritmo sinusal, frequência aumentada, sem alterações agudas do segmento ST.
- Se pedirem radiografia de tórax: opacidades intersticiais bilaterais e silhueta cardíaca aumentada.
- Se perguntarem sobre alergias, responda que não conhece alergias. Não invente informações além destas.

Forneça sinais vitais, exame físico e resultados complementares somente quando solicitados.`;

const PRECEPTOR_PROMPT = `Você é um preceptor médico avaliando, para fins educacionais, a conversa de um aluno com o paciente fictício João Martins, de 65 anos, com falta de ar.

Avalie exclusivamente as evidências presentes no histórico. Não presuma ações que o aluno não realizou. Marque como concluído apenas se estiver demonstrado:
- symptoms: investigou sintomas e início/evolução do quadro;
- allergies: perguntou sobre alergias;
- ecg: solicitou ECG;
- furosemide: propôs furosemida.

Retorne somente um objeto JSON válido, sem Markdown, saudações ou texto fora do JSON, com este formato exato:
{"finalScore":0,"checklist":[{"id":"symptoms","completed":false},{"id":"allergies","completed":false},{"id":"ecg","completed":false},{"id":"furosemide","completed":false}],"comment":"Comentário construtivo e específico."}

Substitua os valores pelos resultados da avaliação. A nota deve ser um número entre 0 e 10, igual a 2,5 pontos por item concluído. Escreva um comentário respeitoso, destacando acertos e próximos passos. Não inclua diagnóstico novo ou recomendação para um paciente real.`;

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
      return jsonResponse({ error: "Entre na sua conta para usar o simulador OSCE." }, 401);
    }

    account = await env.DB.prepare(`
      SELECT subscription_status, subscription_plan, osce_trial_used,
             osce_trial_session_hash, osce_trial_session_expires_at
      FROM users
      WHERE email = ?
    `).bind(user.email).first();
  } catch (error) {
    console.error("Falha ao validar acesso ao simulador OSCE:", error);
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

  if (!["patient", "debrief"].includes(body?.mode)) {
    return jsonResponse({ error: "Modo de atendimento inválido." }, 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length > 100) {
    return jsonResponse({ error: "Histórico de conversa inválido." }, 400);
  }

  const plan = getSubscriptionPlan(account);
  const isPro = plan === "pro";
  const needsTrial = plan === "free" || plan === "prescription_only";
  if (!isPro && !needsTrial) {
    return jsonResponse(OSCE_UPGRADE_REQUIRED, 403);
  }

  const messages = [];
  let totalLength = 0;
  for (const message of body.messages) {
    if (!["user", "assistant"].includes(message?.role) ||
        typeof message.content !== "string" ||
        !message.content.trim() ||
        message.content.length > 2000) {
      return jsonResponse({ error: "Mensagem inválida no histórico." }, 400);
    }
    totalLength += message.content.length;
    if (totalLength > 40000) {
      return jsonResponse({ error: "O histórico excede o limite permitido." }, 400);
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }

  const baseUrl = context.env?.BASE_URL || DEFAULT_BASE_URL;
  const apiKey = context.env?.API_KEY;
  const model = context.env?.MODEL || DEFAULT_MODEL;
  if (!apiKey) {
    return jsonResponse({
      error: "API_KEY não está configurada como segredo no ambiente do Cloudflare Pages (Production ou Preview)."
    }, 500);
  }

  let endpoint;
  try {
    endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/chat/completions`);
    if (!["http:", "https:"].includes(endpoint.protocol)) throw new Error("Protocolo inválido.");
  } catch {
    return jsonResponse({ error: "A URL da API de IA não é válida." }, 500);
  }

  if (needsTrial) {
    const trialSessionToken = body.trialSessionToken;
    if (typeof trialSessionToken !== "string" || !/^[a-f0-9]{64}$/.test(trialSessionToken)) {
      return jsonResponse({ error: "Sessão OSCE inválida. Reinicie a simulação." }, 400);
    }

    try {
      const sessionHash = await hashText(trialSessionToken);
      const now = Date.now();
      const sessionIsActive = account.osce_trial_session_hash === sessionHash &&
        Number(account.osce_trial_session_expires_at) > now;

      if (account.osce_trial_used === 1) {
        if (!sessionIsActive) {
          return jsonResponse(OSCE_UPGRADE_REQUIRED, 403);
        }
      } else {
        const planCondition = getPlanCondition(account, plan);
        const reservation = await env.DB.prepare(`
          UPDATE users
          SET osce_trial_used = 1,
              osce_trial_session_hash = ?,
              osce_trial_session_expires_at = ?
          WHERE email = ?
            AND (${planCondition.sql})
            AND osce_trial_used = 0
        `).bind(
          sessionHash,
          now + OSCE_TRIAL_SESSION_TTL_MS,
          user.email,
          planCondition.value
        ).run();

        if (reservation.meta?.changes !== 1) {
          const currentAccount = await env.DB.prepare(`
            SELECT subscription_status, subscription_plan, osce_trial_used,
                   osce_trial_session_hash, osce_trial_session_expires_at
            FROM users
            WHERE email = ?
          `).bind(user.email).first();
          const concurrentSameSession = (currentAccount && getSubscriptionPlan(currentAccount) === "pro") ||
            (currentAccount?.osce_trial_session_hash === sessionHash &&
             Number(currentAccount.osce_trial_session_expires_at) > Date.now());
          if (!concurrentSameSession) {
            return jsonResponse(OSCE_UPGRADE_REQUIRED, 403);
          }
        }
      }
    } catch (error) {
      console.error("Falha ao reservar o teste gratuito do OSCE:", error);
      return jsonResponse({ error: "Não foi possível registrar seu teste OSCE agora." }, 500);
    }
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
        messages: [
          { role: "system", content: body.mode === "patient" ? PATIENT_PROMPT : PRECEPTOR_PROMPT },
          ...messages
        ],
        temperature: body.mode === "patient" ? 0.7 : 0.1
      })
    });
  } catch {
    return jsonResponse({ error: "Não foi possível conectar à API de IA. Verifique a URL e a disponibilidade do provedor." }, 502);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return jsonResponse({ error: "A API de IA retornou uma resposta inválida." }, 502);
  }
  if (!response.ok) {
    return jsonResponse({ error: `A API de IA retornou um erro (${response.status}).` }, 502);
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return jsonResponse({ error: "A IA não retornou uma resposta válida." }, 502);
  }

  return jsonResponse({ content: content.trim() });
}
