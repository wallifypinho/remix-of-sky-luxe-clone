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
  maxDisabled = false,
}: {
  label: string;
  subtitle: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  maxDisabled?: boolean;
}) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <p className="font-bold text-foreground text-sm">{label}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary active:scale-95 transition-all disabled:opacity-30"
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-xl font-extrabold text-primary w-8 text-center tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-xl border-2 border-primary bg-primary/5 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-primary/5 disabled:hover:text-primary"
        disabled={maxDisabled}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const StepPassageiros = ({ counts, onChange, onNext, onBack }: StepPassageirosProps) => {
  const total = counts.adultos + counts.criancas + counts.bebes;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">Passageiros</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Quantas pessoas vão viajar?</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 divide-y divide-border">
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

      <motion.div
        className="rounded-2xl p-4 flex items-center justify-between border border-primary/15 bg-primary/5"
        layout
      >
        <span className="text-sm font-semibold text-foreground">Total de passageiros</span>
        <span className="text-2xl font-extrabold text-primary">{total}</span>
      </motion.div>

      <Button onClick={onNext} size="lg" className="w-full text-lg font-bold h-14 rounded-xl">
        Continuar
      </Button>
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepPassageiros;
