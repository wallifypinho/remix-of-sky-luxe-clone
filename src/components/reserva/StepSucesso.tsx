import { Plane, CheckCircle, ClipboardList, User, Armchair, CreditCard, AlertTriangle, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { PassageiroData } from "./StepDados";

interface StepSucessoProps {
  codigo: string;
  passageiros: PassageiroData[];
  assentos: string[];
  metodoPagamento: string;
  whatsappUrl?: string;
}

const StepSucesso = ({ codigo, passageiros, assentos, metodoPagamento, whatsappUrl }: StepSucessoProps) => {
  const [copied, setCopied] = useState(false);

  const sexoLabel = (s: string) => {
    if (s === "masculino") return "Masculino";
    if (s === "feminino") return "Feminino";
    return "—";
  };

  const handleCopy = () => {
    const lines = [
      `Código da Reserva: ${codigo}`,
      "",
      ...passageiros.map((p, i) => [
        `Passageiro ${i + 1}: ${p.nomeCompleto}`,
        `  CPF: ${p.cpf}`,
        `  Nascimento: ${p.dataNascimento}`,
        `  Sexo: ${sexoLabel(p.sexo)}`,
        `  Telefone: ${p.telefone}`,
        `  Email: ${p.email}`,
      ].join("\n")),
      "",
      `Assentos: ${assentos.join(", ") || "Nenhum"}`,
      `Pagamento: ${metodoPagamento}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-3 shadow-lg shadow-success/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <CheckCircle className="h-8 w-8 text-success-foreground" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-foreground">Cadastro Enviado!</h2>
        <p className="text-sm text-muted-foreground">Aguarde contato do atendente via WhatsApp.</p>
      </div>

      {/* Success banner */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
        <p className="font-semibold text-success text-sm">Reserva registrada com sucesso!</p>
        <p className="text-xs text-success/80 mt-1">Código: <span className="font-mono font-bold">{codigo}</span></p>
        {whatsappUrl && (
          <p className="text-xs text-success/80 mt-1">Redirecionando para WhatsApp...</p>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        {copied ? <><Check className="h-4 w-4 text-success" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar todos os dados</>}
      </button>

      {/* Summary card */}
      <div className="bg-primary text-primary-foreground rounded-t-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="font-bold text-sm uppercase tracking-wide">Conferência</span>
        </div>
        <span className="text-xs font-mono">{codigo}</span>
      </div>
      <div className="bg-card border border-t-0 border-border rounded-b-xl p-5 space-y-4 -mt-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase">Passageiros</span>
          </div>
          {passageiros.map((p, i) => (
            <div key={i} className="mb-2 pb-2 border-b border-border last:border-0">
              <p className="font-semibold text-foreground">{p.nomeCompleto}</p>
              <div className="grid grid-cols-2 gap-x-3 mt-0.5">
                <p className="text-xs text-muted-foreground">CPF: {p.cpf}</p>
                <p className="text-xs text-muted-foreground">Nasc: {p.dataNascimento || "—"}</p>
                <p className="text-xs text-muted-foreground">Sexo: {sexoLabel(p.sexo)}</p>
                <p className="text-xs text-muted-foreground">Tel: {p.telefone}</p>
                <p className="text-xs text-muted-foreground col-span-2">Email: {p.email}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Armchair className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase">Assentos</span>
          </div>
          <p className="font-semibold text-foreground">{assentos.join(", ") || "—"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase">Pagamento</span>
          </div>
          <p className="font-semibold text-foreground uppercase">{metodoPagamento}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-bold text-warning uppercase">Status</span>
          </div>
          <p className="font-semibold text-warning">⏳ Pendente</p>
        </div>

        {/* QR Code */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-3">Código da Reserva</p>
          <div className="flex justify-center mb-3">
            <QRCodeSVG value={codigo} size={140} />
          </div>
          <p className="text-xl font-extrabold font-mono tracking-widest text-foreground">{codigo}</p>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        A emissão correta ocorre somente após concluir todo o processo com seu agente.
      </p>
    </motion.div>
  );
};

export default StepSucesso;
