import { useState, useEffect, useCallback } from "react";
import { Link2, Copy, Check, Eye, ExternalLink, Search, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PagamentoLink {
  id: string;
  token: string;
  codigo_reserva: string;
  valor: string;
  status: string;
  companhia: string;
  origem: string;
  destino: string;
  created_at: string;
  passageiros: any[];
}

const PaymentLinksBlock = () => {
  const [links, setLinks] = useState<PagamentoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewerCounts, setViewerCounts] = useState<Record<string, number>>({});

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("id, token, codigo_reserva, valor, status, companhia, origem, destino, created_at, passageiros")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setLinks((data || []) as PagamentoLink[]);
    } catch {
      toast.error("Erro ao carregar links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  // Realtime for pagamentos updates
  useEffect(() => {
    const channel = supabase
      .channel("pagamentos-links-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "pagamentos" }, () => fetchLinks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLinks]);

  // Track presence for each link
  useEffect(() => {
    if (links.length === 0) return;
    const channels = links.map((link) => {
      const ch = supabase.channel(`payment-view:${link.token}`);
      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState();
        setViewerCounts((prev) => ({ ...prev, [link.token]: Object.keys(state).length }));
      });
      ch.subscribe();
      return ch;
    });
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
  }, [links]);

  const copyLink = (token: string, id: string) => {
    const link = `${window.location.origin}/boarding-pass?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pendente": return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-[10px]">Pendente</Badge>;
      case "pago": return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">Pago</Badge>;
      case "confirmado": return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">Confirmado</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const filtered = links.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const mainName = (l.passageiros?.[0] as any)?.nomeCompleto || (l.passageiros?.[0] as any)?.nome || "";
    return l.codigo_reserva.toLowerCase().includes(q) || mainName.toLowerCase().includes(q) || l.companhia.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" /> Links de Pagamento
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 w-40" />
          </div>
          <Button variant="outline" size="sm" onClick={fetchLinks} disabled={loading} className="h-9 w-9 p-0">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center">
          <Link2 className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum link gerado</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filtered.map((l) => {
            const mainName = (l.passageiros?.[0] as any)?.nomeCompleto || (l.passageiros?.[0] as any)?.nome || "—";
            const viewers = viewerCounts[l.token] || 0;
            return (
              <div key={l.id} className="rounded-lg border border-border p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">{mainName}</span>
                      {statusBadge(l.status)}
                      {viewers > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
                          <Eye className="h-3 w-3" /> {viewers}
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{l.codigo_reserva || "—"}</span>
                      <span>•</span>
                      <span>{l.origem} → {l.destino}</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">R$ {l.valor}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(l.token, l.id)}
                      className="h-8 gap-1 text-xs"
                    >
                      {copiedId === l.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      {copiedId === l.id ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(`/boarding-pass?token=${l.token}`, "_blank")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentLinksBlock;
