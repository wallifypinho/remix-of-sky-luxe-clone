import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Loader2, Plane, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useOperadorAuth } from "@/hooks/useOperadorAuth";

const FloatingPlane = ({ delay, x, duration }: { delay: number; x: number; duration: number }) => (
  <motion.div
    className="absolute text-primary/5"
    initial={{ y: "110vh", x, rotate: -45 }}
    animate={{ y: "-10vh", rotate: -45 }}
    transition={{ delay, duration, repeat: Infinity, ease: "linear" }}
  >
    <Plane className="h-8 w-8" />
  </motion.div>
);

const LoginOperador = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, operador } = useOperadorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (operador) navigate("/painel");
  }, [operador, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha email e senha");
      return;
    }

    setLoading(true);
    try {
      await login(email, senha);
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
        background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(243 72% 40%) 50%, hsl(230 25% 10%) 100%)`
      }}
    >
      {/* Animated background planes */}
      <FloatingPlane delay={0} x={50} duration={18} />
      <FloatingPlane delay={3} x={200} duration={22} />
      <FloatingPlane delay={6} x={350} duration={16} />
      <FloatingPlane delay={1} x={500} duration={20} />
      <FloatingPlane delay={8} x={700} duration={24} />
      <FloatingPlane delay={4} x={900} duration={19} />

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[120px]"
        style={{ background: "hsl(var(--primary) / 0.15)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-[100px]"
        style={{ background: "hsl(var(--primary) / 0.1)" }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="relative mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/10 backdrop-blur-xl border border-primary-foreground/10 shadow-2xl">
              <Plane className="h-8 w-8 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute -inset-2 rounded-2xl"
              style={{ background: "hsl(var(--primary) / 0.2)" }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
            Aero<span className="opacity-80">Payments</span>
          </h1>
          <p className="text-sm text-primary-foreground/50 mt-1">Painel de Controle</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="rounded-2xl bg-card/95 backdrop-blur-xl p-7 shadow-2xl border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Acesso Restrito</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                type="email"
                placeholder="operador@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11 bg-background/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                className="h-11 bg-background/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold mt-2">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Autenticando...</>
              ) : (
                <><LogIn className="h-4 w-4 mr-2" /> Acessar Painel</>
              )}
            </Button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-primary-foreground/30 mt-6">
          Ambiente seguro • Acesso exclusivo para operadores
        </p>
      </motion.div>
    </div>
  );
};

export default LoginOperador;
