import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plane, ChevronDown, ChevronUp, AlertTriangle, Shield, Info, Copy, Check, Loader2, Lock, Download, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PagamentoData {
  id: string;
  token: string;
  passageiros: any[];
  origem: string;
  destino: string;
  companhia: string;
  numero_voo: string;
  classe: string;
  ida_data: string;
  ida_partida: string;
  ida_chegada: string;
  volta_data: string | null;
  volta_partida: string | null;
  volta_chegada: string | null;
  descricao: string | null;
  codigo_reserva: string;
  valor: string;
  whatsapp_cliente: string | null;
  codigo_pix: string | null;
  metodo_pagamento: string;
  status: string;
  whatsapp_operador: string | null;
  created_at: string;
}

const calcBoardingTime = (partida: string): string => {
  if (!partida || !partida.includes(":")) return partida;
  const [h, m] = partida.split(":").map(Number);
  const totalMin = h * 60 + m - 20;
  const bh = Math.floor(((totalMin + 1440) % 1440) / 60);
  const bm = (totalMin + 1440) % 60;
  return `${String(bh).padStart(2, "0")}:${String(bm).padStart(2, "0")}`;
};

const maskCpf = (cpf: string): string => {
  if (!cpf) return "—";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length < 6) return cpf;
  return `${clean.slice(0, 3)}.***.***.${clean.slice(-2)}`;
};

