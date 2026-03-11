import { Check } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = ["Passageiros", "Dados", "Assentos", "Pagamento", "Resumo"];

interface StepProgressProps {
  current: number;
}

const StepProgress = ({ current }: StepProgressProps) => {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {/* Step indicators */}
      <div className="flex justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "bg-muted text-muted-foreground"
            }`}>
              {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium transition-colors ${
              i <= current ? "text-primary" : "text-muted-foreground"
            }`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
