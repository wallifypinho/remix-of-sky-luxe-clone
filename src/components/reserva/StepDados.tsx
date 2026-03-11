import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export interface PassageiroData {
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  telefone: string;
  email: string;
  sexo: string;
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

  const handleContinue = () => {
    if (currentIndex < total - 1) {
      onChangeIndex(currentIndex + 1);
    } else {
      onNext();
    }
  };

  const isComplete = p.nomeCompleto && p.cpf && p.telefone && p.email && p.sexo;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={currentIndex} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Passageiro {currentIndex + 1} de {total}
          </h2>
          <p className="text-sm text-muted-foreground">Preencha os dados conforme o documento</p>
        </div>
      </div>

      {/* Passenger tabs */}
      {total > 1 && (
        <div className="flex gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => onChangeIndex(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i === currentIndex ? "bg-primary" : i < currentIndex ? "bg-primary/40" : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Nome completo *</Label>
          <Input
            placeholder="Nome como no documento"
            value={p.nomeCompleto}
            onChange={(e) => update("nomeCompleto", e.target.value)}
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">CPF *</Label>
            <Input
              placeholder="000.000.000-00"
              value={p.cpf}
              onChange={(e) => update("cpf", e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Data de nascimento</Label>
            <Input
              placeholder="DD/MM/AAAA"
              value={p.dataNascimento}
              onChange={(e) => update("dataNascimento", e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Sexo *</Label>
            <Select value={p.sexo} onValueChange={(v) => update("sexo", v)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Telefone / WhatsApp *</Label>
            <Input
              placeholder="(00) 00000-0000"
              value={p.telefone}
              onChange={(e) => update("telefone", e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">E-mail *</Label>
          <Input
            placeholder="email@exemplo.com"
            value={p.email}
            onChange={(e) => update("email", e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      <Button
        onClick={handleContinue}
        size="lg"
        className="w-full text-base font-semibold h-12"
        disabled={!isComplete}
      >
        {currentIndex < total - 1 ? "Próximo Passageiro →" : "Continuar"}
      </Button>
      <button
        type="button"
        onClick={() => (currentIndex > 0 ? onChangeIndex(currentIndex - 1) : onBack())}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepDados;
