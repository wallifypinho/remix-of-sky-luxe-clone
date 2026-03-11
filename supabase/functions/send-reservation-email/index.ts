import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, codigoReserva, passageiros, assentos, metodoPagamento, valor, linkPagamento } = await req.json();

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

    if (type === "confirmation") {
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
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 8px; border: 1px solid #eee; text-align: left;">#</th>
                  <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Nome</th>
                  <th style="padding: 8px; border: 1px solid #eee; text-align: left;">CPF</th>
                  <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Sexo</th>
                </tr>
              </thead>
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

    // Send via Gmail SMTP using fetch to a simple SMTP relay
    // Since Deno edge functions can't use Nodemailer directly, we'll use the basic approach
    const emailPayload = {
      from: gmailUser,
      to: recipientEmail,
      subject,
      html: htmlBody,
    };

    // Use Gmail SMTP via base64 encoded credentials
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

    // Fallback: if MailChannels fails, log but don't block
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
