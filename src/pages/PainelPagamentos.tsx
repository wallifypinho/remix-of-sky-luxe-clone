import { useState, useEffect } from "react";
import { Plane, ArrowLeft, LogOut, CreditCard, ClipboardList, Users, Zap } from "lucide-react";
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
import BottomNav from "@/components/painel/BottomNav";
import { useOperadorAuth } from "@/hooks/useOperadorAuth";

type Tab = "pedidos" | "pagamentos" | "operadores" | "gateways";

const PainelPagamentos = () => {
  const { operador, loading, logout, isAdmin } = useOperadorAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [whatsappAdmin, setWhatsappAdmin] = useState("5521982592219");
  const [pedidosCount, setPedidosCount] = useState(0);

  useEffect(() => {
    if (!loading && !operador) {
      navigate("/login");
    }
  }, [loading, operador, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!operador) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "pedidos", label: "Pedidos", icon: ClipboardList, count: pedidosCount },
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
    ...(isAdmin ? [{ id: "operadores" as Tab, label: "Operadores", icon: Users }] : []),
    { id: "gateways", label: "Gateways", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Plane className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">AeroPayments</h1>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {operador.nome} • <span className="text-primary font-semibold">{operador.perfil === "admin" ? "Admin" : "Operador"}</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-1.5 h-9">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Tabs */}
      <div className="border-b border-border bg-card/50 px-4 hidden md:block">
        <div className="mx-auto max-w-6xl flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-5 pb-safe-nav md:pb-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "pedidos" && (
            <div className="space-y-5">
              <LinksCadastro />
              <PedidosSection onCountChange={setPedidosCount} />
            </div>
          )}

          {activeTab === "pagamentos" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">WhatsApp do Operador</div>
                <div className="flex gap-2">
                  <Input
                    value={whatsappAdmin}
                    onChange={(e) => setWhatsappAdmin(e.target.value)}
                    className="flex-1 h-11"
                    placeholder="5511999999999"
                  />
                  <Button onClick={() => toast.success("WhatsApp salvo!")} className="shrink-0 h-11">
                    Salvar
                  </Button>
                </div>
              </div>
              <NovoPagamentoForm />
            </div>
          )}

          {activeTab === "operadores" && isAdmin && <OperadoresSection />}
          {activeTab === "gateways" && <GatewaysSection />}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} isAdmin={isAdmin} pedidosCount={pedidosCount} />
    </div>
  );
};

export default PainelPagamentos;
