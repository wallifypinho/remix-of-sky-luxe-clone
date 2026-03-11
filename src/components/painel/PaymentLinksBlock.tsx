import { useState, useEffect, useCallback } from "react";
import { Link2, Copy, Check, Eye, ExternalLink, Search, RefreshCw, Loader2, Plus, DollarSign, ChevronDown, ChevronUp, Mail, Pencil, Save, CreditCard, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import BoardingPassViewer from "./BoardingPassViewer";

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
  numero_voo: string;
  classe: string;
  ida_data: string;
  ida_partida: string;
  ida_chegada: string;
  volta_data: string | null;
  volta_partida: string | null;
  volta_chegada: string | null;
  assentos?: string[];
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
  const [viewBoardingPass, setViewBoardingPass] = useState<PagamentoLink | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("id, token, codigo_reserva, valor, status, companhia, origem, destino, created_at, passageiros, codigo_pix, numero_voo, classe, ida_data, ida_partida, ida_chegada, volta_data, volta_partida, volta_chegada")
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

  const handleSendBoardingPass = async (l: PagamentoLink) => {
    const mainP = l.passageiros?.[0] as any;
    if (!mainP?.email) {
      toast.error("Passageiro sem e-mail cadastrado");
      return;
    }
    setSendingEmailId(l.id);
    try {
      const link = `${window.location.origin}/boarding-pass?token=${l.token}`;
      const { error } = await supabase.functions.invoke("send-reservation-email", {
        body: {
          type: "boarding_pass",
          codigoReserva: l.codigo_reserva,
          passageiros: l.passageiros,
          companhia: l.companhia,
          origem: l.origem,
          destino: l.destino,
          numeroVoo: l.numero_voo,
          classe: l.classe,
          idaData: l.ida_data,
          idaPartida: l.ida_partida,
          idaChegada: l.ida_chegada,
          voltaData: l.volta_data,
          voltaPartida: l.volta_partida,
          voltaChegada: l.volta_chegada,
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
      const current = links.find(l => l.id === pagamentoId);
      const { error } = await supabase
        .from("pagamentos")
        .update({
          descricao: taxaInfo,
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
    const base = "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border";
    switch (status) {
      case "pendente": return <span className={`${base} bg-warning/10 text-warning border-warning/20`}>Pendente</span>;
      case "pago": return <span className={`${base} bg-success/10 text-success border-success/20`}>Pago</span>;
      case "confirmado": return <span className={`${base} bg-success/10 text-success border-success/20`}>Confirmado</span>;
      case "taxa_pendente": return <span className={`${base} bg-accent/10 text-accent-foreground border-accent/20`}>Taxa Pendente</span>;
      case "taxa_paga": return <span className={`${base} bg-success/10 text-success border-success/20`}>Taxa Paga</span>;
      default: return <span className={`${base} bg-muted text-muted-foreground border-border`}>{status}</span>;
    }
  };

  const filtered = links.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const mainName = (l.passageiros?.[0] as any)?.nomeCompleto || (l.passageiros?.[0] as any)?.nome || "";
    return l.codigo_reserva.toLowerCase().includes(q) || mainName.toLowerCase().includes(q) || l.companhia.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Link2 className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground">Links de Pagamento</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 w-36 sm:w-44 rounded-xl text-xs bg-muted/30 border-border/50 focus:bg-card"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchLinks} disabled={loading} className="h-9 w-9 rounded-xl border-border/50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-2">Carregando links...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
          <Link2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Nenhum link encontrado</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-0.5">
          {filtered.map((l, i) => {
            const mainName = (l.passageiros?.[0] as any)?.nomeCompleto || (l.passageiros?.[0] as any)?.nome || "—";
            const viewers = viewerCounts[l.token] || 0;
            const isTaxaOpen = taxaOpenId === l.id;

            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm"
              >
                <div className="p-4 space-y-3">
                  {/* Status + Viewers */}
                  <div className="flex items-center justify-between">
                    {statusBadge(l.status)}
                    {viewers > 0 && (
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                        <Eye className="h-3.5 w-3.5" /> {viewers}
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Reservation code */}
                  <p className="font-mono text-sm font-bold text-foreground tracking-wide">{l.codigo_reserva}</p>

                  {/* Action buttons row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(l.token, l.id)}
                      className="h-9 gap-1.5 text-xs rounded-xl border-border/60 font-medium"
                    >
                      {copiedId === l.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === l.id ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewBoardingPass(l)}
                      className="h-9 gap-1.5 text-xs rounded-xl border-border/60 font-medium"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Cartão
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={sendingEmailId === l.id}
                      onClick={() => handleSendBoardingPass(l)}
                      className="h-9 gap-1.5 text-xs rounded-xl border-border/60 font-medium"
                    >
                      {sendingEmailId === l.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                      E-mail
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl ml-auto"
                      onClick={() => window.open(`/boarding-pass?token=${l.token}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Route + Value */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{l.origem}</span>
                      <Plane className="h-3 w-3 text-primary rotate-45" />
                      <span className="font-semibold text-foreground">{l.destino}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">R$ {l.valor}</span>
                  </div>

                  {/* Passenger */}
                  {mainName !== "—" && (
                    <p className="text-xs text-muted-foreground">
                      • {mainName} · {l.passageiros?.length || 1} pax
                    </p>
                  )}
                </div>

                {/* PIX + Taxa section */}
                <div className="border-t border-border/40 px-4 py-3 bg-muted/5 space-y-2">
                  {editPixId === l.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editPixValue}
                        onChange={(e) => setEditPixValue(e.target.value)}
                        rows={2}
                        className="text-xs resize-none rounded-xl"
                        placeholder="Cole o código PIX..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={savingPix}
                          onClick={async () => {
                            setSavingPix(true);
                            try {
                              const { error } = await supabase
                                .from("pagamentos")
                                .update({ codigo_pix: editPixValue })
                                .eq("id", l.id);
                              if (error) throw error;
                              toast.success("PIX atualizado!");
                              setEditPixId(null);
                              fetchLinks();
                            } catch {
                              toast.error("Erro ao salvar PIX");
                            } finally {
                              setSavingPix(false);
                            }
                          }}
                          className="h-8 gap-1.5 text-xs rounded-xl flex-1"
                        >
                          {savingPix ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          Salvar PIX
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditPixId(null)} className="h-8 text-xs rounded-xl">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {l.codigo_pix && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPix(l.codigo_pix!, `pix-${l.id}`)}
                          className="h-8 gap-1.5 text-xs rounded-xl border-border/60"
                        >
                          {copiedId === `pix-${l.id}` ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                          Copiar PIX
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditPixId(l.id); setEditPixValue(l.codigo_pix || ""); }}
                        className="h-8 gap-1.5 text-xs rounded-xl border-border/60"
                      >
                        <Pencil className="h-3 w-3" />
                        {l.codigo_pix ? "Editar PIX" : "Add PIX"}
                      </Button>
                      <Button
                        variant={isTaxaOpen ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setTaxaOpenId(isTaxaOpen ? null : l.id)}
                        className="h-8 gap-1.5 text-xs rounded-xl border-border/60 ml-auto"
                      >
                        <DollarSign className="h-3 w-3" />
                        Adicionar Taxa
                        {isTaxaOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Taxa Form */}
                <AnimatePresence>
                  {isTaxaOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-muted/10 border-t border-border/40 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <DollarSign className="h-3.5 w-3.5" /> Taxa Adicional
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground">Valor (R$) *</Label>
                            <Input
                              placeholder="Ex: 150,00"
                              value={taxaValor}
                              onChange={(e) => setTaxaValor(e.target.value)}
                              className="h-9 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground">Motivo</Label>
                            <Input
                              placeholder="Ex: Taxa de embarque"
                              value={taxaMotivo}
                              onChange={(e) => setTaxaMotivo(e.target.value)}
                              className="h-9 rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold text-muted-foreground">PIX da Taxa</Label>
                          <Textarea
                            placeholder="Cole o código PIX para a taxa"
                            value={taxaPix}
                            onChange={(e) => setTaxaPix(e.target.value)}
                            rows={2}
                            className="resize-none rounded-xl"
                          />
                        </div>
                        <Button
                          onClick={() => handleAddTaxa(l.id)}
                          disabled={taxaSaving || !taxaValor}
                          size="sm"
                          className="w-full h-10 rounded-xl font-semibold text-xs"
                        >
                          {taxaSaving ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Salvando...</>
                          ) : (
                            <><Plus className="h-3.5 w-3.5 mr-1.5" /> Gerar Taxa</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Boarding Pass Viewer Modal */}
      {viewBoardingPass && (
        <BoardingPassViewer
          data={{
            companhia: viewBoardingPass.companhia,
            origem: viewBoardingPass.origem,
            destino: viewBoardingPass.destino,
            numeroVoo: viewBoardingPass.numero_voo,
            classe: viewBoardingPass.classe,
            codigoReserva: viewBoardingPass.codigo_reserva,
            idaData: viewBoardingPass.ida_data,
            idaPartida: viewBoardingPass.ida_partida,
            idaChegada: viewBoardingPass.ida_chegada,
            voltaData: viewBoardingPass.volta_data,
            voltaPartida: viewBoardingPass.volta_partida,
            voltaChegada: viewBoardingPass.volta_chegada,
            passageiros: viewBoardingPass.passageiros,
            token: viewBoardingPass.token,
            valor: viewBoardingPass.valor,
          }}
          onClose={() => setViewBoardingPass(null)}
        />
      )}
    </div>
  );
};

export default PaymentLinksBlock;
