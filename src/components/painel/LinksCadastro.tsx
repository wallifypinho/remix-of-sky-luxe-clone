import { useState } from "react";
import { Copy, Check, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

const slugify = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const LinksCadastro = ({ operadorId, operadorNome }: { operadorId?: string; operadorNome?: string }) => {
  const [copied, setCopied] = useState(false);
  const base = getBaseUrl();
  const slug = operadorNome ? slugify(operadorNome) : "";
  const opParam = slug ? `&oid=${slug}` : operadorId ? `&oid=${operadorId}` : "";
  const linkUrl = `${base}/cadastro?airline=azul${opParam}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Seu link de cadastro</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 rounded-lg bg-card border border-border/50 px-3 py-2">
          <p className="text-[11px] text-muted-foreground font-mono truncate">{linkUrl}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" /> Copiado</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copiar</>
          )}
        </button>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

export default LinksCadastro;