const BoardingPass = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData] = useState<PagamentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const fetchData = async () => {
      const { data: pg, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("token", token)
        .single();
      if (!error && pg) setData(pg as unknown as PagamentoData);
      setLoading(false);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const channel = supabase.channel(`payment-view:${token}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });
    return () => { supabase.removeChannel(channel); };
  }, [token]);

  const handleCopyPix = () => {
    if (data?.codigo_pix) {
      navigator.clipboard.writeText(data.codigo_pix);
      setPixCopiado(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setPixCopiado(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (data?.whatsapp_operador) {
      const msg = encodeURIComponent(`Olá! Segue o comprovante do pagamento da reserva ${data.codigo_reserva}.`);
      window.open(`https://wa.me/${data.whatsapp_operador}?text=${msg}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="text-center text-primary-foreground">
          <Plane className="h-12 w-12 mx-auto mb-4 opacity-60" />
          <h2 className="text-xl font-bold mb-2">Pagamento não encontrado</h2>
          <p className="text-sm opacity-70">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  const mainPassenger = data.passageiros?.[0] || {};
  const hasVolta = !!data.volta_data;
  const classeLabel = data.classe === "executiva" ? "Executiva" : data.classe === "primeira" ? "Primeira" : "Econômica";
  const isPendente = data.status === "pendente" || data.status === "taxa_pendente";

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col">

        {/* ── Blue header area ── */}
        <div className="px-5 pt-8 pb-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-primary-foreground/70 font-medium">
              {data.companhia || "Companhia"} ✈
            </span>
            <div className="text-right">
              <div className="text-xs text-primary-foreground/50 uppercase tracking-[0.2em] font-bold">
                {data.companhia || "AÉREA"}
              </div>
              <div className="text-sm font-bold text-primary-foreground italic">Premium</div>
            </div>
          </div>

          {/* Client */}
          <div>
            <div className="text-[10px] text-primary-foreground/40 uppercase tracking-[0.15em] font-semibold mb-0.5">Cliente</div>
            <div className="text-xl font-extrabold text-primary-foreground uppercase tracking-wide leading-tight">
              {mainPassenger.nomeCompleto || mainPassenger.nome || "—"}
            </div>
          </div>
        </div>

        {/* ── White card ── */}
        <div className="flex-1 rounded-t-[28px] bg-card shadow-[0_-8px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
          <div className="flex-1 px-6 pt-7 pb-4">
            <AnimatePresence mode="wait">
              {showPayment ? (
                /* ═══════ PAYMENT VIEW ═══════ */
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    ← Voltar ao bilhete
                  </button>

                  {/* Reservation */}
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Reserva</div>
                    <div className="text-sm font-bold text-foreground">
                      {mainPassenger.nomeCompleto || mainPassenger.nome || "—"}{" "}
                      <span className="text-primary font-mono tracking-wider">{data.codigo_reserva}</span>
                    </div>
                  </div>

                  {/* Details toggle */}
                  <button
                    onClick={() => setDetalhesAbertos(!detalhesAbertos)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    {detalhesAbertos ? "Fechar detalhes" : "Mais detalhes"}
                    {detalhesAbertos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  <AnimatePresence>
                    {detalhesAbertos && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-border p-3.5 space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Rota", value: `${data.origem} → ${data.destino}` },
                              { label: "Voo", value: data.numero_voo || "—" },
                              { label: "Data Ida", value: data.ida_data || "—" },
                              { label: "Classe", value: classeLabel },
                            ].map((item, i) => (
                              <div key={i}>
                                <div className="text-muted-foreground uppercase text-[10px]">{item.label}</div>
                                <div className="font-semibold text-foreground">{item.value}</div>
                              </div>
                            ))}
                          </div>
                          {data.passageiros.length > 1 && (
                            <div className="border-t border-border pt-2">
                              <div className="text-muted-foreground uppercase text-[10px] mb-1">Passageiros</div>
                              {data.passageiros.map((p: any, i: number) => (
                                <div key={i} className="text-foreground font-medium">{i + 1}. {p.nomeCompleto || p.nome || "—"}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Total */}
                  <div className="text-center py-2">
                    <div className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold mb-1">Total a pagar</div>
                    <div className="text-4xl font-extrabold text-foreground">R$ {data.valor}</div>
                  </div>

                  {/* QR Code PIX */}
                  {data.codigo_pix && (
                    <div className="space-y-4">
                      <div className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold">
                        QR Code PIX
                      </div>
                      <div className="flex justify-center">
                        <div className="bg-card border-2 border-primary/15 p-5 rounded-2xl shadow-lg">
                          <QRCodeSVG value={data.codigo_pix} size={180} />
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">Escaneie para pagar via PIX</p>

                      <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <p className="text-[10px] text-muted-foreground font-mono break-all leading-relaxed line-clamp-3">
                          {data.codigo_pix}
                        </p>
                      </div>

                      <Button onClick={handleCopyPix} className="w-full h-12 text-sm font-bold rounded-xl">
                        {pixCopiado ? (
                          <><Check className="h-4 w-4 mr-2" /> Código Copiado!</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-2" /> Copiar Código PIX</>
                        )}
                      </Button>
                    </div>
                  )}

                  {data.whatsapp_operador && (
                    <Button
                      onClick={handleWhatsApp}
                      variant="outline"
                      className="w-full h-12 text-sm font-bold rounded-xl border-success text-success hover:bg-success/10"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar comprovante via WhatsApp
                    </Button>
                  )}

                  <Button variant="outline" onClick={() => window.print()} className="w-full h-12 text-sm font-bold rounded-xl">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Bilhete em PDF
                  </Button>

                  {/* Security */}
                  <div className="text-center space-y-3 pt-2 pb-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      Pagamento 100% Seguro
                    </div>
                    <div className="flex justify-center gap-4">
                      {[
                        { icon: "🔐", label: "Criptografia\nponta a ponta" },
                        { icon: "✅", label: "Verificação\nautomática" },
                        { icon: "🛡️", label: "Proteção\ncertificada" },
                      ].map((b, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-20">
                          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-sm">{b.icon}</div>
                          <span className="text-[9px] text-muted-foreground text-center whitespace-pre-line leading-tight">{b.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                      <span>🔒 SSL</span>
                      <span>✓ PCI</span>
                      <span>🏛️ LGPD</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ═══════ BOARDING PASS VIEW ═══════ */
                <motion.div
                  key="boarding"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Route */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="text-[32px] font-black text-foreground tracking-wide leading-none">{data.origem || "—"}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Origem</div>
                    </div>
                    <div className="flex flex-col items-center pt-1.5">
                      <Plane className="h-5 w-5 text-primary rotate-0" />
                      <div className="text-[10px] text-muted-foreground mt-1">Voo {data.numero_voo || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[32px] font-black text-foreground tracking-wide leading-none">{data.destino || "—"}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Destino</div>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex justify-between mb-1">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Partida</div>
                      <div className="text-[36px] font-extrabold text-foreground leading-none mt-0.5">{data.ida_partida || "--:--"}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{data.ida_data || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Chegada</div>
                      <div className="text-[36px] font-extrabold text-foreground leading-none mt-0.5">{data.ida_chegada || "--:--"}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{data.ida_data || "—"}</div>
                    </div>
                  </div>

                  {/* Boarding time */}
                  <div className="mb-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Início Embarque</div>
                    <div className="text-2xl font-extrabold text-foreground leading-none mt-0.5">{calcBoardingTime(data.ida_partida)}</div>
                  </div>

                  {/* Gate + QR side by side */}
                  <div className="flex justify-between items-end mb-5">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Portão</div>
                      <div className="text-xl font-extrabold text-foreground leading-none mt-0.5">—</div>
                    </div>
                    <div className="bg-muted/20 p-2.5 rounded-xl">
                      <QRCodeSVG value={data.codigo_reserva || "BOARDING"} size={90} />
                    </div>
                  </div>

                  {/* Volta card */}
                  {hasVolta && (
                    <div className="rounded-xl border border-border p-3.5 mb-5 bg-muted/5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-2">
                        <Plane className="h-3.5 w-3.5" />
                        VOLTA
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Data</div>
                          <div className="font-bold text-foreground">{data.volta_data}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Partida</div>
                          <div className="font-bold text-foreground">{data.volta_partida || "--:--"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Chegada</div>
                          <div className="font-bold text-foreground">{data.volta_chegada || "--:--"}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket tear divider */}
                  <div className="relative flex items-center my-5">
                    <div className="absolute -left-6 w-5 h-5 rounded-full bg-primary z-10" />
                    <div className="flex-1 border-t-2 border-dashed border-border mx-1" />
                    <div className="absolute -right-6 w-5 h-5 rounded-full bg-primary z-10" />
                  </div>

                  {/* Seat + Embarque prioritário */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-6">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Assento</div>
                        <div className="text-lg font-extrabold text-foreground">{(mainPassenger as any)?.assento || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Seção</div>
                        <div className="text-lg font-extrabold text-foreground">{(mainPassenger as any)?.secao || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[11px] font-semibold text-primary">Embarque prioritário</span>
                    </div>
                  </div>

                  {/* More details */}
                  <button
                    onClick={() => setDetalhesAbertos(!detalhesAbertos)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
                  >
                    <Info className="h-4 w-4" />
                    {detalhesAbertos ? "Fechar detalhes" : "Mais detalhes"}
                    {detalhesAbertos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  <AnimatePresence>
                    {detalhesAbertos && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-5"
                      >
                        <div className="space-y-3">
                          {/* Passenger data */}
                          <div className="rounded-xl border border-border p-4">
                            <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                              👤 Dados do Passageiro
                            </h4>
                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                              {[
                                { label: "Nome", value: mainPassenger.nomeCompleto || mainPassenger.nome || "—" },
                                { label: "CPF", value: maskCpf(mainPassenger.cpfDocumento || mainPassenger.cpf || "") },
                                { label: "Companhia", value: data.companhia || "—" },
                                { label: "Voo", value: data.numero_voo || "—" },
                                { label: "Classe", value: classeLabel },
                                { label: "Reserva", value: data.codigo_reserva || "—", highlight: true },
                              ].map((item, i) => (
                                <div key={i}>
                                  <div className="text-[10px] text-muted-foreground uppercase">{item.label}</div>
                                  <div className={`font-semibold ${item.highlight ? "text-primary" : "text-foreground"}`}>{item.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Return flight */}
                          {hasVolta && (
                            <div className="rounded-xl border border-border p-4">
                              <h4 className="text-xs font-bold text-foreground mb-3">✈️ Voo de Volta</h4>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <div className="text-[10px] text-muted-foreground uppercase">Data</div>
                                  <div className="font-semibold text-foreground">{data.volta_data}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-muted-foreground uppercase">Partida</div>
                                  <div className="font-semibold text-foreground">{data.volta_partida || "--:--"}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-muted-foreground uppercase">Chegada</div>
                                  <div className="font-semibold text-foreground">{data.volta_chegada || "--:--"}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Extra info */}
                          <div className="rounded-xl border border-border p-4">
                            <h4 className="text-xs font-bold text-foreground mb-3">ℹ️ Informações Adicionais</h4>
                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                              {[
                                { label: "Tipo de Tarifa", value: "Promo" },
                                { label: "Bagagem", value: "🧳 23kg" },
                                { label: "Bag. de Mão", value: "1x até 10kg" },
                                { label: "Classe", value: classeLabel },
                              ].map((item, i) => (
                                <div key={i}>
                                  <div className="text-[10px] text-muted-foreground uppercase">{item.label}</div>
                                  <div className="font-semibold text-foreground">{item.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Multiple passengers */}
                          {data.passageiros.length > 1 && (
                            <div className="rounded-xl border border-border p-4">
                              <h4 className="text-xs font-bold text-foreground mb-3">
                                👥 Passageiros ({data.passageiros.length})
                              </h4>
                              {data.passageiros.map((p: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {i + 1}
                                  </div>
                                  <div className="flex-1 text-xs">
                                    <div className="font-semibold text-foreground">{p.nomeCompleto || p.nome || "—"}</div>
                                    <div className="text-muted-foreground">CPF: {maskCpf(p.cpfDocumento || p.cpf || "")}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment pending */}
                  {isPendente && (
                    <div className="mb-4">
                      <button
                        onClick={() => { setShowPayment(true); setDetalhesAbertos(false); }}
                        className="w-full rounded-xl bg-warning/10 border border-warning/25 py-3.5 flex items-center justify-center gap-2 hover:bg-warning/15 transition-colors active:scale-[0.98]"
                      >
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-bold text-warning">Pendência no pagamento</span>
                      </button>
                      <p className="text-[10px] text-center text-muted-foreground mt-2.5 px-2 leading-relaxed">
                        ⚠ Os assentos reservados podem ser disponibilizados a outros viajantes caso exceda o prazo de sua reserva.
                      </p>
                    </div>
                  )}

                  {data.status === "pago" && (
                    <div className="rounded-xl border border-success/30 p-4 text-center mb-4 bg-success/5">
                      <span className="text-success font-bold text-sm">✅ Pagamento confirmado!</span>
                    </div>
                  )}

                  {data.status === "taxa_paga" && (
                    <div className="rounded-xl border border-success/30 p-4 text-center mb-4 bg-success/5">
                      <span className="text-success font-bold text-sm">✅ Todos os pagamentos confirmados!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="bg-primary px-6 py-3.5 text-center mt-auto">
            <div className="text-xs font-bold text-primary-foreground tracking-wide">
              Pagamento processado com segurança
            </div>
            <div className="text-[10px] text-primary-foreground/50 mt-0.5">
              Transação protegida · Dados criptografados
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardingPass;
