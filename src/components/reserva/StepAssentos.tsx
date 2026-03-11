import { useState, useMemo } from "react";
import { Armchair, Plane, DoorOpen, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface StepAssentosProps {
  totalPassageiros: number;
  selectedSeats: string[];
  onChange: (seats: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const COLS_LEFT = ["A", "B", "C"];
const COLS_RIGHT = ["D", "E", "F"];
const TOTAL_ROWS = 29;
const EXTRA_LEGROOM_ROWS = [1, 2, 3, 12, 13]; // Premium + emergency exit rows
const EMERGENCY_EXIT_ROWS = [12, 13];

const generateOccupied = () => {
  const occupied = new Set<string>();
  const rng = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 45; i++) {
    const row = Math.floor(rng(i * 7 + 3) * TOTAL_ROWS) + 1;
    const col = [...COLS_LEFT, ...COLS_RIGHT][Math.floor(rng(i * 13 + 1) * 6)];
    occupied.add(`${row}${col}`);
  }
  // Don't occupy selected premium rows too much
  EXTRA_LEGROOM_ROWS.forEach(r => {
    COLS_LEFT.concat(COLS_RIGHT).forEach(c => {
      if (rng(r * 31 + c.charCodeAt(0)) > 0.35) occupied.delete(`${r}${c}`);
    });
  });
  return occupied;
};

type SeatType = "available" | "occupied" | "selected" | "extra-legroom";

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

  const getSeatType = (seat: string): SeatType => {
    if (selectedSeats.includes(seat)) return "selected";
    if (occupied.has(seat)) return "occupied";
    const row = parseInt(seat);
    if (EXTRA_LEGROOM_ROWS.includes(row)) return "extra-legroom";
    return "available";
  };

  const getSeatStyle = (type: SeatType) => {
    switch (type) {
      case "selected":
        return "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105";
      case "occupied":
        return "bg-muted/60 text-muted-foreground/30 border-border cursor-not-allowed";
      case "extra-legroom":
        return "bg-accent/10 text-accent border-accent/30 hover:border-accent hover:bg-accent/20 cursor-pointer";
      case "available":
        return "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
    }
  };

  const renderSeatButton = (row: number, col: string) => {
    const seat = `${row}${col}`;
    const type = getSeatType(seat);
    const isOccupied = type === "occupied";

    return (
      <motion.button
        key={seat}
        type="button"
        onClick={() => toggleSeat(seat)}
        disabled={isOccupied}
        whileTap={!isOccupied ? { scale: 0.9 } : undefined}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-semibold border-2 transition-all duration-200 flex items-center justify-center ${getSeatStyle(type)}`}
      >
        {isOccupied ? (
          <span className="text-[10px]">✕</span>
        ) : (
          <span className="text-[11px] font-bold">{col}</span>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Armchair className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Escolha seus Assentos</h2>
          <p className="text-sm text-muted-foreground">Airbus A319 • Selecione {totalPassageiros} assento{totalPassageiros > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center bg-card rounded-xl border border-border p-3">
        {[
          { label: "Disponível", cls: "bg-card border-border" },
          { label: "Ocupado", cls: "bg-muted/60 border-border", icon: "✕" },
          { label: "Selecionado", cls: "bg-primary border-primary" },
          { label: "Mais espaço", cls: "bg-accent/10 border-accent/30" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-[8px] ${item.cls}`}>
              {item.icon || ""}
            </div>
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Aircraft body */}
      <div className="relative bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        {/* Nose of the aircraft */}
        <div className="relative bg-gradient-to-b from-primary/5 to-transparent pt-6 pb-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Frente</span>
            <span className="text-[10px] text-muted-foreground">Airbus A319</span>
          </div>
        </div>

        {/* Column headers */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border py-2 px-3">
          <div className="grid grid-cols-[repeat(3,1fr)_2rem_repeat(3,1fr)] gap-1 max-w-xs mx-auto">
            {COLS_LEFT.map((c) => (
              <span key={c} className="text-center text-xs font-bold text-primary">{c}</span>
            ))}
            <span />
            {COLS_RIGHT.map((c) => (
              <span key={c} className="text-center text-xs font-bold text-primary">{c}</span>
            ))}
          </div>
        </div>

        {/* Seat rows */}
        <div className="px-3 py-3 overflow-y-auto max-h-[55vh] space-y-1">
          {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map((row) => {
            const isEmergency = EMERGENCY_EXIT_ROWS.includes(row);
            const isExtraLegroom = EXTRA_LEGROOM_ROWS.includes(row);
            const isFirstEmergency = row === EMERGENCY_EXIT_ROWS[0];

            return (
              <div key={row}>
                {/* Emergency exit indicator */}
                {isFirstEmergency && (
                  <div className="flex items-center gap-2 py-2 my-2">
                    <div className="flex-1 border-t-2 border-dashed border-warning/40" />
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 border border-warning/20">
                      <DoorOpen className="h-3 w-3 text-warning" />
                      <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Saída de Emergência</span>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-warning/40" />
                  </div>
                )}

                {/* Extra legroom label for premium rows */}
                {row === 1 && (
                  <div className="flex items-center gap-2 py-1 mb-2">
                    <div className="flex-1 border-t border-accent/20" />
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/5">
                      <Maximize2 className="h-3 w-3 text-accent" />
                      <span className="text-[10px] font-semibold text-accent">Mais Espaço</span>
                    </div>
                    <div className="flex-1 border-t border-accent/20" />
                  </div>
                )}

                <div className={`grid grid-cols-[repeat(3,1fr)_2rem_repeat(3,1fr)] gap-1 max-w-xs mx-auto ${
                  isExtraLegroom ? "py-1" : ""
                }`}>
                  {COLS_LEFT.map((col) => renderSeatButton(row, col))}
                  <span className="text-center text-[10px] text-muted-foreground flex items-center justify-center font-bold tabular-nums">
                    {String(row).padStart(2, "0")}
                  </span>
                  {COLS_RIGHT.map((col) => renderSeatButton(row, col))}
                </div>

                {/* Separator after premium section */}
                {row === 3 && (
                  <div className="flex items-center gap-2 py-2 my-1">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-[10px] text-muted-foreground font-medium px-2">Econômica</span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Tail */}
          <div className="flex flex-col items-center pt-4 pb-2">
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
              <Plane className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">Cauda</span>
          </div>
        </div>
      </div>

      {/* Selection summary */}
      <AnimatePresence>
        <motion.div
          className="bg-card rounded-xl border border-border p-4"
          layout
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Assentos selecionados</p>
              <p className="text-lg font-bold text-foreground">
                {selectedSeats.length} <span className="text-sm font-normal text-muted-foreground">de {totalPassageiros}</span>
              </p>
            </div>
            {selectedSeats.length > 0 && (
              <div className="flex gap-1.5">
                {selectedSeats.map((seat) => (
                  <motion.span
                    key={seat}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm"
                  >
                    {seat}
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        onClick={onNext}
        size="lg"
        className="w-full text-base font-semibold h-12"
        disabled={selectedSeats.length < totalPassageiros}
      >
        {selectedSeats.length < totalPassageiros
          ? `Selecione ${totalPassageiros - selectedSeats.length} assento${totalPassageiros - selectedSeats.length > 1 ? "s" : ""}`
          : "Continuar"
        }
      </Button>
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepAssentos;
