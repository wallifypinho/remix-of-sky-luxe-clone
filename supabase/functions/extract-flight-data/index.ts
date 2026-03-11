import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, textReserva, isConnectionImage } = await req.json();

    // Configuração flexível: tenta LOVABLE_API_KEY primeiro, depois AI_API_KEY
    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    const AI_PROVIDER_URL = Deno.env.get("AI_PROVIDER_URL") || "https://ai.gateway.lovable.dev/v1/chat/completions";
    const AI_MODEL = Deno.env.get("AI_MODEL") || "google/gemini-2.5-flash";

    if (!AI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Chave de API de IA não configurada (AI_API_KEY)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const connectionPrompt = `Você é um assistente especializado em extrair dados de CONEXÕES e ESCALAS de voos aéreos.
Analise a imagem fornecida e extraia os dados da CONEXÃO do voo.

REGRAS IMPORTANTES:
- Esta imagem contém detalhes de uma CONEXÃO ou ESCALA de voo de uma cotação
- Identifique TODOS os trechos de conexão (aeroportos intermediários)
- Extraia horários de chegada e partida de cada trecho
- Identifique a companhia aérea pela LOGO, NOME, CORES ou qualquer indicação visual
- Extraia números de voo quando visíveis
- Aeroportos devem ser em código IATA (3 letras)
- Identifique se é trecho de IDA ou VOLTA
- Extraia informações de terminal e portão quando disponíveis
- Se reconhecer a marca da companhia (LATAM, GOL, Azul, TAP, Avianca, etc.), preencha o campo companhia`;

    const generalPrompt = `Você é um assistente especializado em extrair dados de cotações de voos aéreos.
Analise a imagem ou texto fornecido e extraia TODOS os dados do voo com precisão.

REGRAS IMPORTANTES:
- Diferencie claramente IDA e VOLTA
- Para horários: se o voo sai às 20:15 do dia 7 e chega às 01:15, a chegada é no dia 8 (madrugada do dia seguinte)
- Identifique escalas quando presentes
- Extraia código de reserva, companhia aérea, número do voo
- Extraia dados dos passageiros: nome, documento, telefone/whatsapp
- Aeroportos devem ser em código IATA (3 letras) quando possível
- Inclua o nome completo do aeroporto e a cidade quando disponível
- Se houver múltiplos passageiros, extraia todos
- O número do voo pode não estar presente, nesse caso deixe vazio
- IMPORTANTE: Identifique a COMPANHIA AÉREA pela logo, nome, cores ou qualquer indicação visual na imagem. Se reconhecer a marca (LATAM, GOL, Azul, TAP, Avianca, etc.), preencha o campo companhia com o nome correto.`;

    const systemPrompt = isConnectionImage ? connectionPrompt : generalPrompt;

    const userContent: any[] = [
      {
        type: "text",
        text: textReserva
          ? `Extraia os dados de voo do seguinte texto de reserva:\n\n${textReserva}`
          : isConnectionImage
            ? "Extraia todos os dados de CONEXÃO/ESCALA deste voo. Identifique aeroportos intermediários, horários, companhia aérea, números de voo e trechos."
            : "Extraia todos os dados de voo desta imagem de cotação. Identifique ida, volta, escalas, horários, passageiros, código de reserva, companhia, etc.",
      },
    ];

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64 },
      });
    }

    const response = await fetch(AI_PROVIDER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_flight_data",
              description: "Retorna dados extraídos do voo em formato estruturado",
              parameters: {
                type: "object",
                properties: {
                  origem: { type: "string", description: "Código IATA do aeroporto de origem (ex: GRU)" },
                  origemNome: { type: "string", description: "Nome completo do aeroporto de origem (ex: Aeroporto Internacional de Guarulhos)" },
                  origemCidade: { type: "string", description: "Cidade de origem (ex: São Paulo)" },
                  destino: { type: "string", description: "Código IATA do aeroporto de destino (ex: SDU)" },
                  destinoNome: { type: "string", description: "Nome completo do aeroporto de destino (ex: Aeroporto Santos Dumont)" },
                  destinoCidade: { type: "string", description: "Cidade de destino (ex: Rio de Janeiro)" },
                  companhia: { type: "string", description: "Nome da companhia aérea" },
                  numeroVoo: { type: "string", description: "Número do voo (ex: AD5062). Vazio se não encontrado." },
                  classe: { type: "string", enum: ["economica", "executiva", "primeira"], description: "Classe do voo" },
                  codigoReserva: { type: "string", description: "Código de reserva/localizador" },
                  valor: { type: "string", description: "Valor total em reais (somente números e vírgula, ex: 1.250,00)" },
                  ida: {
                    type: "object",
                    properties: {
                      data: { type: "string", description: "Data da ida no formato DD/MM/YYYY" },
                      partida: { type: "string", description: "Horário de partida no formato HH:MM" },
                      chegada: { type: "string", description: "Horário de chegada no formato HH:MM" },
                      dataChegada: { type: "string", description: "Data de chegada se diferente da partida (voo noturno), formato DD/MM/YYYY" },
                      escalas: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            aeroporto: { type: "string" },
                            chegada: { type: "string" },
                            partida: { type: "string" },
                          },
                        },
                        description: "Escalas do trecho de ida, se houver",
                      },
                    },
                  },
                  volta: {
                    type: "object",
                    properties: {
                      data: { type: "string", description: "Data da volta no formato DD/MM/YYYY" },
                      partida: { type: "string", description: "Horário de partida no formato HH:MM" },
                      chegada: { type: "string", description: "Horário de chegada no formato HH:MM" },
                      dataChegada: { type: "string", description: "Data de chegada se diferente da partida (voo noturno), formato DD/MM/YYYY" },
                      escalas: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            aeroporto: { type: "string" },
                            chegada: { type: "string" },
                            partida: { type: "string" },
                          },
                        },
                        description: "Escalas do trecho de volta, se houver",
                      },
                    },
                  },
                  passageiros: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        nomeCompleto: { type: "string" },
                        cpfDocumento: { type: "string" },
                        dataNascimento: { type: "string" },
                        sexo: { type: "string", enum: ["masculino", "feminino", ""] },
                        telefone: { type: "string" },
                        email: { type: "string" },
                      },
                    },
                    description: "Lista de passageiros encontrados",
                  },
                  whatsappCliente: { type: "string", description: "WhatsApp ou telefone do cliente" },
                  descricao: { type: "string", description: "Descrição ou observações gerais" },
                },
                required: ["origem", "destino"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_flight_data" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI provider error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Muitas requisições. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "Erro ao processar com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ success: false, error: "IA não retornou dados estruturados" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
