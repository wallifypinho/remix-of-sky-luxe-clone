import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export interface PassageiroData {
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  telefone: string;
  email: string;
}

interface StepDadosProps {
  passageiros: PassageiroData[];
  currentIndex: number;
  onChangeIndex: (i: number) => void;
  onChange: (index: number, data: PassageiroData) => void;
  onNext: () => void;
  onBack: () => void;
  total: number;
}

const StepDados = ({ passageiros, currentIndex, onChangeIndex, onChange, onNext, onBack, total }: StepDadosProps) => {
  const p = passageiros[currentIndex];

  const update = (field: keyof PassageiroData, value: string) => {
    onChange(currentIndex, { ...p, [field]: value });
  };

  const allFilled = passageiros.every((px) => px.nomeCompleto && px.cpf && px.telefone && px.email);

  const handleContinue = () => {
    if (currentIndex < total - 1) {
      onChangeIndex(currentIndex + 1);
    } else {
      onNext();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={currentIndex} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Passageiro {currentIndex + 1} de {total}
        </h2>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="space-y-2">
          <Label>Nome completo</Label>
          <Input placeholder="Nome como no documento" value={p.nomeCompleto} onChange={(e) => update("nomeCompleto", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data de nascimento</Label>
            <Input placeholder="DD/MM/AAAA" value={p.dataNascimento} onChange={(e) => update("dataNascimento", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input placeholder="000.000.000-00" value={p.cpf} onChange={(e) => update("cpf", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Telefone com WhatsApp</Label>
            <Input placeholder="(00) 00000-0000" value={p.telefone} onChange={(e) => update("telefone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input placeholder="email@exemplo.com" value={p.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        size="lg"
        className="w-full text-base font-semibold"
        disabled={!p.nomeCompleto || !p.cpf || !p.telefone || !p.email}
      >
        {currentIndex < total - 1 ? "Próximo Passageiro" : "Continuar"}
      </Button>
      <button
        type="button"
        onClick={() => (currentIndex > 0 ? onChangeIndex(currentIndex - 1) : onBack())}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepDados;
