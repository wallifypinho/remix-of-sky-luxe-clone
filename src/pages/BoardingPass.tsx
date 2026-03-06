import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plane, ChevronDown, ChevronUp, AlertTriangle, Shield, Info, Copy, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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
  const bh = Math.floor((totalMin + 1440) % 1440 / 60);
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
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const fetch = async () => {
      const { data: pg, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("token", token)
        .single();
      if (!error && pg) setData(pg as unknown as PagamentoData);
      setLoading(false);
    };
    fetch();
  }, [token]);

  useEffect(() => {
    if (!data || data.status === "pago") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t <= 0 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleCopyPix = () => {
    if (data?.codigo_pix) {
      navigator.clipboard.writeText(data.codigo_pix);
      setPixCopiado(true);
      toast.success("Código copiado!");
      setTimeout(() => setPixCopiado(false), 2000);
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
  const timerMin = Math.floor(timeLeft / 60);
  const timerSec = timeLeft % 60;
  const classeLabel = data.classe === "executiva" ? "Executiva" : data.classe === "primeira" ? "Primeira" : "Econômica";

  return (
    <div className="min-h-screen bg-primary flex items-start justify-center py-8 px-4">
      <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="h-1 w-8 rounded-full bg-primary-foreground/30" />
          <div className="text-right">
            <div className="text-xs text-primary-foreground/60 tracking-widest uppercase">
              {data.companhia || "Companhia Aérea"}
            </div>
            <div className="text-sm font-bold text-primary-foreground italic">Premium</div>
          </div>
        </div>

        {/* Client name */}
        <div className="px-4 mb-4">
          <div className="text-xs text-primary-foreground/50 uppercase tracking-wider">Cliente</div>
          <div className="text-lg font-bold text-primary-foreground uppercase tracking-wide">
            {mainPassenger.nomeCompleto || mainPassenger.nome || "—"}
          </div>
        </div>

        {/* White card */}
        <div className="rounded-3xl bg-card shadow-2xl overflow-hidden">
          <div className="px-6 pt-8 pb-6">
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
                  <div className="text-xl font-bold text-foreground">
                    {calcBoardingTime(data.ida_partida)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Portão</div>
                  <div className="text-xl font-bold text-foreground">—</div>
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg shadow text-center">
                {data.codigo_pix ? (
                  <QRCodeSVG value={data.codigo_pix} size={100} />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-xs text-muted-foreground">
                    QR Code
                  </div>
                )}
                {data.codigo_pix && (
                  <button
                    onClick={handleCopyPix}
                    className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    {pixCopiado ? <><Check className="h-3 w-3" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar código</>}
                  </button>
                )}
              </div>
            </div>

            {/* Volta */}
            {hasVolta && (
              <div className="rounded-xl border border-border p-3 mb-4">
                <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                  ✈️ Voo de Volta
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
                    {(data.passageiros?.[0] as any)?.assento || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Seção</div>
                  <div className="text-xl font-bold text-foreground">
                    {(data.passageiros?.[0] as any)?.secao || "—"}
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
              {detalhesAbertos ? "Fechar detalhes" : "Ver mais detalhes"}
              {detalhesAbertos ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {detalhesAbertos && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 mb-4"
              >
                {/* Dados do Passageiro */}
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
                      <div className="text-muted-foreground uppercase">Origem</div>
                      <div className="font-medium text-foreground">{data.origem || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Destino</div>
                      <div className="font-medium text-foreground">{data.destino || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Data Embarque</div>
                      <div className="font-medium text-foreground">{data.ida_data || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Horário</div>
                      <div className="font-medium text-foreground">{data.ida_partida || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Assento</div>
                      <div className="font-medium text-foreground">{(mainPassenger as any)?.assento || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Seção</div>
                      <div className="font-medium text-foreground">{(mainPassenger as any)?.secao || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Portão</div>
                      <div className="font-medium text-foreground">—</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Reserva</div>
                      <div className="font-medium text-primary">{data.codigo_reserva || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Voo de Volta detalhes */}
                {hasVolta && (
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="flex items-center gap-1 text-sm font-semibold text-foreground mb-3">
                      ✈️ Voo de Volta
                    </h4>
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
                    <p className="text-xs text-muted-foreground mt-3">
                      Os detalhes de conexão estarão disponíveis no aplicativo da companhia aérea após o pagamento ou poderão ser informados via atendimento no chat.
                    </p>
                  </div>
                )}

                {/* Info Adicionais */}
                <div className="rounded-xl border border-border p-4">
                  <h4 className="flex items-center gap-1 text-sm font-semibold text-foreground mb-3">
                    ℹ️ Informações Adicionais
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <div className="text-muted-foreground uppercase">Tipo de Tarifa</div>
                      <div className="font-medium text-foreground">Promo</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Franquia de Bagagem</div>
                      <div className="font-medium text-foreground">🧳 23kg despachada</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Bagagem de Mão</div>
                      <div className="font-medium text-foreground">1x até 10kg</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Classe</div>
                      <div className="font-medium text-foreground">{classeLabel}</div>
                    </div>
                  </div>
                </div>

                {/* Passageiros adicionais */}
                {data.passageiros.length > 1 && (
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="flex items-center gap-1 text-sm font-semibold text-foreground mb-3">
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
                            CPF: {maskCpf(p.cpfDocumento || p.cpf || "")} • Nasc: {p.dataNascimento || "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Payment warning */}
            {data.status === "pendente" && (
              <>
                <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 flex items-center justify-center gap-2 mb-4">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm font-semibold text-warning">🟡 Pendência no pagamento</span>
                </div>

                {timeLeft > 0 && (
                  <p className="text-center text-sm font-semibold text-destructive mb-4">
                    Tempo restante: {String(timerMin).padStart(2, "0")}:{String(timerSec).padStart(2, "0")}
                  </p>
                )}

                <p className="text-xs text-center text-muted-foreground mb-6">
                  ⚠ Em 30 minutos as reservas são arquivadas automaticamente pelo sistema.
                </p>

                {/* Pay button */}
                <Button
                  onClick={handleCopyPix}
                  size="lg"
                  className="w-full text-base font-bold h-14"
                >
                  💳 Pagar Passagem — R$ {data.valor}
                </Button>
              </>
            )}

            {data.status === "pago" && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center mb-4">
                <span className="text-green-700 font-semibold">✅ Pagamento confirmado!</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-primary px-6 py-3 text-center">
            <div className="text-xs font-semibold text-primary-foreground">
              Pagamento processado com segurança
            </div>
            <div className="text-[10px] text-primary-foreground/60">
              Verificação protegida · Dados criptografados
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BoardingPass;
