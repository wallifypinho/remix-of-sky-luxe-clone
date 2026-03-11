import { useState } from "react";
import { Plane, Download, Mail, RefreshCw, Loader2, X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface BoardingPassData {
  companhia: string;
  origem: string;
  destino: string;
  numeroVoo: string;
  classe: string;
  codigoReserva: string;
  idaData: string;
  idaPartida: string;
  idaChegada: string;
  voltaData?: string | null;
  voltaPartida?: string | null;
  voltaChegada?: string | null;
  passageiros: any[];
  assentos?: string[];
  token: string;
  valor: string;
}

interface BoardingPassViewerProps {
  data: BoardingPassData;
  onClose: () => void;
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
  if (clean.length === 11) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  return cpf;
};

const BoardingCard = ({ trecho, companhia, origem, destino, data, partida, chegada, paxNome, cpf, assento, codigoReserva, numeroVoo, classe }: {
  trecho: "IDA" | "VOLTA";
  companhia: string;
  origem: string;
  destino: string;
  data: string;
  partida: string;
  chegada: string;
  paxNome: string;
  cpf: string;
  assento: string;
  codigoReserva: string;
  numeroVoo: string;
  classe: string;
}) => {
  const embarque = calcBoardingTime(partida);
  const isIda = trecho === "IDA";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm print:shadow-none print:border print:border-gray-300"
    >
      {/* Header */}
      <div className={`px-5 py-3 flex items-center justify-between ${isIda ? "bg-primary" : "bg-sky-500"}`}>
        <span className="text-xs font-bold text-white tracking-widest uppercase">
          ✈ {trecho}
        </span>
        <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
          {companhia || "Companhia"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Route */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-foreground tracking-widest">{origem || "—"}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Origem</div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Plane className={`h-5 w-5 ${isIda ? "text-primary" : "text-sky-500"}`} />
            <span className="text-[10px] text-muted-foreground">VOO {numeroVoo || "—"}</span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-foreground tracking-widest">{destino || "—"}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Destino</div>
          </div>
        </div>

        {/* Passenger */}
        <div className="rounded-xl bg-muted/30 p-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Passageiro</div>
              <div className="text-sm font-bold text-foreground uppercase">{paxNome}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">CPF</div>
              <div className="text-xs font-semibold text-foreground font-mono">{maskCpf(cpf)}</div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Data</div>
            <div className="text-sm font-bold text-foreground">{data || "—"}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Partida</div>
            <div className="text-sm font-bold text-foreground">{partida || "--:--"}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Chegada</div>
            <div className="text-sm font-bold text-foreground">{chegada || "--:--"}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Classe</div>
            <div className="text-sm font-bold text-foreground">{classe || "ECO"}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="absolute -left-5 h-5 w-5 rounded-full bg-background" />
          <div className="flex-1 border-t-2 border-dashed border-border" />
          <div className="absolute -right-5 h-5 w-5 rounded-full bg-background" />
        </div>

        {/* Bottom: embarque, portão, assento, QR */}
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Embarque</div>
                <div className={`text-xl font-extrabold ${isIda ? "text-primary" : "text-sky-500"}`}>{embarque}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Portão</div>
                <div className="text-xl font-extrabold text-foreground">—</div>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Assento</div>
                <div className="text-xl font-extrabold text-foreground">{assento || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Reserva</div>
                <div className={`text-base font-extrabold font-mono tracking-widest ${isIda ? "text-primary" : "text-sky-500"}`}>{codigoReserva || "—"}</div>
              </div>
            </div>
          </div>
          <div className="bg-muted/30 p-2.5 rounded-xl">
            <QRCodeSVG value={codigoReserva || "BOARDING"} size={90} />
          </div>
        </div>

        {/* Barcode simulation */}
        <div className="text-center pt-1">
          <div className="flex justify-center gap-[1px]">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="bg-foreground"
                style={{ width: Math.random() > 0.4 ? 2 : 1, height: 32 }}
              />
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono tracking-[3px] mt-1">{codigoReserva}</div>
        </div>
      </div>
    </motion.div>
  );
};

const BoardingPassViewer = ({ data, onClose }: BoardingPassViewerProps) => {
  const [sendingEmail, setSendingEmail] = useState(false);
  const hasVolta = !!data.voltaData;
  const classeLabel = data.classe === "executiva" ? "EXEC" : data.classe === "primeira" ? "1ª" : "ECO";

  const handleSendEmail = async () => {
    const mainP = data.passageiros?.[0] as any;
    if (!mainP?.email) {
      toast.error("Passageiro sem e-mail cadastrado");
      return;
    }
    setSendingEmail(true);
    try {
      const link = `${window.location.origin}/boarding-pass?token=${data.token}`;
      const { error } = await supabase.functions.invoke("send-reservation-email", {
        body: {
          type: "boarding_pass",
          codigoReserva: data.codigoReserva,
          passageiros: data.passageiros,
          assentos: data.assentos,
          companhia: data.companhia,
          origem: data.origem,
          destino: data.destino,
          numeroVoo: data.numeroVoo,
          classe: data.classe,
          idaData: data.idaData,
          idaPartida: data.idaPartida,
          idaChegada: data.idaChegada,
          voltaData: data.voltaData,
          voltaPartida: data.voltaPartida,
          voltaChegada: data.voltaChegada,
          valor: data.valor,
          linkPagamento: link,
        },
      });
      if (error) throw error;
      toast.success(`Cartão de embarque enviado para ${mainP.email}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar e-mail");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4 print:bg-white print:static print:p-0"
    >
      <div className="w-full max-w-lg space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-card">
              {hasVolta ? "Ida e Volta" : "Somente Ida"} • {data.passageiros?.length || 1} pax
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={sendingEmail} className="h-8 gap-1 text-xs bg-card">
              {sendingEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
              Enviar E-mail
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1 text-xs bg-card">
              <Printer className="h-3 w-3" /> Imprimir / PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 bg-card rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Boarding pass cards for each passenger */}
        {(data.passageiros || []).map((pax: any, pi: number) => {
          const paxName = pax?.nomeCompleto || pax?.nome || "—";
          const paxCpf = pax?.cpfDocumento || pax?.cpf || "";
          const paxAssento = data.assentos?.[pi] || pax?.assento || "—";

          return (
            <div key={pi} className="space-y-3">
              {data.passageiros.length > 1 && (
                <div className="text-xs font-bold text-white/80 uppercase tracking-wider print:text-foreground">
                  Passageiro {pi + 1} de {data.passageiros.length}
                </div>
              )}

              {/* IDA card */}
              <BoardingCard
                trecho="IDA"
                companhia={data.companhia}
                origem={data.origem}
                destino={data.destino}
                data={data.idaData}
                partida={data.idaPartida}
                chegada={data.idaChegada}
                paxNome={paxName}
                cpf={paxCpf}
                assento={paxAssento}
                codigoReserva={data.codigoReserva}
                numeroVoo={data.numeroVoo}
                classe={classeLabel}
              />

              {/* VOLTA card */}
              {hasVolta && (
                <BoardingCard
                  trecho="VOLTA"
                  companhia={data.companhia}
                  origem={data.destino}
                  destino={data.origem}
                  data={data.voltaData!}
                  partida={data.voltaPartida || ""}
                  chegada={data.voltaChegada || ""}
                  paxNome={paxName}
                  cpf={paxCpf}
                  assento={paxAssento}
                  codigoReserva={data.codigoReserva}
                  numeroVoo={data.numeroVoo}
                  classe={classeLabel}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BoardingPassViewer;
