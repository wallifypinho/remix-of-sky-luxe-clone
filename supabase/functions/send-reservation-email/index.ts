import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const maskCpf = (cpf: string): string => {
  if (!cpf) return "—";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length === 11) return `${clean.slice(0,3)}.${clean.slice(3,6)}.${clean.slice(6,9)}-${clean.slice(9)}`;
  return cpf;
};

const generateBoardingPassCard = (params: {
  trecho: "IDA" | "VOLTA";
  companhia: string;
  origem: string;
  destino: string;
  data: string;
  partida: string;
  chegada: string;
  passageiroNome: string;
  cpf: string;
  assento: string;
  codigoReserva: string;
  numeroVoo: string;
  portao: string;
}) => {
  const { trecho, companhia, origem, destino, data, partida, chegada, passageiroNome, cpf, assento, codigoReserva, portao } = params;
  const headerBg = "#6366f1";
  const embarque = partida || "--:--";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 16px auto; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.12); background: #fff;">
      <!-- Header azul -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background: ${headerBg};">
        <tr>
          <td style="padding: 14px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="color: #fff; font-size: 11px; vertical-align: middle;">✈</td>
              <td style="color: #fff; font-size: 17px; font-weight: 700; padding-left: 8px; letter-spacing: 1px;">Cartão de Embarque</td>
              <td style="text-align: right; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">${companhia || "Companhia Aérea"}</td>
            </tr></table>
          </td>
        </tr>
      </table>

      <!-- Body horizontal -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <!-- Coluna vertical esquerda -->
          <td width="28" style="background: #f8f9fb; border-right: 1px solid #eee; vertical-align: middle; text-align: center;">
            <div style="font-size: 9px; font-weight: 700; color: #aaa; letter-spacing: 3px; text-transform: uppercase; writing-mode: vertical-rl; transform: rotate(180deg); padding: 12px 4px;">${companhia || "AERO"}</div>
          </td>

          <!-- Dados do voo -->
          <td style="padding: 16px 20px; vertical-align: top;">
            <!-- Rota -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
              <tr>
                <td style="font-size: 16px; font-weight: 800; color: #1a1a2e;">${origem || "—"}</td>
                <td style="text-align: center; color: #6366f1; font-size: 14px; padding: 0 8px;">— ✈ —</td>
                <td style="font-size: 16px; font-weight: 800; color: #1a1a2e;">${destino || "—"}</td>
                <td style="text-align: right;">
                  <span style="font-size: 10px; font-weight: 700; color: #6366f1; border: 1px solid #e0e7ff; border-radius: 4px; padding: 2px 8px; text-transform: uppercase;">${trecho}</span>
                </td>
              </tr>
            </table>

            <!-- Passageiro -->
            <div style="border-top: 1px dashed #e0e0e0; padding-top: 8px; margin-bottom: 10px;">
              <div style="font-size: 10px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Passageiro:</div>
              <div style="font-size: 14px; font-weight: 700; color: #1a1a2e; text-transform: uppercase; margin-top: 2px;">${passageiroNome}</div>
              <div style="font-size: 11px; color: #888; margin-top: 1px;">CPF: ${maskCpf(cpf)}</div>
            </div>

            <!-- Grid de dados -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px dashed #e0e0e0; padding-top: 8px;">
              <tr>
                <td style="padding: 6px 0; width: 33%;">
                  <div style="font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Horário saída</div>
                  <div style="font-size: 20px; font-weight: 800; color: #1a1a2e;">${partida || "--:--"}</div>
                </td>
                <td style="padding: 6px 0; width: 33%;">
                  <div style="font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Chegada</div>
                  <div style="font-size: 20px; font-weight: 800; color: #1a1a2e;">${chegada || "--:--"}</div>
                </td>
                <td style="padding: 6px 0; width: 33%;">
                  <div style="font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Assento</div>
                  <div style="font-size: 20px; font-weight: 800; color: #1a1a2e;">${assento || "—"}</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0;">
                  <div style="font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Data</div>
                  <div style="font-size: 14px; font-weight: 700; color: #1a1a2e;">${data || "—"}</div>
                </td>
                <td style="padding: 6px 0;">
                  <div style="font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Portão</div>
                  <div style="font-size: 14px; font-weight: 700; color: #1a1a2e;">${portao || "—"}</div>
                </td>
                <td style="padding: 6px 0;">
                  <div style="font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Código de reserva</div>
                  <div style="font-size: 14px; font-weight: 800; color: #6366f1; font-family: 'Courier New', monospace; letter-spacing: 2px;">${codigoReserva || "—"}</div>
                </td>
              </tr>
            </table>
          </td>

          <!-- Barcode vertical -->
          <td width="40" style="border-left: 1px dashed #e0e0e0; vertical-align: middle; text-align: center; padding: 12px 4px;">
            <img src="https://barcodeapi.org/api/128/${encodeURIComponent(codigoReserva || "000000")}" width="32" style="transform: rotate(90deg); transform-origin: center;" alt="Barcode" />
          </td>

          <!-- QR Code + Embarque -->
          <td width="170" style="border-left: 1px solid #eee; background: #f8f9fb; vertical-align: middle; text-align: center; padding: 16px 12px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(codigoReserva || "BOARDING")}" width="110" height="110" alt="QR Code" style="display: block; margin: 0 auto;" />
            <div style="margin-top: 10px;">
              <div style="font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600;">Horário de embarque</div>
              <div style="font-size: 16px; font-weight: 800; color: #1a1a2e;">${embarque}</div>
            </div>
            <div style="margin-top: 8px; font-size: 9px; color: #aaa; line-height: 1.3;">
              Emissão oficial<br />
              <strong>${companhia || "AeroPayments"}</strong>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, codigoReserva, passageiros, assentos, metodoPagamento, valor, linkPagamento } = body;
    const { companhia, origem, destino, numeroVoo, classe, idaData, idaPartida, idaChegada, voltaData, voltaPartida, voltaChegada, portao } = body;

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPass) {
      return new Response(
        JSON.stringify({ success: false, error: "Email not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mainPassenger = passageiros?.[0];
    const recipientEmail = mainPassenger?.email;

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipient email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let htmlBody = "";
    const hasVolta = !!voltaData;

    if (type === "boarding_pass") {
      subject = `🎫 Cartão de Embarque - ${codigoReserva} | ${companhia || "AeroPayments"}`;

      let allCards = "";
      const paxList = passageiros || [mainPassenger];

      for (let pi = 0; pi < paxList.length; pi++) {
        const pax = paxList[pi];
        const paxName = pax?.nomeCompleto || pax?.nome || "—";
        const paxCpf = pax?.cpfDocumento || pax?.cpf || "";
        const paxAssento = assentos?.[pi] || pax?.assento || "—";

        allCards += generateBoardingPassCard({
          trecho: "IDA",
          companhia: companhia || "",
          origem: origem || "",
          destino: destino || "",
          data: idaData || "",
          partida: idaPartida || "",
          chegada: idaChegada || "",
          passageiroNome: paxName,
          cpf: paxCpf,
          assento: paxAssento,
          codigoReserva: codigoReserva || "",
          numeroVoo: numeroVoo || "",
          portao: portao || "",
        });

        if (hasVolta) {
          allCards += generateBoardingPassCard({
            trecho: "VOLTA",
            companhia: companhia || "",
            origem: destino || "",
            destino: origem || "",
            data: voltaData || "",
            partida: voltaPartida || "",
            chegada: voltaChegada || "",
            passageiroNome: paxName,
            cpf: paxCpf,
            assento: paxAssento,
            codigoReserva: codigoReserva || "",
            numeroVoo: numeroVoo || "",
            portao: "",
          });
        }
      }

      htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f5; padding: 32px 16px;">
          <div style="max-width: 640px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 22px; font-weight: 800; color: #1a1a2e;">🎫 Cartão de Embarque</div>
              <div style="font-size: 13px; color: #888; margin-top: 4px;">Reserva <strong style="color: #6366f1; letter-spacing: 2px;">${codigoReserva}</strong></div>
              <div style="font-size: 12px; color: #aaa; margin-top: 2px;">${hasVolta ? "Ida e Volta" : "Somente Ida"} • ${paxList.length} passageiro${paxList.length > 1 ? "s" : ""}</div>
            </div>
            ${allCards}
            <div style="text-align: center; margin-top: 24px; padding: 16px;">
              ${linkPagamento ? `<a href="${linkPagamento}" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 700; font-size: 15px;">Ver Detalhes Completos</a>` : ""}
              <p style="font-size: 11px; color: #999; margin-top: 16px;">Este é um e-mail automático. Em caso de dúvidas, entre em contato pelo WhatsApp.</p>
              <p style="font-size: 10px; color: #bbb;">AeroPayments © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      `;
    } else if (type === "confirmation") {
      subject = `Reserva Recebida - Código: ${codigoReserva}`;
      const passageirosHtml = (passageiros || []).map((p: any, i: number) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #eee;">${i + 1}</td>
          <td style="padding: 8px; border: 1px solid #eee;">${p.nomeCompleto || "—"}</td>
          <td style="padding: 8px; border: 1px solid #eee;">${p.cpf || "—"}</td>
          <td style="padding: 8px; border: 1px solid #eee;">${p.sexo === "masculino" ? "M" : p.sexo === "feminino" ? "F" : "—"}</td>
        </tr>
      `).join("");

      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <div style="background: #6366f1; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">✈️ Reserva Recebida</h1>
          </div>
          <div style="padding: 24px;">
            <p>Olá <strong>${mainPassenger.nomeCompleto || "Cliente"}</strong>,</p>
            <p>Sua solicitação de reserva foi recebida com sucesso!</p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #166534;">Código da Reserva</p>
              <p style="margin: 4px 0 0; font-size: 28px; font-weight: bold; color: #166534; letter-spacing: 3px;">${codigoReserva}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <thead><tr style="background: #f8fafc;">
                <th style="padding: 8px; border: 1px solid #eee; text-align: left;">#</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Nome</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: left;">CPF</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Sexo</th>
              </tr></thead>
              <tbody>${passageirosHtml}</tbody>
            </table>
            <p><strong>Assentos:</strong> ${(assentos || []).join(", ") || "Nenhum selecionado"}</p>
            <p><strong>Forma de Pagamento:</strong> ${metodoPagamento?.toUpperCase() || "—"}</p>
            <p><strong>Status:</strong> ⏳ Aguardando processamento</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #999;">Um atendente entrará em contato via WhatsApp.</p>
          </div>
        </div>
      `;
    } else if (type === "payment") {
      subject = `Link de Pagamento - Reserva: ${codigoReserva}`;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <div style="background: #6366f1; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">💳 Pagamento Disponível</h1>
          </div>
          <div style="padding: 24px;">
            <p>Olá <strong>${mainPassenger?.nomeCompleto || "Cliente"}</strong>,</p>
            <p>Seu link de pagamento está pronto!</p>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">Reserva: <strong>${codigoReserva}</strong></p>
              <p style="margin: 8px 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">R$ ${valor || "—"}</p>
            </div>
            ${linkPagamento ? `
              <div style="text-align: center; margin: 24px 0;">
                <a href="${linkPagamento}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">Pagar Agora</a>
              </div>
            ` : ""}
            <p style="font-size: 12px; color: #999;">Em caso de dúvidas, entre em contato pelo WhatsApp.</p>
          </div>
        </div>
      `;
    }

    const smtpUrl = "https://api.mailchannels.net/tx/v1/send";
    const mailResponse = await fetch(smtpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipientEmail, name: mainPassenger?.nomeCompleto || "" }] }],
        from: { email: gmailUser, name: "AeroPayments" },
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
