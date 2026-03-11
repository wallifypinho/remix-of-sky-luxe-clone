import { useState, useEffect } from "react";
import { Settings, Plane, ArrowLeft, LogOut, CreditCard, ClipboardList, Users, Cog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LinksCadastro from "@/components/painel/LinksCadastro";
import NovoPagamentoForm from "@/components/painel/NovoPagamentoForm";
import OperadoresSection from "@/components/painel/OperadoresSection";
import GatewaysSection from "@/components/painel/GatewaysSection";
import PedidosSection from "@/components/painel/PedidosSection";
import { useOperadorAuth } from "@/hooks/useOperadorAuth";

type Tab = "pagamentos" | "pedidos" | "operadores" | "gateways";

const PainelPagamentos = () => {
  const { operador, loading, logout, isAdmin } = useOperadorAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [whatsappAdmin, setWhatsappAdmin] = useState("5521982592219");

  useEffect(() => {
    if (!loading && !operador) {
      navigate("/login");
    }
  }, [loading, operador, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!operador) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "pedidos", label: "Pedidos", icon: ClipboardList },
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
    ...(isAdmin ? [{ id: "operadores" as Tab, label: "Operadores", icon: Users }] : []),
    { id: "gateways", label: "Gateways", icon: Cog },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">AeroPayments</h1>
                <p className="text-xs text-muted-foreground">
                  {operador.nome} • {operador.perfil === "admin" ? "Administrador" : "Operador"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-1.5">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card px-4">
        <div className="mx-auto max-w-6xl flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
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
          {activeTab === "pedidos" && (
            <div className="space-y-6">
              <LinksCadastro />
              <PedidosSection />
            </div>
          )}

          {activeTab === "pagamentos" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">WhatsApp do Operador</div>
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
              </div>
              <NovoPagamentoForm />
            </div>
          )}

          {activeTab === "operadores" && isAdmin && (
            <OperadoresSection />
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
