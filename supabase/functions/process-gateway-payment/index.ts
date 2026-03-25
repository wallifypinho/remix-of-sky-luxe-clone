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

const jsonHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

function uniqueKeys(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function maskKey(value: string) {
  if (!value) return "";
  if (value.length <= 10) return value;
  return `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
}

function isHuraSecretKey(value: string) {
  return /^sk_(live|test)_/i.test(value.trim());
}

function isHuraPublicKey(value: string) {
  return /^hurapay_(live|test)_/i.test(value.trim());
}

async function processHuraPay(body: GatewayRequest) {
  const url = "https://api.hurapayments.com.br/v1/payment-transaction/create";
  const keyCandidates = uniqueKeys([body.secretKey, body.publicKey]);
  const authCandidates = uniqueKeys([
    ...keyCandidates.filter(isHuraSecretKey),
    ...keyCandidates.filter((key) => !isHuraSecretKey(key)),
  ]);
  const publicKey = keyCandidates.find(isHuraPublicKey) || "";

  console.log("[HuraPay] Auth candidates:", JSON.stringify(authCandidates.map(maskKey)));
  if (publicKey) {
    console.log("[HuraPay] Public key candidate:", maskKey(publicKey));
  }

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

  const authAttempts = authCandidates.flatMap((key) => {
    const optionalPublicHeaders = publicKey ? { "x-public-key": publicKey } : {};

    return [
      {
        label: `Bearer ${maskKey(key)}`,
        headers: { ...jsonHeaders, ...optionalPublicHeaders, "Authorization": `Bearer ${key}` },
      },
      {
        label: `Authorization ${maskKey(key)}`,
        headers: { ...jsonHeaders, ...optionalPublicHeaders, "Authorization": key },
      },
      {
        label: `x-api-key ${maskKey(key)}`,
        headers: { ...jsonHeaders, ...optionalPublicHeaders, "x-api-key": key },
      },
      {
        label: `apikey ${maskKey(key)}`,
        headers: { ...jsonHeaders, ...optionalPublicHeaders, "apikey": key },
      },
    ];
  });

  let lastAuthError: unknown = null;

  for (const attempt of authAttempts) {
    console.log("[HuraPay] Trying auth strategy:", attempt.label);

    const response = await fetch(url, {
      method: "POST",
      headers: attempt.headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return parseHuraResponse(data);
    }

    if (response.status === 401) {
      lastAuthError = data;
      continue;
    }

    console.error("[HuraPay] API error:", response.status, JSON.stringify(data));
    throw new Error(
      `Hura Pay retornou erro ${response.status}: ${data?.message || data?.error || JSON.stringify(data)}`
    );
  }

  console.error("[HuraPay] All auth methods failed:", JSON.stringify(lastAuthError));
  throw new Error(
    "Hura Pay: autenticação recusada. Confira se a Secret Key começa com sk_live_ e a Public Key com hurapay_live_."
  );
}

function parseHuraResponse(data: any) {
  console.log("[HuraPay] Success:", JSON.stringify(data));
  return {
    success: true,
    gateway: "hura-pay",
    transactionId: data.id || data.transaction_id || data.payment_id,
    pixCode: data.pix?.qr_code || data.pix?.emv || data.qr_code || data.pix_code || data.code || data.pix?.copy_paste || null,
    pixQrCodeUrl: data.pix?.qr_code_url || data.qr_code_url || null,
    status: data.status || "pending",
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
