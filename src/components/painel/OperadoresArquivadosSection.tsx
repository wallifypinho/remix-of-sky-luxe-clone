import { useState, useEffect, useCallback } from "react";
import { Archive, RotateCcw, Loader2, RefreshCw, ClipboardList, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ExcluidoRow {
  id: string;
  nome: string;
  codigo_acesso: string;
  perfil: string;
  status: string;
  pagamentos: number;
  reservas: number;
  ultima_atividade: string;
}

interface OrfaoRow {
  operador_id: string;
  pagamentos: number;
  reservas: number;
  ultima_atividade: string;
  exemplos: string[];
}

const OperadoresArquivadosSection = () => {
  const [excluidos, setExcluidos] = useState<ExcluidoRow[]>([]);
  const [orfaos, setOrfaos] = useState<OrfaoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<{ id: string; nome?: string; isOrfao: boolean } | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoPerfil, setNovoPerfil] = useState("operador");
  const [restaurando, setRestaurando] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("operador-auth", {
        body: { action: "listar_arquivados" },
      });
      if (error) throw error;
      setExcluidos(data?.excluidos || []);
      setOrfaos(data?.orfaos || []);
    } catch {
      toast.error("Erro ao carregar arquivados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openRestore = (id: string, nome: string | undefined, isOrfao: boolean) => {
    setTarget({ id, nome, isOrfao });
    setNovoNome(nome || "");
    setNovaSenha("");
    setNovoPerfil("operador");
  };

  const handleRestaurar = async () => {
    if (!target) return;
    if (target.isOrfao && (!novoNome || !novaSenha)) {
      toast.error("Informe nome e senha para recriar");
      return;
    }
    setRestaurando(true);
    try {
      const { data, error } = await supabase.functions.invoke("operador-auth", {
        body: {
          action: "restaurar",
          operadorId: target.id,
          nome: novoNome || undefined,
          senha: novaSenha || undefined,
          perfil: novoPerfil,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erro");
      toast.success("Operador restaurado! Dados antigos religados.");
      setTarget(null);
      fetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao restaurar");
    } finally {
      setRestaurando(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const total = excluidos.length + orfaos.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-foreground">Operadores arquivados</h3>
          <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold px-1.5">
            {total}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetch} disabled={loading} className="h-9 w-9 p-0">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground -mt-2">
        Restaure operadores excluídos. Os pagamentos e reservas anteriores ficam religados automaticamente.
      </p>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.isOrfao ? "Recriar operador" : "Reativar operador"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-medium">Nome</Label>
              <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-medium">{target?.isOrfao ? "Nova senha" : "Nova senha (opcional)"}</Label>
              <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-medium">Perfil</Label>
              <Select value={novoPerfil} onValueChange={setNovoPerfil}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRestaurar} disabled={restaurando} className="w-full h-10 rounded-xl font-semibold">
              {restaurando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
              Restaurar e religar dados
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-3">
            <Archive className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhum operador arquivado</p>
          <p className="text-xs text-muted-foreground mt-1">Operadores excluídos aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {excluidos.map((op) => (
            <div key={op.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{op.nome}</span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-muted text-muted-foreground border-border">
                      excluído
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Código: <span className="font-mono">{op.codigo_acesso}</span></p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" />{op.pagamentos} pag.</span>
                    <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" />{op.reservas} res.</span>
                    <span>· {formatDate(op.ultima_atividade)}</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => openRestore(op.id, op.nome, false)} className="h-9 rounded-xl text-xs font-semibold gap-1.5 shrink-0">
                  <RotateCcw className="h-3.5 w-3.5" /> Reativar
                </Button>
              </div>
            </div>
          ))}

          {orfaos.map((op) => (
            <div key={op.operador_id} className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Operador removido</span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-amber-500/10 text-amber-700 border-amber-500/20">
                      órfão
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{op.operador_id}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" />{op.pagamentos} pag.</span>
                    <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" />{op.reservas} res.</span>
                    <span>· {formatDate(op.ultima_atividade)}</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => openRestore(op.operador_id, "", true)} className="h-9 rounded-xl text-xs font-semibold gap-1.5 shrink-0">
                  <RotateCcw className="h-3.5 w-3.5" /> Recriar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperadoresArquivadosSection;
