import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { LinkCadastro } from "@/types/pagamento";

const linksDefault: LinkCadastro[] = [
  { companhia: "Azul", url: "https://seusite.com/cadastro/1?airline=azul", cor: "border-blue-400 bg-blue-50" },
  { companhia: "GOL", url: "https://seusite.com/cadastro/1?airline=gol", cor: "border-orange-300 bg-orange-50" },
  { companhia: "LATAM", url: "https://seusite.com/cadastro/1?airline=latam", cor: "border-red-300 bg-red-50" },
];

const LinksCadastro = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, companhia: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(companhia);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-primary">🔗</span> Links de Cadastro por Companhia
      </h3>
      <div className="space-y-3">
        {linksDefault.map((link) => (
          <div
            key={link.companhia}
            className={`flex items-center justify-between rounded-lg border-l-4 px-4 py-3 ${link.cor}`}
          >
            <div>
              <div className="text-sm font-semibold text-foreground">{link.companhia}</div>
              <div className="text-xs text-muted-foreground font-mono">{link.url}</div>
            </div>
            <button
              onClick={() => handleCopy(link.url, link.companhia)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedId === link.companhia ? (
                <><Check className="h-3.5 w-3.5" /> Copiado</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copiar</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinksCadastro;
