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

  const sexoLabel = (s: string) => {
    if (s === "masculino") return "Masculino";
    if (s === "feminino") return "Feminino";
    return "—";
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div className="flex flex-col items-center text-center mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
          <Plane className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Resumo da Reserva</h2>
        <p className="text-sm text-muted-foreground">Confira os dados antes de enviar</p>
      </div>

      <div className="bg-primary text-primary-foreground rounded-t-xl p-3 flex items-center gap-2">
        <ClipboardList className="h-4 w-4" />
        <span className="font-bold text-sm uppercase tracking-wide">Dados da Reserva</span>
      </div>
      <div className="bg-card border border-t-0 border-border rounded-b-xl p-5 space-y-5 -mt-5">
        {/* Passageiros */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Passageiros ({passageiros.length})</span>
          </div>
          {passageiros.map((p, i) => (
            <div key={i} className="mb-3 pb-3 border-b border-border last:border-0 last:mb-0 last:pb-0">
              <p className="font-semibold text-foreground">{p.nomeCompleto || "—"}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                <p className="text-xs text-muted-foreground">CPF: {p.cpf || "—"}</p>
                <p className="text-xs text-muted-foreground">Nasc: {p.dataNascimento || "—"}</p>
                <p className="text-xs text-muted-foreground">Sexo: {sexoLabel(p.sexo)}</p>
                <p className="text-xs text-muted-foreground">Tel: {p.telefone || "—"}</p>
                <p className="text-xs text-muted-foreground col-span-2">Email: {p.email || "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Assentos */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Armchair className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Assentos</span>
          </div>
          <div className="flex gap-2">
            {assentos.length > 0 ? assentos.map(s => (
              <span key={s} className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                {s}
              </span>
            )) : <span className="text-sm text-muted-foreground">Nenhum selecionado</span>}
          </div>
        </div>

        {/* Pagamento */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Pagamento</span>
          </div>
          <p className="font-semibold text-foreground uppercase">{metodoPagamento}</p>
        </div>

        {/* Status */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-bold text-warning uppercase tracking-wider">Status</span>
          </div>
          <p className="font-semibold text-warning">⏳ Aguardando envio</p>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        A emissão ocorre somente após concluir todo o processo com seu agente.
      </p>

      <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
        <Checkbox id="accept" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
        <label htmlFor="accept" className="text-sm text-foreground leading-snug cursor-pointer">
          Estou ciente de que o horário oficial da viagem será o informado pelo agente de viagens via WhatsApp. A emissão oficial ocorre somente após a conclusão de todo o processo.
        </label>
      </div>

      <Button
        onClick={onSubmit}
        size="lg"
        className="w-full text-base font-semibold h-12"
        disabled={!accepted || loading}
        style={{ background: accepted ? "hsl(var(--success))" : undefined }}
      >
        {loading ? "Enviando..." : "🔒 Enviar Cadastro"}
      </Button>
      {!accepted && (
        <p className="text-xs text-center text-warning font-medium">
          ⚠ Marque a confirmação acima para liberar o envio
        </p>
      )}
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepResumo;
