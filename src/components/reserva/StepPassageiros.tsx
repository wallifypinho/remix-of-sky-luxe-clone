import { Users, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PassageiroCount {
  adultos: number;
  criancas: number;
  bebes: number;
}

interface StepPassageirosProps {
  counts: PassageiroCount;
  onChange: (counts: PassageiroCount) => void;
  onNext: () => void;
  onBack: () => void;
}

const Counter = ({
  label,
  subtitle,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  subtitle: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-xl font-bold text-primary w-6 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const StepPassageiros = ({ counts, onChange, onNext, onBack }: StepPassageirosProps) => {
  const total = counts.adultos + counts.criancas + counts.bebes;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Quantidade de Passageiros</h2>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 divide-y divide-border">
        <Counter
          label="Adultos"
          subtitle="12 anos ou mais"
          value={counts.adultos}
          onChange={(v) => onChange({ ...counts, adultos: v })}
          min={1}
        />
        <Counter
          label="Crianças"
          subtitle="2 a 11 anos"
          value={counts.criancas}
          onChange={(v) => onChange({ ...counts, criancas: v })}
        />
        <Counter
          label="Bebês"
          subtitle="Até 2 anos"
          value={counts.bebes}
          onChange={(v) => onChange({ ...counts, bebes: v })}
        />
      </div>

      <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Total de passageiros</span>
        <span className="text-2xl font-bold text-primary">{total}</span>
      </div>

      <Button onClick={onNext} size="lg" className="w-full text-base font-semibold">
        Continuar
      </Button>
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepPassageiros;
