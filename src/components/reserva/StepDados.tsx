import { useState } from "react";
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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={currentIndex} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
            Passageiro {currentIndex + 1} <span className="text-muted-foreground font-semibold text-base">de {total}</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Dados conforme o documento</p>
        </div>
      </div>

      {/* Passenger tabs */}
      {total > 1 && (
        <div className="flex gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => onChangeIndex(i)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-primary" : i < currentIndex ? "bg-primary/40" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome completo *</Label>
          <Input
            placeholder="Nome como no documento"
            value={p.nomeCompleto}
            onChange={(e) => update("nomeCompleto", e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPF *</Label>
            <Input
              placeholder="000.000.000-00"
              value={p.cpf}
              onChange={(e) => update("cpf", e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nascimento</Label>
            <Input
              placeholder="DD/MM/AAAA"
              value={p.dataNascimento}
              onChange={(e) => update("dataNascimento", e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sexo *</Label>
            <Select value={p.sexo} onValueChange={(v) => update("sexo", v)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefone *</Label>
            <Input
              placeholder="(00) 00000-0000"
              value={p.telefone}
              onChange={(e) => update("telefone", e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail *</Label>
          <Input
            placeholder="email@exemplo.com"
            value={p.email}
            onChange={(e) => update("email", e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      <Button
        onClick={handleContinue}
        size="lg"
        className="w-full text-base font-bold h-13 rounded-xl"
        disabled={!isComplete}
      >
        {currentIndex < total - 1 ? "Próximo Passageiro →" : "Continuar"}
      </Button>
      <button
        type="button"
        onClick={() => (currentIndex > 0 ? onChangeIndex(currentIndex - 1) : onBack())}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepDados;
