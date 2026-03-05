import { useState } from "react";
import { MessageCircle, Pencil, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WhatsAppConfig = () => {
  const [whatsapp, setWhatsapp] = useState("5521982592219");
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
    toast.success("WhatsApp atualizado!");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Meu WhatsApp</span>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="h-8 w-40 text-sm"
            />
            <Button size="sm" onClick={handleSave} className="h-8 gap-1">
              <Save className="h-3 w-3" /> Salvar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-mono">{whatsapp}</span>
            <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConfig;
