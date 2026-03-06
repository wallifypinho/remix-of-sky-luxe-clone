import { useState, useMemo } from "react";
import { Armchair, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StepAssentosProps {
  totalPassageiros: number;
  selectedSeats: string[];
  onChange: (seats: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const COLS_LEFT = ["A", "B", "C"];
const COLS_RIGHT = ["D", "E", "F"];
const TOTAL_ROWS = 30;

// Generate some random occupied seats
const generateOccupied = () => {
  const occupied = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const row = Math.floor(Math.random() * TOTAL_ROWS) + 1;
    const col = [...COLS_LEFT, ...COLS_RIGHT][Math.floor(Math.random() * 6)];
    occupied.add(`${row}${col}`);
  }
  return occupied;
};

const StepAssentos = ({ totalPassageiros, selectedSeats, onChange, onNext, onBack }: StepAssentosProps) => {
  const occupied = useMemo(() => generateOccupied(), []);

  const toggleSeat = (seat: string) => {
    if (occupied.has(seat)) return;
    if (selectedSeats.includes(seat)) {
      onChange(selectedSeats.filter((s) => s !== seat));
    } else if (selectedSeats.length < totalPassageiros) {
      onChange([...selectedSeats, seat]);
    }
  };

  const getSeatClass = (seat: string) => {
    if (selectedSeats.includes(seat))
      return "bg-primary text-primary-foreground border-primary font-bold";
    if (occupied.has(seat))
      return "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-40";
    return "bg-card text-foreground border-border hover:border-primary hover:text-primary cursor-pointer";
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Armchair className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Escolha seus Assentos</h2>
          <p className="text-sm text-muted-foreground">Selecione {totalPassageiros} assento{totalPassageiros > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center">
        {[
          { label: "Disponível", cls: "bg-card border-border" },
          { label: "Ocupado", cls: "bg-muted border-border opacity-40" },
          { label: "Selecionado", cls: "bg-primary border-primary" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-6 h-6 rounded border ${item.cls}`} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Aircraft */}
      <div className="bg-card rounded-xl border border-border p-4 overflow-y-auto max-h-[50vh]">
        <div className="flex flex-col items-center mb-4">
          <Plane className="h-8 w-8 text-primary rotate-0" />
          <span className="text-xs text-muted-foreground mt-1">FRENTE DA AERONAVE</span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[repeat(3,2rem)_1.5rem_repeat(3,2rem)] gap-1 justify-center mb-2">
          {COLS_LEFT.map((c) => (
            <span key={c} className="text-center text-xs font-semibold text-muted-foreground">{c}</span>
          ))}
          <span />
          {COLS_RIGHT.map((c) => (
            <span key={c} className="text-center text-xs font-semibold text-muted-foreground">{c}</span>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map((row) => (
          <div key={row} className="grid grid-cols-[repeat(3,2rem)_1.5rem_repeat(3,2rem)] gap-1 justify-center mb-1">
            {COLS_LEFT.map((col) => {
              const seat = `${row}${col}`;
              return (
                <button
                  key={seat}
                  type="button"
                  onClick={() => toggleSeat(seat)}
                  className={`w-8 h-8 rounded text-xs border transition-colors ${getSeatClass(seat)}`}
                  disabled={occupied.has(seat)}
                >
                  {occupied.has(seat) ? "" : col}
                </button>
              );
            })}
            <span className="text-center text-xs text-muted-foreground flex items-center justify-center font-medium">
              {String(row).padStart(2, "0")}
            </span>
            {COLS_RIGHT.map((col) => {
              const seat = `${row}${col}`;
              return (
                <button
                  key={seat}
                  type="button"
                  onClick={() => toggleSeat(seat)}
                  className={`w-8 h-8 rounded text-xs border transition-colors ${getSeatClass(seat)}`}
                  disabled={occupied.has(seat)}
                >
                  {occupied.has(seat) ? "" : col}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Selecionados</p>
          <p className="font-bold text-foreground">{selectedSeats.length} de {totalPassageiros}</p>
        </div>
        <p className="font-semibold text-foreground">
          {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Nenhum"}
        </p>
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

export default StepAssentos;
