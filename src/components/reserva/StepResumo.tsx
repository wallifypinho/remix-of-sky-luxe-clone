import { useState } from "react";
import { Plane, User, Armchair, CreditCard, AlertTriangle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import type { PassageiroData } from "./StepDados";

interface StepResumoProps {
  passageiros: PassageiroData[];
  assentos: string[];
  metodoPagamento: string;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

const StepResumo = ({ passageiros, assentos, metodoPagamento, onSubmit, onBack, loading }: StepResumoProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
          <Plane className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Resumo de Cadastro</h2>
        <p className="text-sm text-muted-foreground">Confira os dados abaixo antes de enviar</p>
      </div>

      <div className="bg-primary text-primary-foreground rounded-t-xl p-3 flex items-center gap-2">
        <ClipboardList className="h-4 w-4" />
        <span className="font-bold text-sm uppercase tracking-wide">Conferência dos Dados</span>
      </div>
      <div className="bg-card border border-t-0 border-border rounded-b-xl p-5 space-y-4 -mt-6">
        {/* Passageiros */}
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

        {/* Assentos */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Armchair className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Assentos</span>
          </div>
          <p className="font-semibold text-foreground">{assentos.length > 0 ? assentos.join(", ") : "Nenhum selecionado"}</p>
        </div>

        {/* Pagamento */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Forma de Pagamento</span>
          </div>
          <p className="font-semibold text-foreground uppercase">{metodoPagamento}</p>
        </div>

        {/* Status */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Status do Pagamento</span>
          </div>
          <p className="font-semibold text-warning">⏳ Pendente</p>
        </div>

        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Código da Reserva</p>
          <p className="text-sm text-muted-foreground">Será gerado ao enviar o cadastro</p>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        A emissão correta ocorre somente após concluir todo o processo com seu agente.
      </p>

      <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
        <Checkbox id="accept" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
        <label htmlFor="accept" className="text-sm text-foreground leading-snug cursor-pointer">
          Estou ciente de que o horário oficial da viagem será o informado pelo agente de viagens via WhatsApp e não neste formulário. A emissão oficial ocorre somente após a conclusão de todo o processo.
        </label>
      </div>

      <Button
        onClick={onSubmit}
        size="lg"
        className="w-full text-base font-semibold bg-green-500 hover:bg-green-600"
        disabled={!accepted || loading}
      >
        {loading ? "Enviando..." : "🔒 Enviar Cadastro"}
      </Button>
      {!accepted && (
        <p className="text-xs text-center text-warning font-medium">
          ⚠ Marque a confirmação acima para liberar o envio
        </p>
      )}
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepResumo;
