import { useState } from "react";
import { Plane, User, Armchair, CreditCard, ClipboardList } from "lucide-react";
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
    if (s === "masculino") return "M";
    if (s === "feminino") return "F";
    return "—";
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">Resumo</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Confira os dados antes de enviar</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-4 py-3 flex items-center gap-2">
          <Plane className="h-4 w-4 text-primary-foreground" />
          <span className="font-bold text-sm text-primary-foreground uppercase tracking-wider">Dados da Reserva</span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Passageiros */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Passageiros ({passageiros.length})</span>
            </div>
            {passageiros.map((p, i) => (
              <div key={i} className="mb-3 pb-3 border-b border-border last:border-0 last:mb-0 last:pb-0">
                <p className="font-bold text-foreground text-sm">{p.nomeCompleto || "—"}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                  <p className="text-[11px] text-muted-foreground">CPF: {p.cpf || "—"}</p>
                  <p className="text-[11px] text-muted-foreground">Nasc: {p.dataNascimento || "—"}</p>
                  <p className="text-[11px] text-muted-foreground">Sexo: {sexoLabel(p.sexo)}</p>
                  <p className="text-[11px] text-muted-foreground">Tel: {p.telefone || "—"}</p>
                  <p className="text-[11px] text-muted-foreground col-span-2">Email: {p.email || "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Assentos */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Armchair className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Assentos</span>
            </div>
            <div className="flex gap-2">
              {assentos.length > 0 ? assentos.map(s => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                  {s}
                </span>
              )) : <span className="text-xs text-muted-foreground">Nenhum</span>}
            </div>
          </div>

          {/* Pagamento */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Pagamento</span>
            </div>
            <p className="font-bold text-foreground text-sm uppercase">{metodoPagamento}</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4">
        <Checkbox id="accept" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
        <label htmlFor="accept" className="text-xs text-foreground leading-relaxed cursor-pointer">
          Confirmo que os dados estão corretos. Estou ciente de que o horário oficial será informado pelo agente via WhatsApp.
        </label>
      </div>

      <Button
        onClick={onSubmit}
        size="lg"
        className="w-full text-base font-bold h-13 rounded-xl"
        disabled={!accepted || loading}
        style={accepted ? { background: "hsl(var(--success))" } : undefined}
      >
        {loading ? "Enviando..." : "🔒 Enviar Cadastro"}
      </Button>
      {!accepted && (
        <p className="text-[11px] text-center text-warning font-semibold">
          Marque a confirmação acima para liberar o envio
        </p>
      )}
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepResumo;
