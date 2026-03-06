const STEPS = ["Passageiros", "Dados", "Assentos", "Pagamento", "Resumo"];

interface StepProgressProps {
  current: number; // 0-based, maps to steps 1-5 (welcome=0 and success=6 don't show)
}

const StepProgress = ({ current }: StepProgressProps) => {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`text-xs font-medium transition-colors ${
              i <= current ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
