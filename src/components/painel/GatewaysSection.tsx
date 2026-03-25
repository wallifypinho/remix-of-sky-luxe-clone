import { useState } from "react";
import { Zap, Plus, Trash2, Wifi, WifiOff, Eye, EyeOff, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useGatewayStore } from "@/stores/gatewayStore";

const GatewaysSection = () => {
  const { gateways, updateGateway, addGateway, removeGateway: removeFromStore } = useGatewayStore();
  const [novoNome, setNovoNome] = useState("");
  const [novaUrl, setNovaUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingKeys, setEditingKeys] = useState<string | null>(null);

  const handleAdd = () => {
    if (!novoNome || !novaUrl) return;
    addGateway({ id: Date.now().toString(), nome: novoNome, url: novaUrl, ativo: false, secretKey: "", publicKey: "" });
    setNovoNome("");
    setNovaUrl("");
    setOpen(false);
    toast.success("Gateway adicionado!");
  };

  const handleRemove = (id: string) => {
    if (id === "hura-pay" || id === "anubis-pay") {
      toast.error("Gateways integrados não podem ser removidos");
      return;
    }
    removeFromStore(id);
    toast.success("Gateway removido!");
  };

  const toggleAtivo = (id: string) => {
    const gw = gateways.find((g) => g.id === id);
    if (!gw) return;
    if (!gw.ativo && (!gw.secretKey || !gw.publicKey)) {
      toast.error("Configure as chaves antes de ativar o gateway");
      return;
    }
    updateGateway(id, { ativo: !gw.ativo });
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isIntegrated = (id: string) => id === "hura-pay" || id === "anubis-pay";

  return (
    <div className="space-y-4">
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
              <Button onClick={handleAdd} className="w-full h-10 rounded-xl font-semibold">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                      {gw.ativo ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{gw.nome}</p>
                        {isIntegrated(gw.id) && (
                          <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                            Integrado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">{gw.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={gw.ativo} onCheckedChange={() => toggleAtivo(gw.id)} />
                    {!isIntegrated(gw.id) && (
                      <button onClick={() => handleRemove(gw.id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => setEditingKeys(editingKeys === gw.id ? null : gw.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Key className="h-3 w-3" />
                    {editingKeys === gw.id ? "Ocultar chaves" : "Configurar chaves"}
                  </button>

                  {editingKeys === gw.id && (
                    <div className="mt-3 space-y-2.5 rounded-xl border border-border bg-muted/30 p-3">
                      <div>
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Public Key</Label>
                        <div className="flex gap-1.5 mt-1">
                          <Input
                            type={showKeys[`${gw.id}-pub`] ? "text" : "password"}
                            value={gw.publicKey}
                            onChange={(e) => updateGateway(gw.id, { publicKey: e.target.value })}
                            placeholder="pk_live_..."
                            className="text-xs font-mono"
                          />
                          <button onClick={() => toggleShowKey(`${gw.id}-pub`)} className="rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors border border-border">
                            {showKeys[`${gw.id}-pub`] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Secret Key</Label>
                        <div className="flex gap-1.5 mt-1">
                          <Input
                            type={showKeys[`${gw.id}-sec`] ? "text" : "password"}
                            value={gw.secretKey}
                            onChange={(e) => updateGateway(gw.id, { secretKey: e.target.value })}
                            placeholder="sk_live_..."
                            className="text-xs font-mono"
                          />
                          <button onClick={() => toggleShowKey(`${gw.id}-sec`)} className="rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors border border-border">
                            {showKeys[`${gw.id}-sec`] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs rounded-lg"
                        onClick={() => {
                          setEditingKeys(null);
                          toast.success(`Chaves do ${gw.nome} salvas!`);
                        }}
                      >
                        Salvar Chaves
                      </Button>
                    </div>
                  )}
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
