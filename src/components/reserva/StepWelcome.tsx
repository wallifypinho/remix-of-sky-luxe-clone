import { Plane, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StepWelcomeProps {
  onNext: () => void;
}

const StepWelcome = ({ onNext }: StepWelcomeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[15%] left-[50%] -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] opacity-20"
          style={{ background: "hsl(var(--primary))" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative mb-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <div className="w-28 h-28 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/25">
          <Plane className="h-14 w-14 text-primary-foreground" />
        </div>
        <motion.div
          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <Sparkles className="h-5 w-5 text-accent-foreground" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 leading-tight">
          Sua Reserva<br />
          <span className="text-primary">Começa Aqui</span>
        </h1>
        <p className="text-muted-foreground mb-10 max-w-sm leading-relaxed text-sm sm:text-base">
          Preencha seus dados de forma rápida e segura para garantir sua viagem.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-xs"
      >
        <Button onClick={onNext} size="lg" className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 rounded-2xl">
          Começar Reserva
        </Button>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-8 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="font-medium">Seguro</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium">~3 min</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepWelcome;
