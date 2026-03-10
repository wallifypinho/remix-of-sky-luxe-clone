import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Shield, ShieldOff, Ban, CheckCircle, Loader2, RefreshCw, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OperadorRow {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  status: string;
  ultimo_acesso: string | null;
  sessao_ativa: boolean;
  created_at: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "ativo": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">Ativo</Badge>;
    case "inativo": return <Badge variant="secondary">Inativo</Badge>;
    case "bloqueado": return <Badge variant="destructive">Bloqueado</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const OperadoresSection = () => {
  const [operadores, setOperadores] = useState<OperadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<OperadorRow | null>(null);
  const [novaSenha, setNovaSenha] = useState("");

  // Form
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("operador");

  const fetchOperadores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("operador-auth", {
        body: { action: "listar" },
      });
      if (error) throw error;
      if (data?.operadores) setOperadores(data.operadores);
    } catch (err: any) {
      toast.error("Erro ao carregar operadores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOperadores(); }, [fetchOperadores]);

  const handleCriar = async () => {
    if (!nome || !email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("operador-auth", {
        body: { action: "criar", nome, email, senha, perfil },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erro ao criar");
      toast.success("Operador criado!");
      setNome(""); setEmail(""); setSenha(""); setPerfil("operador");
      setDialogOpen(false);
      fetchOperadores();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar operador");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (operadorId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("operador-auth", {
        body: { action: "atualizar_status", operadorId, status: newStatus },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error);
      toast.success(`Status alterado para ${newStatus}`);
      fetchOperadores();
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar status");
    }
  };

  const handleResetSenha = async () => {
    if (!resetTarget || !novaSenha) return;
    try {
      const { data, error } = await supabase.functions.invoke("operador-auth", {
        body: { action: "resetar_senha", operadorId: resetTarget.id, novaSenha },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error);
      toast.success("Senha resetada!");
      setResetDialogOpen(false);
      setNovaSenha("");
      setResetTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao resetar senha");
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Nunca";
    return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const onlineCount = operadores.filter(o => o.sessao_ativa).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">Operadores</h3>
          <Badge variant="outline" className="text-xs">{operadores.length} total</Badge>
          {onlineCount > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 text-xs">
              {onlineCount} online
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOperadores} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Novo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Operador</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Senha</Label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Perfil</Label>
                  <Select value={perfil} onValueChange={setPerfil}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operador">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCriar} disabled={creating} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Cadastrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reset password dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha - {resetTarget?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Nova Senha</Label>
              <Input type="password" placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
            </div>
            <Button onClick={handleResetSenha} className="w-full">
              <KeyRound className="h-4 w-4 mr-2" /> Resetar Senha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : operadores.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum operador cadastrado</p>
          <p className="text-xs text-muted-foreground mt-1">Clique em "Novo" para criar o primeiro</p>
        </div>
      ) : (
        <div className="space-y-2">
          {operadores.map((op) => (
            <div key={op.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${op.sessao_ativa ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{op.nome}</span>
                      {op.perfil === "admin" && (
                        <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{op.email}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Último acesso: {formatDate(op.ultimo_acesso)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(op.status)}
                  <div className="flex gap-1">
                    {op.status !== "ativo" && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(op.id, "ativo")} title="Ativar">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      </Button>
                    )}
                    {op.status !== "inativo" && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(op.id, "inativo")} title="Desativar">
                        <ShieldOff className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    {op.status !== "bloqueado" && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(op.id, "bloqueado")} title="Bloquear">
                        <Ban className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setResetTarget(op); setResetDialogOpen(true); }} title="Resetar senha">
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperadoresSection;
