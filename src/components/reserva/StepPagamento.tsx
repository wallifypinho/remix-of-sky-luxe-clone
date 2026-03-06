import { CreditCard, QrCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StepPagamentoProps {
  selected: string;
  onChange: (method: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const methods = [
  {
    id: "pix",
    label: "PIX",
    description: "Pagamento à vista conforme valor acordado na cotação.",
    icon: QrCode,
    available: true,
  },
  {
    id: "boleto",
    label: "Boleto",
    description: "Forma de pagamento esgotada no momento.",
    icon: FileText,
    available: false,
  },
  {
    id: "cartao",
    label: "Cartão de Crédito",
    description: "Forma de pagamento esgotada no momento.",
    icon: CreditCard,
    available: false,
  },
];

const StepPagamento = ({ selected, onChange, onNext, onBack }: StepPagamentoProps) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Forma de Pagamento</h2>
      </div>

      <div className="space-y-3">
        {methods.map((m) => {
          const Icon = m.icon;
          const isSelected = selected === m.id;
          return (
            <button
              key={m.id}
              type="button"
              disabled={!m.available}
              onClick={() => m.available && onChange(m.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : m.available
                  ? "border-border bg-card hover:border-primary/50"
                  : "border-border bg-muted/50 opacity-60 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{m.label}</span>
                  {!m.available && (
                    <span className="text-xs font-bold text-destructive uppercase">Esgotado</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{m.description}</p>
              </div>
              {m.available && (
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-primary" : "border-border"
                  }`}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button onClick={onNext} size="lg" className="w-full text-base font-semibold">
        Finalizar Reserva
      </Button>
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepPagamento;
