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
  if (!prescricaoAluno) {
    return new Response(JSON.stringify({ error: "Informe a prescrição para análise." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = context.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Chave GEMINI_API_KEY não configurada no Cloudflare." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const systemPrompt = `
Você é um preceptor médico sênior avaliando a prescrição de um interno de medicina.

CASO CLÍNICO:
Paciente do sexo feminino, 26 anos, com disúria, polaciúria e urgência miccional há 2 dias. Sem febre, sem dor lombar, Giordano negativo. Quadro típico de Cistite Aguda Não Complicada.

PRESCRIÇÃO DO ALUNO:
${prescricaoAluno}

DIRETRIZ DE REFERÊNCIA (SBU / FEBRASGO):
- 1ª Linha Antibiótica: Nitrofurantoína 100mg VO 6/6h por 5-7 dias, OR Fosfomicina 3g VO dose única, OR Sulfametoxazol+Trimetoprima (800/160mg) 12/12h por 3 dias.
- Sintomáticos: Phenazopyridina 100-200mg VO 8/8h por no máximo 2 dias, ou analgésicos simples (Dipirona/Ibuprofeno).
- Condutas Inadequadas: Fluorquinolonas (Ciprofloxacin, Levofloxacin) como 1ª linha; tempo de antibiótico > 7 dias; solicitação desnecessária de urocultura/EAS para cistite simples não complicada.

SUA TAREFA:
Analise a prescrição do aluno e responda exatamente nesta estrutura formatada em Markdown:

### 1. Classificação Geral
[Adequada | Parcialmente Adequada | Incorreta]

### 2. Análise Antibiótica
- **Escolha da droga:** [Avalie se é 1ª linha ou se usou quinolona inadequadamente]
- **Posologia e Duração:** [Avalie a dose e tempo de tratamento]

### 3. Sintomáticos e Orientação
- **Manejo da dor:** [Avalie o uso de analgésicos/Phenazopyridina]
- **Medidas gerais:** [Cheque orientações como hidratação e sinais de alarme]

### 4. Prescrição Modelo Recomendada
[Apresente a prescrição ideal baseada na diretriz]
`;

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
        })
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Não foi possível conectar ao serviço de análise." }), {
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
    return new Response(JSON.stringify({ error: "O serviço de análise não conseguiu processar a solicitação." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  const analiseTexto = data.candidates?.[0]?.content?.parts?.[0]?.text;
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
