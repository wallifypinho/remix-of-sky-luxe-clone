import { ClipboardList, CreditCard, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "pedidos" | "pagamentos" | "operadores" | "gateways";

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  isAdmin: boolean;
  pedidosCount?: number;
}

const BottomNav = ({ activeTab, onChange, isAdmin, pedidosCount = 0 }: BottomNavProps) => {
  const tabs: { id: Tab; icon: any; label: string; adminOnly?: boolean }[] = [
    { id: "pedidos", icon: ClipboardList, label: "Pedidos" },
    { id: "pagamentos", icon: CreditCard, label: "Pagamentos" },
    ...(isAdmin ? [{ id: "operadores" as Tab, icon: Users, label: "Operadores" }] : []),
    { id: "gateways", icon: Zap, label: "Gateways" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-lg shadow-foreground/5 px-2 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 relative z-10 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-semibold relative z-10 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
