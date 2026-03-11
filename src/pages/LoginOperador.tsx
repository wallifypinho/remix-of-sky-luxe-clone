import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Plane, Shield, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useOperadorAuth } from "@/hooks/useOperadorAuth";

const LoginOperador = () => {
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, operador } = useOperadorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (operador) navigate("/painel");
  }, [operador, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha) {
      toast.error("Digite a senha de acesso");
      return;
    }
    setLoading(true);
    try {
      await login(senha);
      toast.success("Login realizado!");
      navigate("/painel");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(145deg, hsl(213 94% 44%) 0%, hsl(213 94% 30%) 40%, hsl(215 25% 12%) 100%)"
      }}
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px"
      }} />

      <motion.div
        className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full blur-[140px]"
        style={{ background: "hsl(213 94% 44% / 0.2)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-56 h-56 rounded-full blur-[120px]"
        style={{ background: "hsl(30 95% 55% / 0.12)" }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <motion.div
        className="absolute top-[20%] right-[15%] text-primary-foreground/[0.04]"
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Plane className="h-24 w-24 -rotate-12" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[380px] relative z-10"
      >
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        >
          <div className="relative mb-5">
            <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-xl border border-primary-foreground/10">
              <Plane className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight">
            AeroPayments
          </h1>
          <p className="text-sm text-primary-foreground/40 mt-1.5 font-medium">Sistema de Gestão de Reservas</p>
        </motion.div>

        <motion.div
          className="rounded-2xl bg-card/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl border border-border/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Acesso Restrito</span>
              <p className="text-[11px] text-muted-foreground">Somente operadores autorizados</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Senha de Acesso</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                autoFocus
                className="h-12 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-sm font-bold rounded-xl shadow-md shadow-primary/20 mt-1">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Autenticando...</>
              ) : (
                <><Lock className="h-4 w-4 mr-2" /> Acessar Painel</>
              )}
            </Button>
          </form>
        </motion.div>

        <p className="text-center text-[11px] text-primary-foreground/25 mt-6 font-medium">
          Ambiente seguro • Dados criptografados
        </p>
      </motion.div>
    </div>
  );
};

export default LoginOperador;
