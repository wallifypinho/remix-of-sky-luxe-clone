import { Plane, CheckCircle, ClipboardList, User, Armchair, CreditCard, AlertTriangle } from "lucide-react";
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
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
          <Plane className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">Cadastro Enviado!</h2>
        <p className="text-sm text-muted-foreground">Seus dados foram registrados. Aguarde contato do atendente.</p>
      </div>

      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-green-700">Cadastro registrado com sucesso!</p>
        <p className="text-sm text-green-600">Código: {codigo}</p>
        {whatsappUrl && (
          <p className="text-sm text-green-600 mt-1">Redirecionando para WhatsApp...</p>
        )}
      </div>

      {/* Summary card */}
      <div className="bg-primary text-primary-foreground rounded-t-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="font-bold text-sm uppercase tracking-wide">Conferência dos Dados</span>
        </div>
        <span className="text-xs font-mono">{codigo}</span>
      </div>
      <div className="bg-card border border-t-0 border-border rounded-b-xl p-5 space-y-4 -mt-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Passageiros</span>
          </div>
          {passageiros.map((p, i) => (
            <div key={i} className="mb-2">
              <p className="font-semibold text-foreground">{p.nomeCompleto}</p>
              <p className="text-xs text-muted-foreground">
                CPF: {p.cpf} • Nasc.: {p.dataNascimento || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Tel: {p.telefone} • Email: {p.email}
              </p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Armchair className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Assentos</span>
          </div>
          <p className="font-semibold text-foreground">{assentos.join(", ") || "—"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Forma de Pagamento</span>
          </div>
          <p className="font-semibold text-foreground uppercase">{metodoPagamento}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Status do Pagamento</span>
          </div>
          <p className="font-semibold text-warning">⏳ Pendente</p>
        </div>

        {/* QR Code */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Código da Reserva</p>
          <div className="flex justify-center mb-3">
            <QRCodeSVG value={codigo} size={160} />
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
