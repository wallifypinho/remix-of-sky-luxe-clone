import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface LinkCadastro {
  companhia: string;
  url: string;
  accent: string;
  bg: string;
  icon: string;
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

const slugify = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const buildLinks = (operadorId?: string, operadorNome?: string): LinkCadastro[] => {
  const base = getBaseUrl();
  const slug = operadorNome ? slugify(operadorNome) : "";
  const opParam = slug ? `&oid=${slug}` : operadorId ? `&oid=${operadorId}` : "";
  return [
    {
      companhia: "Azul",
      url: `${base}/cadastro?airline=azul${opParam}`,
      accent: "hsl(210, 100%, 50%)",
      bg: "hsl(210, 100%, 97%)",
      icon: "✈️",
    },
    {
      companhia: "GOL",
      url: `${base}/cadastro?airline=gol${opParam}`,
      accent: "hsl(25, 95%, 53%)",
      bg: "hsl(25, 100%, 97%)",
      icon: "🟠",
    },
    {
      companhia: "LATAM",
      url: `${base}/cadastro?airline=latam${opParam}`,
      accent: "hsl(0, 80%, 55%)",
      bg: "hsl(0, 100%, 97%)",
      icon: "🔴",
    },
  ];
};

const LinksCadastro = ({ operadorId, operadorNome }: { operadorId?: string; operadorNome?: string }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const linksDefault = buildLinks(operadorId, operadorNome);

  const handleCopy = (url: string, companhia: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(companhia);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Links de Cadastro
      </h3>
      <div className="grid gap-2.5">
        {linksDefault.filter(link => link.companhia === "Azul").map((link) => {
          const isCopied = copiedId === link.companhia;
          return (
            <div
              key={link.companhia}
              className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ background: link.accent }}
              />
              <div className="flex items-center gap-3 pl-4 pr-3 py-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-sm shrink-0"
                  style={{ background: link.bg }}
                >
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{link.companhia}</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                    {link.url}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(link.url, link.companhia)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 bg-muted/50 hover:bg-muted text-foreground"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinksCadastro;
