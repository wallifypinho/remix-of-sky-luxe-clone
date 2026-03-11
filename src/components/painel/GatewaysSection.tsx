import { useState } from "react";
import { Zap, Plus, Trash2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Gateway } from "@/types/pagamento";

const GatewaysSection = () => {
  const [gateways, setGateways] = useState<Gateway[]>([
    { id: "1", nome: "hura L", url: "https://api.hurapayments.com.br/v1/payment-transaction/create", ativo: false },
  ]);
  const [novoNome, setNovoNome] = useState("");
  const [novaUrl, setNovaUrl] = useState("");
  const [open, setOpen] = useState(false);

  const addGateway = () => {
    if (!novoNome || !novaUrl) return;
    setGateways([...gateways, { id: Date.now().toString(), nome: novoNome, url: novaUrl, ativo: false }]);
    setNovoNome("");
    setNovaUrl("");
    setOpen(false);
    toast.success("Gateway adicionado!");
  };

  const removeGateway = (id: string) => {
    setGateways(gateways.filter((g) => g.id !== id));
    toast.success("Gateway removido!");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-foreground">Gateways</h3>
          <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold px-1.5">
            {gateways.length}
          </span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 rounded-xl text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Gateway</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label className="text-xs font-medium">Nome</Label><Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome do gateway" className="mt-1.5" /></div>
              <div><Label className="text-xs font-medium">URL da API</Label><Input value={novaUrl} onChange={(e) => setNovaUrl(e.target.value)} placeholder="https://..." className="mt-1.5" /></div>
              <Button onClick={addGateway} className="w-full h-10 rounded-xl font-semibold">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {gateways.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-3">
            <Zap className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhum gateway configurado</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione um gateway para processar pagamentos</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {gateways.map((gw) => (
            <div key={gw.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${gw.ativo ? "bg-emerald-500/10" : "bg-muted/50"}`}>
                      {gw.ativo ? <Wifi className="h-4.5 w-4.5 text-emerald-600" /> : <WifiOff className="h-4.5 w-4.5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{gw.nome}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">{gw.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      gw.ativo ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {gw.ativo ? "Ativo" : "Inativo"}
                    </span>
                    <button
                      onClick={() => removeGateway(gw.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

export default GatewaysSection;
