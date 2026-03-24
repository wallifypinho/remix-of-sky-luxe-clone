import { useState, useMemo } from "react";
import { Armchair, Plane, DoorOpen, Maximize2, ChevronDown } from "lucide-react";
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
const EXTRA_LEGROOM_ROWS = [1, 2, 3, 12, 13];
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
        return "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-110";
      case "occupied":
        return "bg-muted/50 text-muted-foreground/20 border-transparent cursor-not-allowed";
      case "extra-legroom":
        return "bg-accent/10 text-accent border-accent/30 hover:border-accent hover:bg-accent/20 cursor-pointer active:scale-95";
      case "available":
        return "bg-card text-foreground/60 border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer active:scale-95";
    }
  };

  const renderSeatButton = (row: number, col: string) => {
    const seat = `${row}${col}`;
    const type = getSeatType(seat);
    const isOccupied = type === "occupied";

    return (
      <button
        key={seat}
        type="button"
        onClick={() => toggleSeat(seat)}
        disabled={isOccupied}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-[10px] sm:text-xs font-bold border transition-all duration-150 flex items-center justify-center ${getSeatStyle(type)}`}
      >
        {isOccupied ? "·" : col}
      </button>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Armchair className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">Escolha seus Assentos</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Airbus A319 • Selecione {totalPassageiros}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center bg-card rounded-xl border border-border px-3 py-2.5">
        {[
          { label: "Livre", cls: "bg-card border-border" },
          { label: "Ocupado", cls: "bg-muted/50 border-transparent" },
          { label: "Seu", cls: "bg-primary border-primary" },
          { label: "+ Espaço", cls: "bg-accent/10 border-accent/30" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className={`w-5 h-5 rounded-md border ${item.cls}`} />
            <span className="font-semibold">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Aircraft body */}
      <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
        {/* Nose */}
        <div className="bg-primary/5 pt-5 pb-3">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Frente</span>
          </div>
        </div>

        {/* Column headers */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border py-2 px-2">
          <div className="grid grid-cols-[repeat(3,1fr)_1.5rem_repeat(3,1fr)] gap-0.5 max-w-[280px] sm:max-w-xs mx-auto">
            {COLS_LEFT.map((c) => (
              <span key={c} className="text-center text-[11px] font-extrabold text-primary">{c}</span>
            ))}
            <span />
            {COLS_RIGHT.map((c) => (
              <span key={c} className="text-center text-[11px] font-extrabold text-primary">{c}</span>
            ))}
          </div>
        </div>

        {/* Seat rows */}
        <div className="px-2 py-2 overflow-y-auto max-h-[50vh] space-y-0.5">
          {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map((row) => {
            const isEmergency = EMERGENCY_EXIT_ROWS.includes(row);
            const isExtraLegroom = EXTRA_LEGROOM_ROWS.includes(row);
            const isFirstEmergency = row === EMERGENCY_EXIT_ROWS[0];

            return (
              <div key={row}>
                {isFirstEmergency && (
                  <div className="flex items-center gap-2 py-2 my-1.5">
                    <div className="flex-1 border-t-2 border-dashed border-warning/30" />
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20">
                      <DoorOpen className="h-3 w-3 text-warning" />
                      <span className="text-[9px] font-bold text-warning uppercase tracking-wider">Emergência</span>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-warning/30" />
                  </div>
                )}

                {row === 1 && (
                  <div className="flex items-center gap-2 py-1 mb-1.5">
                    <div className="flex-1 border-t border-accent/20" />
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/5">
                      <Maximize2 className="h-3 w-3 text-accent" />
                      <span className="text-[9px] font-bold text-accent uppercase">Premium</span>
                    </div>
                    <div className="flex-1 border-t border-accent/20" />
                  </div>
                )}

                <div className={`grid grid-cols-[repeat(3,1fr)_1.5rem_repeat(3,1fr)] gap-0.5 max-w-[280px] sm:max-w-xs mx-auto ${
                  isExtraLegroom ? "py-0.5" : ""
                }`}>
                  {COLS_LEFT.map((col) => renderSeatButton(row, col))}
                  <span className="text-center text-[9px] text-muted-foreground/60 flex items-center justify-center font-bold tabular-nums">
                    {row}
                  </span>
                  {COLS_RIGHT.map((col) => renderSeatButton(row, col))}
                </div>

                {row === 3 && (
                  <div className="flex items-center gap-2 py-1.5 my-1">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider px-2">Econômica</span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex flex-col items-center pt-3 pb-2">
            <Plane className="h-4 w-4 text-muted-foreground/30 rotate-180" />
          </div>
        </div>
      </div>

      {/* Selection summary */}
      <motion.div className="bg-card rounded-2xl border border-border p-4" layout>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Selecionados</p>
            <p className="text-lg font-extrabold text-foreground">
              {selectedSeats.length} <span className="text-sm font-semibold text-muted-foreground">/ {totalPassageiros}</span>
            </p>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex gap-1.5">
              {selectedSeats.map((seat) => (
                <motion.span
                  key={seat}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm"
                >
                  {seat}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <Button
        onClick={onNext}
        size="lg"
        className="w-full text-lg font-bold h-14 rounded-xl"
        disabled={selectedSeats.length < totalPassageiros}
      >
        {selectedSeats.length < totalPassageiros
          ? `Selecione ${totalPassageiros - selectedSeats.length} assento${totalPassageiros - selectedSeats.length > 1 ? "s" : ""}`
          : "Continuar"
        }
      </Button>
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
        ← Voltar
      </button>
    </motion.div>
  );
};

export default StepAssentos;
