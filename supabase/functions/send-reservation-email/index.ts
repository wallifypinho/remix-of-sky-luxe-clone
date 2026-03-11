import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const calcBoardingTime = (partida: string): string => {
  if (!partida || !partida.includes(":")) return partida;
  const [h, m] = partida.split(":").map(Number);
  const totalMin = h * 60 + m - 20;
  const bh = Math.floor(((totalMin + 1440) % 1440) / 60);
  const bm = (totalMin + 1440) % 60;
  return `${String(bh).padStart(2, "0")}:${String(bm).padStart(2, "0")}`;
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
  classe: string;
  portao: string;
}) => {
  const { trecho, companhia, origem, destino, data, partida, chegada, passageiroNome, cpf, assento, codigoReserva, numeroVoo, classe, portao } = params;
  const embarque = calcBoardingTime(partida);
  const trechoBg = trecho === "IDA" ? "#6366f1" : "#0ea5e9";
  const trechoLabel = trecho === "IDA" ? "✈ IDA" : "✈ VOLTA";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 16px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12); background: #fff;">
      <!-- Header -->
      <div style="background: ${trechoBg}; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">${trechoLabel}</td>
          <td style="text-align: right; color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${companhia || "Companhia Aérea"}</td>
        </tr></table>
      </div>

      <!-- Route -->
      <div style="padding: 24px 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="width: 35%; vertical-align: top;">
            <div style="font-size: 36px; font-weight: 900; color: #1a1a2e; letter-spacing: 3px;">${origem || "—"}</div>
            <div style="font-size: 11px; color: #888; margin-top: 2px;">ORIGEM</div>
          </td>
          <td style="width: 30%; text-align: center; vertical-align: middle; padding-top: 4px;">
            <div style="font-size: 20px; color: ${trechoBg};">✈</div>
            <div style="font-size: 10px; color: #aaa; margin-top: 2px;">VOO ${numeroVoo || "—"}</div>
          </td>
          <td style="width: 35%; text-align: right; vertical-align: top;">
            <div style="font-size: 36px; font-weight: 900; color: #1a1a2e; letter-spacing: 3px;">${destino || "—"}</div>
            <div style="font-size: 11px; color: #888; margin-top: 2px;">DESTINO</div>
          </td>
        </tr></table>
      </div>

      <!-- Passenger -->
      <div style="padding: 0 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fb; border-radius: 10px; padding: 14px;">
          <tr>
            <td style="padding: 14px;">
              <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">PASSAGEIRO</div>
              <div style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-top: 4px; text-transform: uppercase;">${passageiroNome || "—"}</div>
            </td>
            <td style="padding: 14px; text-align: right;">
              <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">CPF</div>
              <div style="font-size: 13px; font-weight: 600; color: #1a1a2e; margin-top: 4px; font-family: 'Courier New', monospace;">${maskCpf(cpf)}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Flight details grid -->
      <div style="padding: 0 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 25%; padding: 8px 0;">
              <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">DATA</div>
              <div style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-top: 4px;">${data || "—"}</div>
            </td>
            <td style="width: 25%; padding: 8px 0;">
              <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">PARTIDA</div>
              <div style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-top: 4px;">${partida || "--:--"}</div>
            </td>
            <td style="width: 25%; padding: 8px 0;">
              <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">CHEGADA</div>
              <div style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-top: 4px;">${chegada || "--:--"}</div>
            </td>
            <td style="width: 25%; padding: 8px 0;">
              <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">CLASSE</div>
              <div style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-top: 4px;">${classe || "ECO"}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Dashed divider -->
      <div style="padding: 0 12px;">
        <div style="border-top: 2px dashed #e0e0e0; position: relative;">
          <div style="position: absolute; left: -18px; top: -12px; width: 24px; height: 24px; border-radius: 50%; background: #f4f4f5;"></div>
          <div style="position: absolute; right: -18px; top: -12px; width: 24px; height: 24px; border-radius: 50%; background: #f4f4f5;"></div>
        </div>
      </div>

      <!-- Bottom section: Embarque, Portão, Assento, QR -->
      <div style="padding: 20px 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: top; width: 60%;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 24px; padding-bottom: 12px;">
                    <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">EMBARQUE</div>
                    <div style="font-size: 22px; font-weight: 800; color: ${trechoBg}; margin-top: 2px;">${embarque}</div>
                  </td>
                  <td style="padding-bottom: 12px;">
                    <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">PORTÃO</div>
                    <div style="font-size: 22px; font-weight: 800; color: #1a1a2e; margin-top: 2px;">${portao || "—"}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-right: 24px;">
                    <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">ASSENTO</div>
                    <div style="font-size: 22px; font-weight: 800; color: #1a1a2e; margin-top: 2px;">${assento || "—"}</div>
                  </td>
                  <td>
                    <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px;">RESERVA</div>
                    <div style="font-size: 16px; font-weight: 800; color: ${trechoBg}; margin-top: 2px; letter-spacing: 2px; font-family: 'Courier New', monospace;">${codigoReserva || "—"}</div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="vertical-align: top; text-align: right; width: 40%;">
              <div style="background: #f8f9fb; border-radius: 12px; padding: 12px; display: inline-block;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(codigoReserva || "BOARDING")}" width="120" height="120" alt="QR Code" style="display: block;" />
              </div>
            </td>
          </tr>
        </table>

        <!-- Barcode -->
        <div style="margin-top: 16px; text-align: center;">
          <img src="https://barcodeapi.org/api/128/${encodeURIComponent(codigoReserva || "000000")}" height="45" alt="Barcode" style="max-width: 100%; height: 45px;" />
          <div style="font-size: 10px; color: #aaa; margin-top: 4px; letter-spacing: 3px; font-family: 'Courier New', monospace;">${codigoReserva || "—"}</div>
        </div>
      </div>
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
    // Flight data for boarding pass email
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
    const classeLabel = classe === "executiva" ? "EXEC" : classe === "primeira" ? "1ª" : "ECO";

    if (type === "boarding_pass") {
      subject = `🎫 Cartão de Embarque - ${codigoReserva} | ${companhia || ""}`;

      // Generate boarding pass cards for each passenger
      let allCards = "";
      const paxList = passageiros || [mainPassenger];

      for (let pi = 0; pi < paxList.length; pi++) {
        const pax = paxList[pi];
        const paxName = pax?.nomeCompleto || pax?.nome || "—";
        const paxCpf = pax?.cpfDocumento || pax?.cpf || "";
        const paxAssento = assentos?.[pi] || pax?.assento || "—";

        // IDA card
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
          classe: classeLabel,
          portao: portao || "",
        });

        // VOLTA card (if round trip)
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
            classe: classeLabel,
            portao: "",
          });
        }
      }

      htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f5; padding: 32px 16px;">
          <div style="max-width: 560px; margin: 0 auto;">
            <!-- Email header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 24px; font-weight: 800; color: #1a1a2e;">🎫 Cartão de Embarque</div>
              <div style="font-size: 13px; color: #888; margin-top: 4px;">Reserva <strong style="color: #6366f1; letter-spacing: 2px;">${codigoReserva}</strong></div>
              <div style="font-size: 12px; color: #aaa; margin-top: 2px;">${hasVolta ? "Ida e Volta • " : "Somente Ida • "}${paxList.length} passageiro${paxList.length > 1 ? "s" : ""}</div>
            </div>

            ${allCards}

            <!-- Footer -->
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
            <p style="font-size: 12px; color: #999;">Um atendente entrará em contato via WhatsApp para dar continuidade ao processo.</p>
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

    // Send via MailChannels
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
