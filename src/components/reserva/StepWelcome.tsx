import { Plane, ShieldCheck, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StepWelcomeProps {
  onNext: () => void;
}

const StepWelcome = ({ onNext }: StepWelcomeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center"
    >
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20">
          <Plane className="h-12 w-12 text-primary-foreground" />
        </div>
        <motion.div
          className="absolute -inset-3 rounded-3xl border-2 border-primary/20"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      <h1 className="text-3xl font-extrabold text-foreground mb-3 leading-tight">
        Formulário de<br />
        <span className="text-primary">Reserva Aérea</span>
      </h1>
      <p className="text-muted-foreground mb-8 max-w-xs leading-relaxed">
        Preencha seus dados para concluir sua reserva de forma rápida e segura.
      </p>

      <Button onClick={onNext} size="lg" className="px-12 h-12 text-base font-semibold shadow-lg shadow-primary/20">
        Começar Reserva
      </Button>

      <motion.div
        className="flex items-center justify-center gap-6 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Seguro</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>3 min</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-4 w-4 text-warning" />
          <span>Todas as rotas</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepWelcome;
