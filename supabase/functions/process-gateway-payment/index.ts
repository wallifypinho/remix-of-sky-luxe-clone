import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GatewayRequest {
  gateway: "hura-pay" | "anubis-pay";
  secretKey: string;
  publicKey: string;
  amount: number; // in cents
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  description?: string;
  codigoReserva?: string;
}

async function processHuraPay(body: GatewayRequest) {
  const url = "https://api.hurapayments.com.br/v1/payment-transaction/create";

  const payload = {
    payment_method: "pix",
    amount: body.amount,
    description: body.description || `Pagamento reserva ${body.codigoReserva || ""}`,
    customer: {
      name: body.customer.name,
      email: body.customer.email,
      phone: body.customer.phone || "",
      document: {
        type: "cpf",
        number: body.customer.cpf.replace(/\D/g, ""),
      },
    },
    pix: {
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };

  console.log("[HuraPay] Calling API with payload:", JSON.stringify(payload));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${body.secretKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[HuraPay] API error:", response.status, JSON.stringify(data));
    throw new Error(
      `Hura Pay retornou erro ${response.status}: ${data?.message || data?.error || JSON.stringify(data)}`
    );
  }

  console.log("[HuraPay] Success:", JSON.stringify(data));

  // Extract PIX data from response
  return {
    success: true,
    gateway: "hura-pay",
    transactionId: data.id || data.transaction_id || data.payment_id,
    pixCode: data.pix?.qr_code || data.pix?.emv || data.qr_code || data.pix_code || data.code || null,
    pixQrCodeUrl: data.pix?.qr_code_url || data.qr_code_url || null,
    status: data.status || "pending",
    rawResponse: data,
  };
}

async function processAnubisPay(body: GatewayRequest) {
  const url = "https://api.anubispay.com.br/v1/transaction/create";

  const payload = {
    payment_method: "pix",
    amount: body.amount,
    description: body.description || `Pagamento reserva ${body.codigoReserva || ""}`,
    customer: {
      name: body.customer.name,
      email: body.customer.email,
      phone: body.customer.phone || "",
      document: {
        type: "cpf",
        number: body.customer.cpf.replace(/\D/g, ""),
      },
    },
  };

  console.log("[AnubisPay] Calling API with payload:", JSON.stringify(payload));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${body.secretKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[AnubisPay] API error:", response.status, JSON.stringify(data));
    throw new Error(
      `Anubis Pay retornou erro ${response.status}: ${data?.message || data?.error || JSON.stringify(data)}`
    );
  }

  console.log("[AnubisPay] Success:", JSON.stringify(data));

  return {
    success: true,
    gateway: "anubis-pay",
    transactionId: data.id || data.transaction_id || data.payment_id,
    pixCode: data.pix?.qr_code || data.pix?.emv || data.qr_code || data.pix_code || data.code || null,
    pixQrCodeUrl: data.pix?.qr_code_url || data.qr_code_url || null,
    status: data.status || "pending",
    rawResponse: data,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: GatewayRequest = await req.json();

    if (!body.gateway) {
      return new Response(
        JSON.stringify({ success: false, error: "Gateway não especificado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.secretKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Secret Key não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Valor inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.customer?.name || !body.customer?.cpf) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados do cliente incompletos (nome e CPF obrigatórios)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (body.gateway) {
      case "hura-pay":
        result = await processHuraPay(body);
        break;
      case "anubis-pay":
        result = await processAnubisPay(body);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Gateway "${body.gateway}" não suportado` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Gateway error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
