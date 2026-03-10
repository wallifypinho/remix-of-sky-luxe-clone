import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Loader2, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useOperadorAuth } from "@/hooks/useOperadorAuth";

const LoginOperador = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useOperadorAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Painel do Operador</h1>
            <p className="text-sm text-muted-foreground">Faça login para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <Label className="text-xs">Senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Entrando...</>
              ) : (
                <><LogIn className="h-4 w-4 mr-2" /> Entrar</>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginOperador;
