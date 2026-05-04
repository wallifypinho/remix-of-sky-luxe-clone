import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeOperatorCode(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6);
}

async function generateUniqueOperatorCode(supabase: ReturnType<typeof createClient>): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
    const { data, error } = await supabase
      .from("operadores")
      .select("id")
      .eq("codigo_acesso", code)
      .maybeSingle();

    if (error) throw error;
    if (!data) return code;
  }

  throw new Error("Não foi possível gerar um código de acesso único");
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
      const { senha, identificador, slug } = params;
      const rawIdentifier = String(identificador || slug || "").trim();
      if (!senha) {
        return new Response(JSON.stringify({ error: "Senha é obrigatória" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch active operadores
      const { data: operadores, error } = await supabase
        .from("operadores")
        .select("*")
        .in("status", ["ativo"]);

      if (error || !operadores || operadores.length === 0) {
        return new Response(JSON.stringify({ error: "Senha inválida" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If identifier provided, filter by it; otherwise try all operators
      let candidates = operadores;
      if (rawIdentifier) {
        const normalizedCode = normalizeOperatorCode(rawIdentifier);
        candidates = operadores.filter(op =>
          (normalizedCode && op.codigo_acesso === normalizedCode) || slugify(op.nome) === rawIdentifier
        );
      }

      if (candidates.length === 0) {
        return new Response(JSON.stringify({ error: "Operador não encontrado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let operador = null;
      for (const op of candidates) {
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

      await supabase.from("operadores").update({
        sessao_ativa: true,
        ultimo_acesso: new Date().toISOString(),
      }).eq("id", operador.id);

      const sessionToken = crypto.randomUUID();

      return new Response(JSON.stringify({
        success: true,
        operador: {
          id: operador.id,
          nome: operador.nome,
          email: operador.email,
          codigo_acesso: operador.codigo_acesso,
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

    // CRIAR OPERADOR
    if (action === "criar") {
      const { nome, senha, perfil } = params;
      if (!nome || !senha) {
        return new Response(JSON.stringify({ error: "Nome e senha obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { hash, salt } = await hashPassword(senha);
      const senhaHash = `${salt}:${hash}`;
      const codigoAcesso = await generateUniqueOperatorCode(supabase);

      const { data, error } = await supabase.from("operadores").insert({
        nome,
        email: "",
        codigo_acesso: codigoAcesso,
        senha_hash: senhaHash,
        perfil: perfil || "operador",
        status: "ativo",
      }).select("id, nome, email, codigo_acesso, perfil, status, created_at").single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, operador: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // EXCLUIR OPERADOR (soft delete — preserva histórico para restauração)
    if (action === "excluir") {
      const { operadorId, hard } = params;
      if (!operadorId) {
        return new Response(JSON.stringify({ error: "operadorId obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (hard === true) {
        const { error } = await supabase.from("operadores").delete().eq("id", operadorId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("operadores").update({
          status: "excluido",
          sessao_ativa: false,
        }).eq("id", operadorId);
        if (error) throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LISTAR ARQUIVADOS — operadores com status=excluido + IDs órfãos detectados em pagamentos/reservas
    if (action === "listar_arquivados") {
      const { data: excluidos } = await supabase
        .from("operadores")
        .select("id, nome, codigo_acesso, perfil, status, created_at")
        .eq("status", "excluido");

      const { data: ativos } = await supabase.from("operadores").select("id");
      const ativosSet = new Set((ativos || []).map((o: any) => o.id));

      const { data: pgs } = await supabase
        .from("pagamentos")
        .select("operador_id, codigo_reserva, created_at")
        .not("operador_id", "is", null);
      const { data: rsv } = await supabase
        .from("reservas")
        .select("operador_id, codigo_reserva, created_at")
        .not("operador_id", "is", null);

      const orphanMap: Record<string, { operador_id: string; pagamentos: number; reservas: number; ultima_atividade: string; exemplo_codigo: string }> = {};
      const bump = (id: string, key: "pagamentos" | "reservas", created_at: string, codigo: string) => {
        if (!id || ativosSet.has(id)) return;
        if (!orphanMap[id]) orphanMap[id] = { operador_id: id, pagamentos: 0, reservas: 0, ultima_atividade: created_at, exemplo_codigo: codigo };
        orphanMap[id][key] += 1;
        if (created_at > orphanMap[id].ultima_atividade) orphanMap[id].ultima_atividade = created_at;
      };
      for (const p of pgs || []) bump(p.operador_id as string, "pagamentos", p.created_at as string, p.codigo_reserva as string);
      for (const r of rsv || []) bump(r.operador_id as string, "reservas", r.created_at as string, r.codigo_reserva as string);

      // Remove orphans that are actually still in operadores list (excluidos status)
      const excluidosIds = new Set((excluidos || []).map((o: any) => o.id));
      const orfaos = Object.values(orphanMap).filter((o) => !excluidosIds.has(o.operador_id));

      // Para excluidos, contar dados também
      const excluidosEnriched = (excluidos || []).map((op: any) => {
        const stats = orphanMap[op.id] || { pagamentos: 0, reservas: 0, ultima_atividade: op.created_at };
        return { ...op, pagamentos: stats.pagamentos, reservas: stats.reservas, ultima_atividade: stats.ultima_atividade };
      });

      return new Response(JSON.stringify({ success: true, excluidos: excluidosEnriched, orfaos }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESTAURAR — reativa operador soft-deleted OU recria operador a partir de órfão e religa dados
    if (action === "restaurar") {
      const { operadorId, nome, senha, perfil } = params;
      if (!operadorId) {
        return new Response(JSON.stringify({ error: "operadorId obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Caso 1: operador existe (soft-deleted) → reativa, opcionalmente troca senha/nome
      const { data: existing } = await supabase
        .from("operadores")
        .select("id")
        .eq("id", operadorId)
        .maybeSingle();

      if (existing) {
        const updates: any = { status: "ativo" };
        if (nome) updates.nome = nome;
        if (senha) {
          const { hash, salt } = await hashPassword(senha);
          updates.senha_hash = `${salt}:${hash}`;
        }
        if (perfil) updates.perfil = perfil;
        const { error } = await supabase.from("operadores").update(updates).eq("id", operadorId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, operadorId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Caso 2: órfão — precisa nome + senha para recriar
      if (!nome || !senha) {
        return new Response(JSON.stringify({ error: "Para restaurar este operador informe nome e senha" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { hash, salt } = await hashPassword(senha);
      const senhaHash = `${salt}:${hash}`;
      const codigoAcesso = await generateUniqueOperatorCode(supabase);

      // Tenta recriar com o MESMO id antigo, para religar pagamentos/reservas automaticamente
      const { data: novo, error: insErr } = await supabase.from("operadores").insert({
        id: operadorId,
        nome,
        email: "",
        codigo_acesso: codigoAcesso,
        senha_hash: senhaHash,
        perfil: perfil || "operador",
        status: "ativo",
      }).select("id, nome, codigo_acesso, perfil, status").single();

      if (insErr) throw insErr;

      return new Response(JSON.stringify({ success: true, operador: novo }), {
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
        .select("id, nome, email, codigo_acesso, perfil, status, ultimo_acesso, sessao_ativa, created_at")
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
