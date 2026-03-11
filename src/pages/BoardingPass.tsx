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
    <div className="min-h-screen bg-primary flex items-start justify-center py-0 px-0">
      <motion.div className="w-full max-w-sm min-h-screen flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Top bar */}
        <div className="px-5 pt-6 pb-4 flex items-start justify-between">
          <div>
            <div className="text-xs text-primary-foreground/50 tracking-wide">
              {data.companhia || "Companhia Aérea"} ✈
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-primary-foreground/60 tracking-widest uppercase">
              {data.companhia || "COMPANHIA AÉREA"}
            </div>
            <div className="text-sm font-bold text-primary-foreground italic">Premium</div>
          </div>
        </div>

        {/* Client name */}
        <div className="px-5 pb-4">
          <div className="text-[10px] text-primary-foreground/40 uppercase tracking-widest font-semibold">Cliente</div>
          <div className="text-lg font-bold text-primary-foreground uppercase tracking-wide">
            {mainPassenger.nomeCompleto || mainPassenger.nome || "—"}
          </div>
        </div>

        {/* White card */}
        <div className="flex-1 rounded-t-3xl bg-card shadow-2xl overflow-hidden flex flex-col">
          <div className="px-6 pt-8 pb-4 flex-1">

            {/* Payment View */}
            <AnimatePresence mode="wait">
              {showPayment ? (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-5"
                >
                  {/* Back to boarding pass */}
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    ← Voltar ao bilhete
                  </button>

                  {/* Reservation header */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Reserva</div>
                    <div className="text-sm font-bold text-foreground">
                      {mainPassenger.nomeCompleto || mainPassenger.nome || "—"}{" "}
                      <span className="text-primary font-mono tracking-wider">{data.codigo_reserva}</span>
                    </div>
                  </div>

                  {/* More details toggle */}
                  <button
                    onClick={() => setDetalhesAbertos(!detalhesAbertos)}
                    className="w-full flex items-center justify-center gap-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    {detalhesAbertos ? "Fechar detalhes" : "Mais detalhes"}
                    {detalhesAbertos ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {detalhesAbertos && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl border border-border p-3 space-y-2 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-muted-foreground uppercase text-[10px]">Rota</div>
                          <div className="font-semibold text-foreground">{data.origem} → {data.destino}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground uppercase text-[10px]">Voo</div>
                          <div className="font-semibold text-foreground">{data.numero_voo || "—"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground uppercase text-[10px]">Data Ida</div>
                          <div className="font-semibold text-foreground">{data.ida_data || "—"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground uppercase text-[10px]">Classe</div>
                          <div className="font-semibold text-foreground">{classeLabel}</div>
                        </div>
                      </div>
                      {data.passageiros.length > 1 && (
                        <div className="border-t border-border pt-2">
                          <div className="text-muted-foreground uppercase text-[10px] mb-1">Passageiros</div>
                          {data.passageiros.map((p: any, i: number) => (
                            <div key={i} className="text-foreground font-medium">{i + 1}. {p.nomeCompleto || p.nome || "—"}</div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Total */}
                  <div className="text-center">
                    <div className="text-xs text-primary uppercase tracking-widest font-semibold">Total a pagar</div>
                    <div className="text-4xl font-extrabold text-foreground mt-1">R$ {data.valor}</div>
                  </div>

                  {/* QR Code PIX */}
                  {data.codigo_pix && (
                    <div className="space-y-3">
                      <div className="text-center text-xs text-muted-foreground uppercase tracking-wider font-semibold">QR Code PIX</div>
                      <div className="flex justify-center">
                        <div className="bg-card border-2 border-primary/20 p-4 rounded-2xl shadow-lg">
                          <QRCodeSVG value={data.codigo_pix} size={180} />
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Escaneie para pagar via PIX
                      </p>

                      {/* PIX code text */}
                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="text-[10px] text-muted-foreground font-mono break-all leading-relaxed line-clamp-3">
                          {data.codigo_pix}
                        </p>
                      </div>

                      {/* Copy PIX button */}
                      <Button
                        onClick={handleCopyPix}
                        className="w-full h-12 text-sm font-bold rounded-xl"
                      >
                        {pixCopiado ? (
                          <><Check className="h-4 w-4 mr-2" /> Código Copiado!</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-2" /> Copiar Código PIX</>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* WhatsApp button */}
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

                  {/* Download button */}
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="w-full h-12 text-sm font-bold rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Bilhete em PDF
                  </Button>

                  {/* Security badges */}
                  <div className="text-center space-y-3 pt-2">
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
                          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-sm">
                            {b.icon}
                          </div>
                          <span className="text-[9px] text-muted-foreground text-center whitespace-pre-line leading-tight">{b.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                      <span>🔒 SSL Secured</span>
                      <span>✓ PCI Compliant</span>
                      <span>🏛️ LGPD</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="boarding"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="space-y-0"
                >
                  {/* Flight route */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-black text-foreground tracking-wider">{data.origem || "—"}</div>
                      <div className="text-xs text-muted-foreground">Origem</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Plane className="h-5 w-5 text-primary" />
                      <div className="text-[10px] text-muted-foreground">Voo {data.numero_voo || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-foreground tracking-wider">{data.destino || "—"}</div>
                      <div className="text-xs text-muted-foreground">Destino</div>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex justify-between mb-6">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase">Partida</div>
                      <div className="text-3xl font-bold text-foreground">{data.ida_partida || "--:--"}</div>
                      <div className="text-xs text-muted-foreground">{data.ida_data || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase">Chegada</div>
                      <div className="text-3xl font-bold text-foreground">{data.ida_chegada || "--:--"}</div>
                      <div className="text-xs text-muted-foreground">{data.ida_data || "—"}</div>
                    </div>
                  </div>

                  {/* Embarque & QR */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm space-y-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase">Início Embarque</div>
                        <div className="text-xl font-bold text-foreground">{calcBoardingTime(data.ida_partida)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase">Portão</div>
                        <div className="text-xl font-bold text-foreground">—</div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg shadow text-center">
                      <QRCodeSVG value={data.codigo_reserva || "BOARDING"} size={100} />
                    </div>
                  </div>

                  {/* Volta */}
                  {hasVolta && (
                    <div className="rounded-xl border border-border p-3 mb-4 bg-muted/10">
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                        ✈️ VOLTA
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground uppercase">Data</div>
                          <div className="font-semibold text-foreground">{data.volta_data}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground uppercase">Partida</div>
                          <div className="font-semibold text-foreground">{data.volta_partida || "--:--"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground uppercase">Chegada</div>
                          <div className="font-semibold text-foreground">{data.volta_chegada || "--:--"}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative flex items-center my-4">
                    <div className="absolute -left-6 h-5 w-5 rounded-full bg-primary" />
                    <div className="flex-1 border-t-2 border-dashed border-border" />
                    <div className="absolute -right-6 h-5 w-5 rounded-full bg-primary" />
                  </div>

                  {/* Seat info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase">Assento</div>
                        <div className="text-xl font-bold text-foreground">
                          {(mainPassenger as any)?.assento || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase">Seção</div>
                        <div className="text-xl font-bold text-foreground">
                          {(mainPassenger as any)?.secao || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">Embarque prioritário</span>
                    </div>
                  </div>

                  {/* More details toggle */}
                  <button
                    onClick={() => setDetalhesAbertos(!detalhesAbertos)}
                    className="w-full flex items-center justify-center gap-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                  >
                    <Info className="h-4 w-4" />
                    {detalhesAbertos ? "Fechar detalhes" : "Mais detalhes"}
                    {detalhesAbertos ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {detalhesAbertos && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 mb-4"
                    >
                      <div className="rounded-xl border border-border p-4">
                        <h4 className="flex items-center gap-1 text-sm font-semibold text-foreground mb-3">
                          👤 Dados do Passageiro
                        </h4>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <div>
                            <div className="text-muted-foreground uppercase">Nome</div>
                            <div className="font-medium text-foreground">{mainPassenger.nomeCompleto || mainPassenger.nome || "—"}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">CPF</div>
                            <div className="font-medium text-foreground">{maskCpf(mainPassenger.cpfDocumento || mainPassenger.cpf || "")}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Companhia</div>
                            <div className="font-medium text-foreground">{data.companhia || "—"}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Voo</div>
                            <div className="font-medium text-foreground">{data.numero_voo || "—"}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Classe</div>
                            <div className="font-medium text-foreground">{classeLabel}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Reserva</div>
                            <div className="font-medium text-primary">{data.codigo_reserva || "—"}</div>
                          </div>
                        </div>
                      </div>

                      {hasVolta && (
                        <div className="rounded-xl border border-border p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-3">✈️ Voo de Volta</h4>
                          <div className="grid grid-cols-3 gap-y-2 text-xs">
                            <div>
                              <div className="text-muted-foreground uppercase">Data</div>
                              <div className="font-medium text-foreground">{data.volta_data}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground uppercase">Partida</div>
                              <div className="font-medium text-foreground">{data.volta_partida || "--:--"}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground uppercase">Chegada</div>
                              <div className="font-medium text-foreground">{data.volta_chegada || "--:--"}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl border border-border p-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3">ℹ️ Informações Adicionais</h4>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <div>
                            <div className="text-muted-foreground uppercase">Tipo de Tarifa</div>
                            <div className="font-medium text-foreground">Promo</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Bagagem</div>
                            <div className="font-medium text-foreground">🧳 23kg</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Bag. de Mão</div>
                            <div className="font-medium text-foreground">1x até 10kg</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Classe</div>
                            <div className="font-medium text-foreground">{classeLabel}</div>
                          </div>
                        </div>
                      </div>

                      {data.passageiros.length > 1 && (
                        <div className="rounded-xl border border-border p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-3">
                            👥 Passageiros ({data.passageiros.length})
                          </h4>
                          {data.passageiros.map((p: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {i + 1}
                              </div>
                              <div className="flex-1 text-xs">
                                <div className="font-semibold text-foreground">{p.nomeCompleto || p.nome || "—"}</div>
                                <div className="text-muted-foreground">
                                  CPF: {maskCpf(p.cpfDocumento || p.cpf || "")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Payment status */}
                  {isPendente && (
                    <>
                      <button
                        onClick={() => setShowPayment(true)}
                        className="w-full rounded-xl bg-warning/10 border border-warning/30 p-3.5 flex items-center justify-center gap-2 mb-3 hover:bg-warning/15 transition-colors active:scale-[0.98]"
                      >
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-semibold text-warning">🟡 Pendência no pagamento</span>
                      </button>

                      <p className="text-[11px] text-center text-muted-foreground mb-4">
                        ⚠ Os assentos reservados podem ser disponibilizados a outros viajantes caso exceda o prazo de sua reserva.
                      </p>
                    </>
                  )}

                  {data.status === "pago" && (
                    <div className="rounded-xl border border-success/30 p-4 text-center mb-4 bg-success/5">
                      <span className="text-success font-semibold">✅ Pagamento confirmado!</span>
                    </div>
                  )}

                  {data.status === "taxa_paga" && (
                    <div className="rounded-xl border border-success/30 p-4 text-center mb-4 bg-success/5">
                      <span className="text-success font-semibold">✅ Todos os pagamentos confirmados!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="bg-primary px-6 py-3 text-center mt-auto">
            <div className="text-xs font-semibold text-primary-foreground">
              Pagamento processado com segurança
            </div>
            <div className="text-[10px] text-primary-foreground/60">
              Transação protegida · Dados criptografados
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BoardingPass;
