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
  amount: number;
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  description?: string;
  codigoReserva?: string;
}

function maskKey(value: string) {
  if (!value) return "";
  if (value.length <= 10) return value;
  return `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
}

async function processHuraPay(body: GatewayRequest) {
  const url = "https://api.hurapayments.com.br/v1/payment-transaction/create";

  // Hura Pay uses Basic Auth: Base64(PUBLIC_KEY:SECRET_KEY)
  let publicKey = body.publicKey?.trim() || "";
  let secretKey = body.secretKey?.trim() || "";

  // Auto-swap if keys are in wrong fields
  if (/^sk_/i.test(publicKey) && /^hurapay_/i.test(secretKey)) {
    [publicKey, secretKey] = [secretKey, publicKey];
  }

  console.log("[HuraPay] Public key:", maskKey(publicKey));
  console.log("[HuraPay] Secret key:", maskKey(secretKey));

  // Encode Basic Auth: Base64(PUBLIC_KEY:SECRET_KEY)
  const basicAuth = btoa(`${publicKey}:${secretKey}`);

  const description = body.description || `Pagamento reserva ${body.codigoReserva || ""}`;

  const payload = {
    payment_method: "pix",
    amount: body.amount, // amount in cents from frontend
    postback_url: "https://qhxwrjhbeoxamozcykdg.supabase.co/functions/v1/process-gateway-payment",
    customer: {
      name: body.customer.name,
      email: body.customer.email,
      phone: (body.customer.phone || "").replace(/\D/g, ""),
      document: {
        type: "cpf",
        number: body.customer.cpf.replace(/\D/g, ""),
      },
    },
    items: [
      {
        title: description,
        quantity: 1,
        unit_price: body.amount,
      },
    ],
    pix: {
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    metadata: {
      provider_name: "AeroPayments",
      codigo_reserva: body.codigoReserva || "",
    },
  };

  console.log("[HuraPay] Calling API with payload:", JSON.stringify(payload));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Basic ${basicAuth}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[HuraPay] API error:", response.status, JSON.stringify(data));
    if (response.status === 401) {
      throw new Error(
        "Hura Pay: autenticação recusada. Verifique se a Public Key e Secret Key estão corretas no painel Hura Pay."
      );
    }
    throw new Error(
      `Hura Pay retornou erro ${response.status}: ${data?.message || data?.error || JSON.stringify(data)}`
    );
  }

  console.log("[HuraPay] Success:", JSON.stringify(data));

  // Hura Pay wraps response under "data" key: { data: { id, pix: { qr_code } }, success: true }
  const inner = data.data || data;

  return {
    success: true,
    gateway: "hura-pay",
    transactionId: inner.id || inner.Id || inner.transaction_id,
    pixCode: inner.pix?.qr_code || inner.pix?.emv || inner.qr_code || inner.pix_code || null,
    pixQrCodeUrl: inner.pix?.qr_code_url || inner.pix?.url || inner.qr_code_url || null,
    status: inner.status || inner.Status || "PENDING",
    rawResponse: data,
  };
}

async function processAnubisPay(body: GatewayRequest) {
  const url = "https://api.anubispay.com.br/v1/transaction/create";
  const key = body.secretKey.trim();

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
      "Accept": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

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
    pixCode: data.pix?.qr_code || data.pix?.emv || data.qr_code || data.pix_code || data.code || data.pix?.copy_paste || null,
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

    if (!body.secretKey || body.secretKey.trim().length < 5) {
      return new Response(
        JSON.stringify({ success: false, error: "Secret Key inválida ou não configurada. Vá na aba Gateways e configure sua chave." }),
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
