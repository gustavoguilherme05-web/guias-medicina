export async function onRequestPost(context) {
  try {
    const { casoClinico, prescricaoAluno } = await context.request.json();
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Chave GEMINI_API_KEY não configurada no Cloudflare." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Prompt estrito de avaliação médica
    const systemPrompt = `
Você é um preceptor médico sênior avaliando a prescrição de um interno de medicina.

CASO CLÍNICO:
${casoClinico}

PRESCRIÇÃO SUBMETIDA PELO ALUNO:
${prescricaoAluno}

SUA TAREFA:
Analise a prescrição e forneça um feedback estruturado contendo:
1. VALIDAÇÃO: Informe se a conduta está adequada, parcial ou incorreta.
2. ERROS DE SEGURANÇA: Apresenção de doses erradas, vias inadequadas, falta de diluição ou contraindicações graves.
3. ITENS FALTANTES: O que faltou prescrever (ex: sintomáticos, monitorização, jejum, profilaxia).
4. PRESCRIÇÃO MODELO: Como seria a prescrição ideal completa baseada na diretriz atualizada.

Mantenha o tom construtivo, direto e estritamente baseado em evidências.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
        })
      }
    );

    const data = await response.json();
    const resultado = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível analisar a prescrição.";

    return new Response(JSON.stringify({ analise: resultado }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno ao processar prescrição." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}