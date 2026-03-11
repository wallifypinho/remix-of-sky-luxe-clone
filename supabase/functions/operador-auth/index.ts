import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function using Web Crypto API (SHA-256 + salt)
async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const useSalt = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(useSalt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return { hash: hashHex, salt: useSalt };
}

async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { action, ...params } = await req.json();

    // LOGIN
    if (action === "login") {
      const { senha } = params;
      if (!senha) {
        return new Response(JSON.stringify({ error: "Senha obrigatória" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch all active operadores and try password against each
      const { data: operadores, error } = await supabase
        .from("operadores")
        .select("*")
        .in("status", ["ativo"]);

      if (error || !operadores || operadores.length === 0) {
        return new Response(JSON.stringify({ error: "Senha inválida" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let operador = null;
      for (const op of operadores) {
        const parts = op.senha_hash.split(":");
        if (parts.length !== 2) continue;
        const valid = await verifyPassword(senha, parts[1], parts[0]);
        if (valid) {
          operador = op;
          break;
        }
      }

      if (!operador) {
        return new Response(JSON.stringify({ error: "Senha inválida" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (operador.status === "bloqueado") {
        return new Response(JSON.stringify({ error: "Conta bloqueada. Contate o administrador." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (operador.status === "inativo") {
        return new Response(JSON.stringify({ error: "Conta inativa. Contate o administrador." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // senha_hash format: "salt:hash"
      const parts = operador.senha_hash.split(":");
      if (parts.length !== 2) {
        return new Response(JSON.stringify({ error: "Erro interno de autenticação" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const valid = await verifyPassword(senha, parts[1], parts[0]);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Email ou senha inválidos" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update session
      await supabase.from("operadores").update({
        sessao_ativa: true,
        ultimo_acesso: new Date().toISOString(),
      }).eq("id", operador.id);

      // Generate simple session token
      const sessionToken = crypto.randomUUID();

      return new Response(JSON.stringify({
        success: true,
        operador: {
          id: operador.id,
          nome: operador.nome,
          email: operador.email,
          perfil: operador.perfil,
          status: operador.status,
        },
        sessionToken,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LOGOUT
    if (action === "logout") {
      const { operadorId } = params;
      if (operadorId) {
        await supabase.from("operadores").update({
          sessao_ativa: false,
        }).eq("id", operadorId);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CRIAR OPERADOR (apenas admin)
    if (action === "criar") {
      const { nome, email, senha, perfil } = params;
      if (!nome || !email || !senha) {
        return new Response(JSON.stringify({ error: "Nome, email e senha obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { hash, salt } = await hashPassword(senha);
      const senhaHash = `${salt}:${hash}`;

      const { data, error } = await supabase.from("operadores").insert({
        nome,
        email: email.toLowerCase().trim(),
        senha_hash: senhaHash,
        perfil: perfil || "operador",
        status: "ativo",
      }).select("id, nome, email, perfil, status, created_at").single();

      if (error) {
        if (error.code === "23505") {
          return new Response(JSON.stringify({ error: "Email já cadastrado" }), {
            status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw error;
      }

      return new Response(JSON.stringify({ success: true, operador: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ATUALIZAR STATUS
    if (action === "atualizar_status") {
      const { operadorId, status } = params;
      if (!operadorId || !status) {
        return new Response(JSON.stringify({ error: "operadorId e status obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updates: any = { status };
      if (status === "bloqueado" || status === "inativo") {
        updates.sessao_ativa = false;
      }

      const { error } = await supabase.from("operadores").update(updates).eq("id", operadorId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LISTAR OPERADORES
    if (action === "listar") {
      const { data, error } = await supabase
        .from("operadores")
        .select("id, nome, email, perfil, status, ultimo_acesso, sessao_ativa, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, operadores: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESETAR SENHA
    if (action === "resetar_senha") {
      const { operadorId, novaSenha } = params;
      if (!operadorId || !novaSenha) {
        return new Response(JSON.stringify({ error: "operadorId e novaSenha obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { hash, salt } = await hashPassword(novaSenha);
      const senhaHash = `${salt}:${hash}`;

      const { error } = await supabase.from("operadores").update({ senha_hash: senhaHash }).eq("id", operadorId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação não reconhecida" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("operador-auth error:", err);
    return new Response(JSON.stringify({ error: err.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
