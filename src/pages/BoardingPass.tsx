import { useState } from "react";
import { Plane, ChevronDown, ChevronUp, AlertTriangle, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";

const BoardingPass = () => {
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  return (
    <div className="min-h-screen bg-primary flex items-start justify-center py-8 px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="h-1 w-8 rounded-full bg-primary-foreground/30" />
          <div className="text-right">
            <div className="text-xs text-primary-foreground/60 tracking-widest uppercase">Agência de Viagens</div>
            <div className="text-sm font-bold text-warning italic">Premium</div>
          </div>
        </div>

        {/* Client name */}
        <div className="px-4 mb-4">
          <div className="text-xs text-primary-foreground/50 uppercase tracking-wider">Cliente</div>
          <div className="text-lg font-bold text-primary-foreground uppercase tracking-wide">
            RISONEIDE MORAES DA SILVA
          </div>
        </div>

        {/* White card */}
        <div className="rounded-3xl bg-card shadow-2xl overflow-hidden">
          {/* Flight route */}
          <div className="px-6 pt-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-3xl font-black text-foreground tracking-wider">GRU</div>
                <div className="text-xs text-muted-foreground">Origem</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Plane className="h-5 w-5 text-primary" />
                <div className="text-[10px] text-muted-foreground">Voo AD8828</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-foreground tracking-wider">FOR</div>
                <div className="text-xs text-muted-foreground">Destino</div>
              </div>
            </div>

            {/* Times */}
            <div className="flex justify-between mb-6">
              <div>
                <div className="text-xs text-muted-foreground uppercase">Partida</div>
                <div className="text-3xl font-bold text-foreground">06:00</div>
                <div className="text-xs text-muted-foreground">10/06/2026</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase">Chegada</div>
                <div className="text-3xl font-bold text-foreground">10:45</div>
                <div className="text-xs text-muted-foreground">10/06/2026</div>
              </div>
            </div>

            {/* Embarque & Portão */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase">Início Embarque</div>
                <div className="text-xl font-bold text-foreground">06:00</div>
                <div className="text-xs text-muted-foreground uppercase mt-2">Portão</div>
                <div className="text-xl font-bold text-foreground">37A</div>
              </div>
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 ${Math.random() > 0.4 ? "bg-foreground" : "bg-muted"}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Volta */}
            <div className="rounded-xl border border-border p-3 mb-4">
              <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                ✈️ VOLTA
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Data</div>
                  <div className="font-semibold text-foreground">10/07/2026</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Partida</div>
                  <div className="font-semibold text-foreground">18:15</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Chegada</div>
                  <div className="font-semibold text-foreground">23:05</div>
                </div>
              </div>
            </div>

            {/* Divider with dots */}
            <div className="relative flex items-center my-4">
              <div className="absolute -left-6 h-5 w-5 rounded-full bg-primary" />
              <div className="flex-1 border-t-2 border-dashed border-border" />
              <div className="absolute -right-6 h-5 w-5 rounded-full bg-primary" />
            </div>

            {/* Seat info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Assento</div>
                  <div className="text-xl font-bold text-foreground">7A</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Seção</div>
                  <div className="text-xl font-bold text-foreground">A</div>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Embarque prioritário</span>
              </div>
            </div>

            {/* More details toggle */}
            <button
              onClick={() => setDetalhesAbertos(!detalhesAbertos)}
              className="w-full flex items-center justify-center gap-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <Info className="h-4 w-4" />
              {detalhesAbertos ? "Fechar detalhes" : "Mais detalhes"}
              {detalhesAbertos ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {detalhesAbertos && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 mb-4"
              >
                {/* Dados do Passageiro */}
                <div className="rounded-xl border border-border p-4">
                  <h4 className="flex items-center gap-1 text-sm font-semibold text-foreground mb-3">
                    👤 Dados do Passageiro
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <div className="text-muted-foreground uppercase">Nome</div>
                      <div className="font-medium text-foreground">RISONEIDE MORAES DA SILVA</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">CPF</div>
                      <div className="font-medium text-foreground">822.***.***.72</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Companhia</div>
                      <div className="font-medium text-foreground">—</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Voo</div>
                      <div className="font-medium text-foreground">AD8828</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Origem</div>
                      <div className="font-medium text-foreground">GRU - São Paulo</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Destino</div>
                      <div className="font-medium text-foreground">FOR - Fortaleza</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Reserva</div>
                      <div className="font-medium text-primary">FP63259N</div>
                    </div>
                  </div>
                </div>

                {/* Info Adicionais */}
                <div className="rounded-xl border border-border p-4">
                  <h4 className="flex items-center gap-1 text-sm font-semibold text-foreground mb-3">
                    ℹ️ Informações Adicionais
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <div className="text-muted-foreground uppercase">Tipo de Tarifa</div>
                      <div className="font-medium text-foreground">Promo</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Franquia de Bagagem</div>
                      <div className="font-medium text-foreground">🧳 23kg despachada</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Bagagem de Mão</div>
                      <div className="font-medium text-foreground">1x até 10kg</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase">Classe</div>
                      <div className="font-medium text-foreground">Econômica</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment warning */}
            <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-warning">🟡 Pendência no pagamento</span>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-4">
              ⚠ Em 30 minutos as reservas são arquivadas automaticamente pelo sistema.
            </p>
          </div>

          {/* Footer */}
          <div className="bg-primary px-6 py-3 text-center">
            <div className="text-xs font-semibold text-primary-foreground">
              Pagamento processado com segurança
            </div>
            <div className="text-[10px] text-primary-foreground/60">
              Verificação protegida · Dados criptografados
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BoardingPass;
