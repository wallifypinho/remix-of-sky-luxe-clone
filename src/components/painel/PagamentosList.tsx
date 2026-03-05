import { Plane, ChevronDown } from "lucide-react";

interface PagamentoItem {
  id: string;
  nome: string;
  aeroporto: string;
  operador: string;
  valor: string;
  status?: string;
}

const pagamentosMock: PagamentoItem[] = [
  { id: "1", nome: "Sergio Alves de Matos", aeroporto: "SSA - Salvador", operador: "h", valor: "R$ 916,00" },
  { id: "2", nome: "Sergio Alves de Matos", aeroporto: "SSA - Salvador", operador: "h", valor: "R$ 916,00" },
  { id: "3", nome: "Allana Lima", aeroporto: "JPA - João Pessoa", operador: "00", valor: "R$ 1.220,00" },
  { id: "4", nome: "Kawan Brayan", aeroporto: "REC - Recife", operador: "Meus (Admin)", valor: "R$ 520,00" },
  { id: "5", nome: "Maria Edilane", aeroporto: "FLN - Florianópolis", operador: "00", valor: "R$ 520,00" },
  { id: "6", nome: "Fransergio Barbosa Silva", aeroporto: "REC - Recife", operador: "Meus (Admin)", valor: "R$ 455,00", status: "confirmado" },
  { id: "7", nome: "Fransergio Barbosa Silva", aeroporto: "REC - Recife", operador: "L", valor: "R$ 455,00" },
  { id: "8", nome: "Wallify Pinho", aeroporto: "REC - Recife", operador: "Meus (Admin)", valor: "R$ 455,00" },
];

const PagamentosList = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Pagamentos</h3>
        <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5">
          Todos <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {pagamentosMock.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Plane className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground truncate">{p.nome}</span>
                {p.status === "confirmado" && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-[8px] text-success-foreground">✓</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {p.aeroporto} · {p.operador}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm font-semibold text-primary">{p.valor}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagamentosList;
