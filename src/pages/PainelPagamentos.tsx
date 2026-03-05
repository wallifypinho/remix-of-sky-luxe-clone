import { useState } from "react";
import { Settings, Plane, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LinksCadastro from "@/components/painel/LinksCadastro";
import WhatsAppConfig from "@/components/painel/WhatsAppConfig";
import NotificacoesPush from "@/components/painel/NotificacoesPush";
import GatewaysSection from "@/components/painel/GatewaysSection";
import NovoPagamentoForm from "@/components/painel/NovoPagamentoForm";


type Tab = "pagamentos" | "pedidos" | "operadores" | "gateways";

const PainelPagamentos = () => {
  const [activeTab, setActiveTab] = useState<Tab>("pagamentos");
  const [whatsappAdmin, setWhatsappAdmin] = useState("5521982592219");

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "pagamentos", label: "Pagamentos", count: 8 },
    { id: "pedidos", label: "Pedidos", count: 24 },
    { id: "operadores", label: "Operadores", count: 4 },
    { id: "gateways", label: "Gateways", count: 1 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-1">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Painel Principal</h1>
              <p className="text-xs text-muted-foreground">Gerencie pagamentos, operadores e gateways</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card px-4">
        <div className="mx-auto max-w-6xl flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs ${activeTab === tab.id ? "opacity-80" : ""}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "pagamentos" && (
            <div className="space-y-6">
              {/* WhatsApp Admin */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">Meu WhatsApp (Admin)</div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-muted-foreground">💬</span>
                    <Input
                      value={whatsappAdmin}
                      onChange={(e) => setWhatsappAdmin(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Button onClick={() => toast.success("WhatsApp salvo!")} className="shrink-0">
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Usado como WhatsApp padrão para coleta de dados e pagamentos do admin.
                </p>
              </div>

              {/* Main content: Form + List */}
              <NovoPagamentoForm />
            </div>
          )}

          {activeTab === "pedidos" && (
            <div className="space-y-6">
              <LinksCadastro />
              <WhatsAppConfig />
              <NotificacoesPush />
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Plane className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground mb-1">Pedidos</h3>
                <p className="text-sm text-muted-foreground">Lista de pedidos dos clientes aparecerá aqui</p>
              </div>
            </div>
          )}

          {activeTab === "operadores" && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Settings className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground mb-1">Operadores (4/20)</h3>
              <p className="text-sm text-muted-foreground">Gerencie seus operadores aqui</p>
            </div>
          )}

          {activeTab === "gateways" && (
            <GatewaysSection />
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PainelPagamentos;
