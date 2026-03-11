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
      <div className="h-1 bg-secondary rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      {/* Step indicators - hidden on very small screens */}
      <div className="flex justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                i < current
                  ? "bg-primary text-primary-foreground"
                  : i === current
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "bg-secondary text-muted-foreground"
              }`}
              animate={i === current ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </motion.div>
            <span className={`text-[10px] sm:text-[11px] font-semibold transition-colors hidden sm:block ${
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
