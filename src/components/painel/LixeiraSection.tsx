import { useState, useEffect, useCallback } from "react";
import { Trash2, RotateCcw, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface PagamentoLixeira {
  id: string;
  token: string;
  codigo_reserva: string;
  valor: string;
  companhia: string;
  origem: string;
  destino: string;
  created_at: string;
  passageiros: any[];
}

const LixeiraSection = ({ operadorId, isAdmin }: { operadorId?: string; isAdmin?: boolean }) => {
  const [items, setItems] = useState<PagamentoLixeira[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("status", "lixeira")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data as PagamentoLixeira[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const { error } = await supabase.from("pagamentos").update({ status: "pendente" }).eq("id", id);
      if (error) throw error;
      toast.success("Pagamento restaurado!");
      fetchItems();
    } catch {
      toast.error("Erro ao restaurar");
    } finally {
      setRestoringId(null);
    }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const mainName = (item.passageiros?.[0] as any)?.nomeCompleto || (item.passageiros?.[0] as any)?.nome || "";
    return item.codigo_reserva.toLowerCase().includes(q) || mainName.toLowerCase().includes(q) || item.companhia.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-foreground">Lixeira</h3>
          <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold px-1.5">
            {items.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchItems} className="h-9 rounded-xl text-xs gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" /> Atualizar
        </Button>
      </div>

      {items.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar na lixeira..."
            className="pl-9 h-10 rounded-xl"
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-3">
            <Trash2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Lixeira vazia</p>
          <p className="text-xs text-muted-foreground mt-1">Itens removidos aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map((item) => {
              const mainP = item.passageiros?.[0] as any;
              const name = mainP?.nomeCompleto || mainP?.nome || "—";
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary font-mono">{item.codigo_reserva}</span>
                        <span className="text-[10px] text-muted-foreground">{item.companhia}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.origem} → {item.destino} · R$ {item.valor}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item.id)}
                      disabled={restoringId === item.id}
                      className="h-9 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
                    >
                      {restoringId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      Restaurar
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LixeiraSection;
