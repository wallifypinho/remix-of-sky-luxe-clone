import { useState } from "react";
import { Zap, Plus, Trash2 } from "lucide-react";
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
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Zap className="h-4 w-4 text-primary" /> Meus Gateways
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Gateway</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome do gateway" />
              </div>
              <div className="space-y-2">
                <Label>URL da API</Label>
                <Input value={novaUrl} onChange={(e) => setNovaUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button onClick={addGateway} className="w-full">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {gateways.map((gw) => (
          <div key={gw.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <div className="text-sm font-medium text-foreground">{gw.nome}</div>
              <div className="text-xs text-muted-foreground font-mono">{gw.url}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${gw.ativo ? "text-success" : "text-muted-foreground"}`}>
                {gw.ativo ? "Ativo" : "Inativo"}
              </span>
              <button onClick={() => removeGateway(gw.id)} className="text-destructive hover:text-destructive/80">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GatewaysSection;
