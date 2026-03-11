import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const maskCpf = (cpf: string): string => {
  if (!cpf) return "";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length === 11) return `${clean.slice(0, 3)}.***.***.${clean.slice(9)}`;
  return cpf;
};

const calcBoardingTime = (partida: string): string => {
  if (!partida || !partida.includes(":")) return partida || "--:--";
  const [h, m] = partida.split(":").map(Number);
  const totalMin = h * 60 + m - 20;
  const bh = Math.floor(((totalMin + 1440) % 1440) / 60);
  const bm = (totalMin + 1440) % 60;
  return `${String(bh).padStart(2, "0")}:${String(bm).padStart(2, "0")}`;
};

const brandColor = "#0033A0";
const brandDark = "#001560";
const accentGold = "#C5A55A";
const gray100 = "#f3f4f6";
const gray400 = "#9ca3af";
const gray600 = "#4b5563";
const gray800 = "#1f2937";

const generateBoardingCard = (p: {
  trecho: string; companhia: string; origem: string; destino: string;
  data: string; partida: string; chegada: string; paxNome: string;
  cpf: string; assento: string; codigoReserva: string; numeroVoo: string; classe: string;
}) => {
  const embarque = calcBoardingTime(p.partida);
  return `
  <div style="max-width:580px;margin:16px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);background:#fff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${brandColor};">
      <tr>
        <td style="padding:14px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="color:#fff;font-size:16px;font-weight:700;">✈ Cartão de Embarque</td>
            <td style="text-align:right;color:${accentGold};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">${p.trecho}</td>
          </tr></table>
        </td>
      </tr>
    </table>
    <div style="padding:20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr>
          <td style="font-size:28px;font-weight:900;color:${gray800};letter-spacing:2px;">${p.origem || "—"}</td>
          <td style="text-align:center;color:${brandColor};font-size:18px;padding:0 12px;">→ ✈ →</td>
          <td style="font-size:28px;font-weight:900;color:${gray800};letter-spacing:2px;text-align:right;">${p.destino || "—"}</td>
        </tr>
      </table>
      <div style="border-top:1px dashed #e0e0e0;padding-top:12px;margin-bottom:12px;">
        <div style="font-size:10px;color:${gray400};text-transform:uppercase;font-weight:700;letter-spacing:1px;">Passageiro</div>
        <div style="font-size:15px;font-weight:800;color:${gray800};text-transform:uppercase;margin-top:2px;">${p.paxNome}</div>
        ${p.cpf ? `<div style="font-size:11px;color:${gray400};margin-top:1px;">CPF: ${maskCpf(p.cpf)}</div>` : ""}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px dashed #e0e0e0;padding-top:10px;">
        <tr>
          <td style="width:33%;padding:6px 0;">
            <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;">Partida</div>
            <div style="font-size:22px;font-weight:900;color:${gray800};">${p.partida || "--:--"}</div>
          </td>
          <td style="width:33%;padding:6px 0;">
            <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;">Chegada</div>
            <div style="font-size:22px;font-weight:900;color:${gray800};">${p.chegada || "--:--"}</div>
          </td>
          <td style="width:33%;padding:6px 0;">
            <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;">Embarque</div>
            <div style="font-size:22px;font-weight:900;color:${brandColor};">${embarque}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;">
            <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;">Data</div>
            <div style="font-size:14px;font-weight:700;color:${gray800};">${p.data || "—"}</div>
          </td>
          <td style="padding:6px 0;">
            <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;">Voo</div>
            <div style="font-size:14px;font-weight:700;color:${gray800};">${p.numeroVoo || "—"}</div>
          </td>
          <td style="padding:6px 0;">
            <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;">Assento</div>
            <div style="font-size:14px;font-weight:700;color:${gray800};">${p.assento || "—"}</div>
          </td>
        </tr>
      </table>
      <div style="border-top:1px dashed #e0e0e0;margin-top:12px;padding-top:10px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;">Reserva</div>
          <div style="font-size:18px;font-weight:900;color:${brandColor};font-family:monospace;letter-spacing:3px;">${p.codigoReserva || "—"}</div>
          <div style="font-size:9px;color:${gray400};text-transform:uppercase;font-weight:700;margin-top:6px;">Classe</div>
          <div style="font-size:12px;font-weight:700;color:${gray800};">${p.classe || "Econômica"}</div>
        </div>
        <div style="text-align:center;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(p.codigoReserva || "BOARDING")}" width="100" height="100" alt="QR" style="border-radius:8px;" />
        </div>
      </div>
    </div>
    <div style="background:${gray100};padding:8px 24px;text-align:center;">
      <span style="font-size:10px;color:${gray400};font-weight:600;">${p.companhia || "AeroPayments"} · Emissão digital</span>
    </div>
  </div>`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, codigoReserva, passageiros, assentos, metodoPagamento, valor, linkPagamento, whatsappOperador } = body;
    const { companhia, origem, destino, numeroVoo, classe, idaData, idaPartida, idaChegada, voltaData, voltaPartida, voltaChegada } = body;

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPass) {
      return new Response(JSON.stringify({ success: false, error: "Email not configured" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const mainPassenger = passageiros?.[0];
    const recipientEmail = mainPassenger?.email;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ success: false, error: "No recipient email" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let subject = "";
    let htmlBody = "";
    const hasVolta = !!voltaData;
    const classeLabel = classe === "executiva" ? "Executiva" : classe === "primeira" ? "Primeira Classe" : "Econômica";
    const paxList = passageiros || [mainPassenger];
    const paxName = mainPassenger?.nomeCompleto || mainPassenger?.nome || "Cliente";
    const whatsappLink = whatsappOperador ? `https://wa.me/${whatsappOperador}?text=${encodeURIComponent(`Olá! Referente à reserva ${codigoReserva} - ${paxName}. Preciso de ajuda.`)}` : "";

    if (type === "boarding_pass") {
      subject = `✈ Confirmação de Viagem - ${codigoReserva} | ${companhia || "AeroPayments"}`;

      let allCards = "";
      for (let pi = 0; pi < paxList.length; pi++) {
        const pax = paxList[pi];
        const pName = pax?.nomeCompleto || pax?.nome || "—";
        const pCpf = pax?.cpfDocumento || pax?.cpf || "";
        const pAssento = assentos?.[pi] || pax?.assento || "—";

        allCards += generateBoardingCard({
          trecho: "IDA", companhia: companhia || "", origem: origem || "", destino: destino || "",
          data: idaData || "", partida: idaPartida || "", chegada: idaChegada || "",
          paxNome: pName, cpf: pCpf, assento: pAssento,
          codigoReserva: codigoReserva || "", numeroVoo: numeroVoo || "", classe: classeLabel,
        });

        if (hasVolta) {
          allCards += generateBoardingCard({
            trecho: "VOLTA", companhia: companhia || "", origem: destino || "", destino: origem || "",
            data: voltaData || "", partida: voltaPartida || "", chegada: voltaChegada || "",
            paxNome: pName, cpf: pCpf, assento: pAssento,
            codigoReserva: codigoReserva || "", numeroVoo: numeroVoo || "", classe: classeLabel,
          });
        }
      }

      htmlBody = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f5;margin:0;padding:0;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,${brandColor},${brandDark});padding:40px 20px 30px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:1px;">✈ ${companhia || "AeroPayments"}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:6px;">Confirmação da sua viagem</div>
        </div>

        <div style="max-width:620px;margin:-20px auto 0;padding:0 16px 40px;">
          <!-- Welcome -->
          <div style="background:#fff;border-radius:16px;padding:28px 24px;box-shadow:0 2px 16px rgba(0,0,0,0.06);margin-bottom:16px;">
            <h2 style="font-size:20px;font-weight:800;color:${gray800};margin:0 0 8px;">Olá, ${paxName}!</h2>
            <p style="font-size:14px;color:${gray600};margin:0;line-height:1.6;">
              Sua reserva foi processada com sucesso. Confira abaixo todos os detalhes da sua viagem e o seu cartão de embarque digital.
            </p>
          </div>

          <!-- Flight Summary -->
          <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 16px rgba(0,0,0,0.06);margin-bottom:16px;">
            <div style="font-size:12px;color:${brandColor};font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">Resumo da Viagem</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid ${gray100};">
                  <span style="font-size:12px;color:${gray400};font-weight:600;">Rota</span><br/>
                  <span style="font-size:15px;font-weight:700;color:${gray800};">${origem || "—"} → ${destino || "—"}</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid ${gray100};text-align:right;">
                  <span style="font-size:12px;color:${gray400};font-weight:600;">Tipo</span><br/>
                  <span style="font-size:15px;font-weight:700;color:${gray800};">${hasVolta ? "Ida e Volta" : "Somente Ida"}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid ${gray100};">
                  <span style="font-size:12px;color:${gray400};font-weight:600;">Companhia</span><br/>
                  <span style="font-size:14px;font-weight:700;color:${gray800};">${companhia || "—"}</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid ${gray100};text-align:right;">
                  <span style="font-size:12px;color:${gray400};font-weight:600;">Voo</span><br/>
                  <span style="font-size:14px;font-weight:700;color:${gray800};">${numeroVoo || "—"}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid ${gray100};">
                  <span style="font-size:12px;color:${gray400};font-weight:600;">Classe</span><br/>
                  <span style="font-size:14px;font-weight:700;color:${gray800};">${classeLabel}</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid ${gray100};text-align:right;">
                  <span style="font-size:12px;color:${gray400};font-weight:600;">Passageiros</span><br/>
                  <span style="font-size:14px;font-weight:700;color:${gray800};">${paxList.length}</span>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:12px 0;text-align:center;">
                  <span style="font-size:12px;color:${gray400};font-weight:600;">Código / Localizador</span><br/>
                  <span style="font-size:22px;font-weight:900;color:${brandColor};font-family:monospace;letter-spacing:4px;">${codigoReserva || "—"}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Boarding Cards -->
          ${allCards}

          <!-- Passengers -->
          ${paxList.length > 1 ? `
          <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 16px rgba(0,0,0,0.06);margin-bottom:16px;margin-top:16px;">
            <div style="font-size:12px;color:${brandColor};font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Passageiros (${paxList.length})</div>
            ${paxList.map((px: any, i: number) => `
              <div style="padding:10px 0;${i < paxList.length - 1 ? `border-bottom:1px solid ${gray100};` : ""}">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:${brandColor};color:#fff;text-align:center;line-height:24px;font-size:11px;font-weight:700;margin-right:10px;">${i + 1}</span>
                <span style="font-size:14px;font-weight:700;color:${gray800};">${px?.nomeCompleto || px?.nome || "—"}</span>
                ${(px?.cpfDocumento || px?.cpf) ? `<span style="font-size:12px;color:${gray400};margin-left:8px;">CPF: ${maskCpf(px.cpfDocumento || px.cpf)}</span>` : ""}
              </div>
            `).join("")}
          </div>` : ""}

          <!-- Instructions -->
          <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 16px rgba(0,0,0,0.06);margin-bottom:16px;margin-top:16px;">
            <div style="font-size:12px;color:${brandColor};font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;">📋 Instruções Importantes</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                "Apresente-se com antecedência no aeroporto (mínimo 2h para voos nacionais, 3h para internacionais).",
                "Confira atentamente todos os dados da sua viagem antes do embarque.",
                "Mantenha seus documentos de identificação em mãos no momento do embarque.",
                "Algumas informações operacionais (portão, terminal) podem ser atualizadas pela companhia aérea.",
                "Bagagem de mão: 1 volume de até 10kg. Bagagem despachada conforme regras da tarifa.",
                "Em caso de dúvidas, entre em contato pelo nosso canal de atendimento."
              ].map((txt) => `
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:${gray600};line-height:1.5;">
                    <span style="color:${brandColor};font-weight:700;margin-right:6px;">•</span>${txt}
                  </td>
                </tr>
              `).join("")}
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin:24px 0;">
            ${linkPagamento ? `<a href="${linkPagamento}" style="display:inline-block;background:${brandColor};color:#fff;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:800;font-size:15px;box-shadow:0 4px 16px rgba(0,51,160,0.3);">Ver Detalhes Completos</a><br/><br/>` : ""}
            ${whatsappLink ? `<a href="${whatsappLink}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(37,211,102,0.3);">💬 Falar no WhatsApp</a>` : ""}
          </div>

          <!-- Footer -->
          <div style="text-align:center;padding:20px 0 0;">
            <div style="font-size:11px;color:${gray400};line-height:1.6;">
              Este é um e-mail automático gerado pelo sistema.<br/>
              Em caso de dúvidas, entre em contato pelo canal de atendimento.<br/>
              Algumas informações operacionais podem sofrer alterações pela companhia aérea.
            </div>
            <div style="font-size:10px;color:#ccc;margin-top:12px;">${companhia || "AeroPayments"} © ${new Date().getFullYear()} · Todos os direitos reservados</div>
          </div>
        </div>
      </div>`;
    } else if (type === "confirmation") {
      subject = `Reserva Recebida - Código: ${codigoReserva}`;
      const passageirosHtml = (passageiros || []).map((p: any, i: number) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid ${gray100};font-size:13px;color:${gray800};">${i + 1}</td>
          <td style="padding:10px;border-bottom:1px solid ${gray100};font-size:13px;font-weight:600;color:${gray800};">${p.nomeCompleto || "—"}</td>
          <td style="padding:10px;border-bottom:1px solid ${gray100};font-size:13px;color:${gray600};">${maskCpf(p.cpf || p.cpfDocumento || "")}</td>
        </tr>
      `).join("");

      htmlBody = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f5;margin:0;padding:0;">
        <div style="background:linear-gradient(135deg,${brandColor},${brandDark});padding:40px 20px 30px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;">✈ Reserva Recebida</div>
        </div>
        <div style="max-width:580px;margin:-20px auto 0;padding:0 16px 40px;">
          <div style="background:#fff;border-radius:16px;padding:28px 24px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
            <p style="font-size:15px;color:${gray800};">Olá <strong>${paxName}</strong>,</p>
            <p style="font-size:14px;color:${gray600};line-height:1.6;">Sua solicitação de reserva foi recebida com sucesso!</p>
            <div style="background:${gray100};border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
              <div style="font-size:12px;color:${gray400};font-weight:600;">Código da Reserva</div>
              <div style="font-size:28px;font-weight:900;color:${brandColor};font-family:monospace;letter-spacing:4px;margin-top:4px;">${codigoReserva}</div>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
              <tr style="background:${gray100};">
                <th style="padding:10px;text-align:left;font-size:11px;color:${gray400};font-weight:700;">#</th>
                <th style="padding:10px;text-align:left;font-size:11px;color:${gray400};font-weight:700;">Nome</th>
                <th style="padding:10px;text-align:left;font-size:11px;color:${gray400};font-weight:700;">CPF</th>
              </tr>
              ${passageirosHtml}
            </table>
            <p style="font-size:13px;color:${gray600};"><strong>Pagamento:</strong> ${metodoPagamento?.toUpperCase() || "—"}</p>
            <p style="font-size:13px;color:${gray600};"><strong>Status:</strong> ⏳ Aguardando processamento</p>
            <hr style="border:none;border-top:1px solid ${gray100};margin:24px 0;" />
            <p style="font-size:12px;color:${gray400};text-align:center;">Um atendente entrará em contato via WhatsApp.</p>
          </div>
        </div>
      </div>`;
    } else if (type === "payment") {
      subject = `💳 Link de Pagamento - Reserva: ${codigoReserva}`;
      htmlBody = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f5;margin:0;padding:0;">
        <div style="background:linear-gradient(135deg,${brandColor},${brandDark});padding:40px 20px 30px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;">💳 Pagamento Disponível</div>
        </div>
        <div style="max-width:580px;margin:-20px auto 0;padding:0 16px 40px;">
          <div style="background:#fff;border-radius:16px;padding:28px 24px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
            <p style="font-size:15px;color:${gray800};">Olá <strong>${paxName}</strong>,</p>
            <p style="font-size:14px;color:${gray600};line-height:1.6;">Seu link de pagamento está pronto!</p>
            <div style="background:${gray100};border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
              <div style="font-size:12px;color:${gray400};font-weight:600;">Reserva: <strong style="color:${brandColor};">${codigoReserva}</strong></div>
              <div style="font-size:32px;font-weight:900;color:${gray800};margin-top:8px;">R$ ${valor || "—"}</div>
            </div>
            ${linkPagamento ? `
              <div style="text-align:center;margin:24px 0;">
                <a href="${linkPagamento}" style="display:inline-block;background:${brandColor};color:#fff;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 4px 16px rgba(0,51,160,0.3);">Pagar Agora</a>
              </div>` : ""}
            <p style="font-size:12px;color:${gray400};text-align:center;">Em caso de dúvidas, entre em contato pelo WhatsApp.</p>
          </div>
        </div>
      </div>`;
    }

    const smtpUrl = "https://api.mailchannels.net/tx/v1/send";
    const mailResponse = await fetch(smtpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipientEmail, name: paxName }] }],
        from: { email: gmailUser, name: companhia || "AeroPayments" },
        subject,
        content: [{ type: "text/html", value: htmlBody }],
      }),
    });

    const responseOk = mailResponse.ok || mailResponse.status === 202;

    return new Response(
      JSON.stringify({ success: true, emailSent: responseOk }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
