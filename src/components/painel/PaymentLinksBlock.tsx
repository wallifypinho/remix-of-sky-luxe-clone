import { useState, useEffect, useCallback } from "react";
import { Link2, Copy, Check, Eye, ExternalLink, Search, RefreshCw, Loader2, Plus, DollarSign, ChevronDown, ChevronUp, Mail, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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
  codigo_pix: string | null;
}

const PaymentLinksBlock = () => {
  const [links, setLinks] = useState<PagamentoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewerCounts, setViewerCounts] = useState<Record<string, number>>({});
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [taxaOpenId, setTaxaOpenId] = useState<string | null>(null);
  const [taxaValor, setTaxaValor] = useState("");
  const [taxaPix, setTaxaPix] = useState("");
  const [taxaMotivo, setTaxaMotivo] = useState("");
  const [taxaSaving, setTaxaSaving] = useState(false);
  const [editPixId, setEditPixId] = useState<string | null>(null);
  const [editPixValue, setEditPixValue] = useState("");
  const [savingPix, setSavingPix] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("id, token, codigo_reserva, valor, status, companhia, origem, destino, created_at, passageiros, codigo_pix")
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

  useEffect(() => {
    const channel = supabase
      .channel("pagamentos-links-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "pagamentos" }, () => fetchLinks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLinks]);

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

  const copyPix = (pix: string, id: string) => {
    navigator.clipboard.writeText(pix);
    setCopiedId(`pix-${id}`);
    toast.success("PIX copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendEmail = async (l: PagamentoLink) => {
    const mainP = l.passageiros?.[0] as any;
    if (!mainP?.email) {
      toast.error("Passageiro sem e-mail cadastrado");
      return;
    }
    setSendingEmailId(l.id);
    try {
      const link = `${window.location.origin}/boarding-pass?token=${l.token}`;
      const { data, error } = await supabase.functions.invoke("send-reservation-email", {
        body: {
          type: "payment",
          codigoReserva: l.codigo_reserva,
          passageiros: l.passageiros,
          valor: l.valor,
          linkPagamento: link,
        },
      });
      if (error) throw error;
      toast.success(`E-mail enviado para ${mainP.email}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar e-mail");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleAddTaxa = async (pagamentoId: string) => {
    if (!taxaValor) {
      toast.error("Informe o valor da taxa");
      return;
    }
    setTaxaSaving(true);
    try {
      const taxaInfo = `---TAXA---\nValor: R$ ${taxaValor}\nPIX: ${taxaPix}\nMotivo: ${taxaMotivo}\nData: ${new Date().toLocaleString("pt-BR")}`;
      
      // Get current descricao and append taxa
      const current = links.find(l => l.id === pagamentoId);
      const { error } = await supabase
        .from("pagamentos")
        .update({
          descricao: current?.codigo_pix ? taxaInfo : taxaInfo,
          status: "taxa_pendente",
          codigo_pix: taxaPix || current?.codigo_pix,
        })
        .eq("id", pagamentoId);
      
      if (error) throw error;
      toast.success("Taxa adicionada com sucesso!");
      setTaxaOpenId(null);
      setTaxaValor("");
      setTaxaPix("");
      setTaxaMotivo("");
      fetchLinks();
    } catch (err: any) {
      toast.error("Erro ao adicionar taxa: " + (err.message || "Tente novamente"));
    } finally {
      setTaxaSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pendente": return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-[10px]">Pendente</Badge>;
      case "pago": return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">Pago</Badge>;
      case "confirmado": return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">Confirmado</Badge>;
      case "taxa_pendente": return <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/10 text-[10px]">Taxa Pendente</Badge>;
      case "taxa_paga": return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">Taxa Paga</Badge>;
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
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map((l) => {
            const mainName = (l.passageiros?.[0] as any)?.nomeCompleto || (l.passageiros?.[0] as any)?.nome || "—";
            const viewers = viewerCounts[l.token] || 0;
            const isTaxaOpen = taxaOpenId === l.id;

            return (
              <div key={l.id} className="rounded-lg border border-border overflow-hidden">
                <div className="p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="font-mono">{l.codigo_reserva || "—"}</span>
                        <span>•</span>
                        <span>{l.origem} → {l.destino}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary">R$ {l.valor}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => copyLink(l.token, l.id)} className="h-8 gap-1 text-xs">
                        {copiedId === l.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                        {copiedId === l.id ? "Copiado" : "Copiar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        disabled={sendingEmailId === l.id}
                        onClick={() => handleSendEmail(l)}
                        title="Enviar e-mail com boarding pass"
                      >
                        {sendingEmailId === l.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                        E-mail
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(`/boarding-pass?token=${l.token}`, "_blank")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* PIX copy + Taxa button row */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    {l.codigo_pix && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPix(l.codigo_pix!, `pix-${l.id}`)}
                        className="h-7 gap-1 text-[10px]"
                      >
                        {copiedId === `pix-${l.id}` ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                        {copiedId === `pix-${l.id}` ? "PIX Copiado" : "Copiar PIX"}
                      </Button>
                    )}
                    <Button
                      variant={isTaxaOpen ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setTaxaOpenId(isTaxaOpen ? null : l.id)}
                      className="h-7 gap-1 text-[10px] ml-auto"
                    >
                      <DollarSign className="h-3 w-3" />
                      Adicionar Taxa
                      {isTaxaOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Taxa Form */}
                <AnimatePresence>
                  {isTaxaOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 bg-muted/10 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <DollarSign className="h-3.5 w-3.5" /> Taxa Adicional
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Valor da Taxa (R$) *</Label>
                            <Input
                              placeholder="Ex: 150,00"
                              value={taxaValor}
                              onChange={(e) => setTaxaValor(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Motivo da Taxa</Label>
                            <Input
                              placeholder="Ex: Taxa de embarque"
                              value={taxaMotivo}
                              onChange={(e) => setTaxaMotivo(e.target.value)}
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">PIX da Taxa</Label>
                          <Textarea
                            placeholder="Cole o código PIX para a taxa"
                            value={taxaPix}
                            onChange={(e) => setTaxaPix(e.target.value)}
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                        <Button
                          onClick={() => handleAddTaxa(l.id)}
                          disabled={taxaSaving || !taxaValor}
                          size="sm"
                          className="w-full h-9"
                        >
                          {taxaSaving ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Salvando...</>
                          ) : (
                            <><Plus className="h-3.5 w-3.5 mr-1" /> Gerar Taxa</>
                          )}
                        </Button>
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

export default PaymentLinksBlock;
