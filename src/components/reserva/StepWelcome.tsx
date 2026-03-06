import { Plane, ShieldCheck } from "lucide-react";
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
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-8">
        <Plane className="h-12 w-12 text-primary-foreground" />
      </div>

      <h1 className="text-3xl font-extrabold text-foreground mb-3">
        Seja bem-vindo ao<br />Formulário de Reserva
      </h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        Preencha seus dados para concluir sua reserva de forma rápida e segura.
      </p>

      <Button onClick={onNext} size="lg" className="px-12 text-base font-semibold">
        Começar
      </Button>

      <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-green-500" />
        Ambiente Seguro
      </div>
    </motion.div>
  );
};

export default StepWelcome;
