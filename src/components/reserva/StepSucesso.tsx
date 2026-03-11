import { CheckCircle, User, Armchair, CreditCard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import type { PassageiroData } from "./StepDados";

interface StepSucessoProps {
  codigo: string;
  passageiros: PassageiroData[];
  assentos: string[];
  metodoPagamento: string;
  whatsappUrl?: string;
}

const StepSucesso = ({ codigo, passageiros, assentos, metodoPagamento, whatsappUrl }: StepSucessoProps) => {
  const sexoLabel = (s: string) => {
    if (s === "masculino") return "M";
    if (s === "feminino") return "F";
    return "—";
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="w-18 h-18 rounded-2xl bg-success flex items-center justify-center mb-4 shadow-lg shadow-success/25"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15 }}
        >
          <CheckCircle className="h-9 w-9 text-success-foreground" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-foreground">Cadastro Enviado!</h2>
        <p className="text-sm text-muted-foreground mt-1">Aguarde contato via WhatsApp</p>
      </div>

      {/* Code banner */}
      <div className="bg-success/10 border border-success/20 rounded-2xl p-4 text-center">
        <p className="text-xs text-success font-semibold uppercase tracking-wider mb-1">Código da Reserva</p>
        <p className="text-2xl font-extrabold font-mono tracking-[0.15em] text-success">{codigo}</p>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border bg-card text-sm font-bold text-foreground hover:bg-secondary transition-colors active:scale-[0.98]"
      >
        {copied ? <><Check className="h-4 w-4 text-success" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar todos os dados</>}
      </button>

      {/* Summary */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Passageiros</span>
            </div>
            {passageiros.map((p, i) => (
              <div key={i} className="mb-2 pb-2 border-b border-border last:border-0">
                <p className="font-bold text-foreground text-sm">{p.nomeCompleto}</p>
                <div className="grid grid-cols-2 gap-x-3 mt-0.5">
                  <p className="text-[11px] text-muted-foreground">CPF: {p.cpf}</p>
                  <p className="text-[11px] text-muted-foreground">Sexo: {sexoLabel(p.sexo)}</p>
                  <p className="text-[11px] text-muted-foreground">Tel: {p.telefone}</p>
                  <p className="text-[11px] text-muted-foreground">Email: {p.email}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Assentos</span>
            </div>
            <p className="font-bold text-foreground text-sm">{assentos.join(", ") || "—"}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Pagamento</span>
            </div>
            <p className="font-bold text-foreground text-sm uppercase">{metodoPagamento}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="text-center border-t border-border p-4">
          <div className="flex justify-center mb-2">
            <QRCodeSVG value={codigo} size={120} />
          </div>
          <p className="text-lg font-extrabold font-mono tracking-[0.15em] text-foreground">{codigo}</p>
        </div>
      </div>

      <p className="text-[11px] text-center text-muted-foreground">
        A emissão ocorre somente após concluir todo o processo com seu agente.
      </p>
    </motion.div>
  );
};

export default StepSucesso;
