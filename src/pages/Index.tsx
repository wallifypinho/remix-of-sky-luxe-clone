import { Link } from "react-router-dom";
import { Plane, CreditCard, ClipboardList, Shield, Zap, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="text-center max-w-lg w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <Plane className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        {/* Title */}
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
          Aero<span className="text-primary">Payments</span>
        </h1>
        <p className="mb-8 text-muted-foreground leading-relaxed">
          Sistema de pagamentos para passageiros aéreos.
          <br />
          Rápido, seguro e profissional.
        </p>

        {/* Action Cards */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/painel">
            <motion.div
              className="group relative flex items-center gap-3 rounded-xl bg-primary p-5 text-left text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CreditCard className="h-6 w-6 shrink-0 opacity-80" />
              <div className="flex-1">
                <div className="font-semibold text-sm">Painel de Pagamentos</div>
                <div className="text-xs opacity-75">Criar e gerenciar cobranças</div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
            </motion.div>
          </Link>

          <Link to="/cadastro">
            <motion.div
              className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-5 text-left text-card-foreground shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ClipboardList className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex-1">
                <div className="font-semibold text-sm">Coleta de Dados</div>
                <div className="text-xs text-muted-foreground">Formulário de passageiros</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 transition-transform group-hover:translate-x-1" />
            </motion.div>
          </Link>
        </div>

        {/* Features */}
        <motion.div
          className="flex items-center justify-center gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Seguro</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Instantâneo</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Multi-operador</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
