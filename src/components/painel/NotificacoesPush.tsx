import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NotificacoesPush = () => {
  const [ativadas, setAtivadas] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-sm font-medium text-foreground">Notificações Push</span>
            <p className="text-xs text-muted-foreground">
              Você receberá uma notificação quando um cliente preencher o formulário de cadastro.
            </p>
          </div>
        </div>
        <Button
          variant={ativadas ? "default" : "outline"}
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setAtivadas(!ativadas)}
        >
          <Bell className="h-3.5 w-3.5" />
          {ativadas ? "Ativadas" : "Desativadas"}
        </Button>
      </div>
    </div>
  );
};

export default NotificacoesPush;
