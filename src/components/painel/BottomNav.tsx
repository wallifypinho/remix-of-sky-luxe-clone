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
  const tabs: { id: Tab; icon: any }[] = [
    { id: "pedidos", icon: ClipboardList },
    { id: "pagamentos", icon: CreditCard },
    ...(isAdmin ? [{ id: "operadores" as Tab, icon: Users }] : []),
    { id: "gateways", icon: Zap },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-4 mb-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around rounded-[28px] bg-[hsl(0_0%_12%)] backdrop-blur-2xl px-3 py-2.5 shadow-2xl shadow-black/40">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="relative flex items-center justify-center rounded-[20px] transition-all duration-200"
                style={{ width: isActive ? 56 : 44, height: 44 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavPill"
                    className="absolute inset-0 rounded-[20px] bg-[hsl(0_0%_24%)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative z-10">
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors duration-200 ${
                      isActive ? "text-white" : "text-[hsl(0_0%_55%)]"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {tab.id === "pedidos" && pedidosCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground px-0.5">
                      {pedidosCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
