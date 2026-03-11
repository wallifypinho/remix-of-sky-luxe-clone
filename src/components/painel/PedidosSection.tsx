import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Copy, Check, ChevronDown, ChevronUp, Loader2, RefreshCw, CreditCard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Reserva {
  id: string;
  codigo_reserva: string;
  adultos: number;
  criancas: number;
  bebes: number;
  passageiros: any[];
  assentos: string[];
  metodo_pagamento: string;
  status: string;
  created_at: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "pendente": return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/10">Pendente</Badge>;
    case "confirmado": return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10">Confirmado</Badge>;
    case "cancelado": return <Badge variant="destructive">Cancelado</Badge>;
    case "pago": return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10">Pago</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const PedidosSection = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setReservas((data || []) as Reserva[]);
    } catch {
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservas(); }, [fetchReservas]);

  const sexoLabel = (s: string) => {
    if (s === "masculino") return "Masculino";
    if (s === "feminino") return "Feminino";
    return "—";
  };

  const copyPedido = (r: Reserva) => {
    const passageirosText = (r.passageiros || []).map((p: any, i: number) => {
      return [
        `Passageiro ${i + 1}: ${p.nomeCompleto || p.nome || "—"}`,
        `  CPF: ${p.cpf || p.cpfDocumento || "—"}`,
        `  Nascimento: ${p.dataNascimento || "—"}`,
        `  Sexo: ${sexoLabel(p.sexo || "")}`,
        `  Telefone: ${p.telefone || "—"}`,
        `  Email: ${p.email || "—"}`,
      ].join("\n");
    }).join("\n\n");

    const text = [
      `Código: ${r.codigo_reserva}`,
      `Status: ${r.status}`,
      `Data: ${new Date(r.created_at).toLocaleString("pt-BR")}`,
      `Adultos: ${r.adultos} | Crianças: ${r.criancas} | Bebês: ${r.bebes}`,
      `Assentos: ${(r.assentos || []).join(", ") || "Nenhum"}`,
      `Pagamento: ${r.metodo_pagamento}`,
      "",
      passageirosText,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopiedId(r.id);
    toast.success("Dados copiados!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = reservas.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.codigo_reserva.toLowerCase().includes(q) ||
      (r.passageiros || []).some((p: any) =>
        (p.nomeCompleto || p.nome || "").toLowerCase().includes(q) ||
        (p.cpf || p.cpfDocumento || "").includes(q) ||
        (p.email || "").toLowerCase().includes(q)
      );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">Pedidos</h3>
          <Badge variant="outline" className="text-xs">{reservas.length} total</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-8 w-48"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchReservas} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <ClipboardList className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const mainP = r.passageiros?.[0] as any;
            const isExpanded = expandedId === r.id;

            return (
              <div key={r.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {mainP?.nomeCompleto || mainP?.nome || "Sem nome"}
                      </span>
                      {statusBadge(r.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{r.codigo_reserva}</span>
                      <span>•</span>
                      <span>{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                      <span>•</span>
                      <span>{r.adultos + r.criancas + r.bebes} pax</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); copyPedido(r); }}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === r.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="px-4 py-4 space-y-4">
                        {/* Summary grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Código</p>
                            <p className="text-sm font-mono font-bold text-primary">{r.codigo_reserva}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                            <p className="text-sm">{statusBadge(r.status)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Pagamento</p>
                            <p className="text-sm font-medium text-foreground uppercase">{r.metodo_pagamento}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Adultos</p>
                            <p className="text-sm font-medium text-foreground">{r.adultos}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Crianças</p>
                            <p className="text-sm font-medium text-foreground">{r.criancas}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Bebês</p>
                            <p className="text-sm font-medium text-foreground">{r.bebes}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Assentos</p>
                            <p className="text-sm font-medium text-foreground">{(r.assentos || []).join(", ") || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Data</p>
                            <p className="text-sm font-medium text-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</p>
                          </div>
                        </div>

                        {/* Passengers */}
                        <div>
                          <p className="text-xs font-bold text-primary uppercase mb-2">Passageiros ({(r.passageiros || []).length})</p>
                          <div className="space-y-2">
                            {(r.passageiros || []).map((p: any, i: number) => (
                              <div key={i} className="rounded-lg border border-border p-3 bg-muted/20">
                                <p className="font-semibold text-sm text-foreground">{p.nomeCompleto || p.nome || "—"}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                                  <p className="text-xs text-muted-foreground">CPF: {p.cpf || p.cpfDocumento || "—"}</p>
                                  <p className="text-xs text-muted-foreground">Nasc: {p.dataNascimento || "—"}</p>
                                  <p className="text-xs text-muted-foreground">Sexo: {sexoLabel(p.sexo || "")}</p>
                                  <p className="text-xs text-muted-foreground">Tel: {p.telefone || "—"}</p>
                                  <p className="text-xs text-muted-foreground col-span-2">Email: {p.email || "—"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPedido(r)}
                            className="flex-1"
                          >
                            {copiedId === r.id ? <><Check className="h-3.5 w-3.5 mr-1" /> Copiado</> : <><Copy className="h-3.5 w-3.5 mr-1" /> Copiar Dados</>}
                          </Button>
                          <Button size="sm" className="flex-1">
                            <CreditCard className="h-3.5 w-3.5 mr-1" /> Gerar Pagamento
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PedidosSection;
