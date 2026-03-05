import { useState } from "react";
import { Plus, Minus, Upload, ClipboardPaste, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Passageiro } from "@/types/pagamento";

const NovoPagamentoForm = () => {
  const [metodoPagamento, setMetodoPagamento] = useState<"pix" | "gateway">("pix");
  const [numPassageiros, setNumPassageiros] = useState(1);
  const [passageirosAbertos, setPassageirosAbertos] = useState<number[]>([0]);
  const [passageiros, setPassageiros] = useState<Partial<Passageiro>[]>([{}]);

  // Flight info
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [companhia, setCompanhia] = useState("");
  const [numeroVoo, setNumeroVoo] = useState("");
  const [classe, setClasse] = useState("economica");

  // IDA
  const [idaData, setIdaData] = useState("");
  const [idaPartida, setIdaPartida] = useState("");
  const [idaChegada, setIdaChegada] = useState("");

  // VOLTA
  const [voltaData, setVoltaData] = useState("");
  const [voltaPartida, setVoltaPartida] = useState("");
  const [voltaChegada, setVoltaChegada] = useState("");

  // Payment
  const [descricao, setDescricao] = useState("");
  const [codReserva, setCodReserva] = useState("");
  const [valor, setValor] = useState("");
  const [whatsappCliente, setWhatsappCliente] = useState("");
  const [codigoPix, setCodigoPix] = useState("");

  // Config link
  const [exibirTelaBusca, setExibirTelaBusca] = useState(true);
  const [solicitarOrigem, setSolicitarOrigem] = useState(false);
  const [exigirOrigem, setExigirOrigem] = useState(false);

  const addPassageiro = () => {
    setNumPassageiros((n) => n + 1);
    setPassageiros((p) => [...p, {}]);
    setPassageirosAbertos((o) => [...o, passageiros.length]);
  };

  const removePassageiro = () => {
    if (numPassageiros <= 1) return;
    setNumPassageiros((n) => n - 1);
    setPassageiros((p) => p.slice(0, -1));
  };

  const togglePassageiro = (idx: number) => {
    setPassageirosAbertos((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const updatePassageiro = (idx: number, field: string, value: string) => {
    setPassageiros((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!valor) {
      toast.error("Informe o valor do pagamento");
      return;
    }
    if (!codigoPix && metodoPagamento === "pix") {
      toast.error("Informe o código PIX");
      return;
    }
    toast.success(`Pagamento gerado para ${numPassageiros} passageiro(s)!`);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
        <Plus className="h-4 w-4" /> Novo Pagamento
      </h3>

      {/* Upload de Cotação */}
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          📋 Upload de Cotação (leitura automática)
        </Label>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-6 cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <span className="text-xs text-muted-foreground">Envie a imagem da cotação para preenchimento automático</span>
        </div>
      </div>

      {/* Colar texto de reserva */}
      <button className="mb-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 rounded-lg border border-border">
        <ClipboardPaste className="h-4 w-4" /> Colar texto de reserva
      </button>

      {/* Método de Pagamento */}
      <div className="mb-4">
        <Label className="text-xs font-medium mb-2 block">Método de Pagamento</Label>
        <div className="flex gap-2">
          <button
            onClick={() => setMetodoPagamento("pix")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              metodoPagamento === "pix"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            📱 PIX Manual
          </button>
          <button
            onClick={() => setMetodoPagamento("gateway")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              metodoPagamento === "gateway"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            ⚡ Gateway
          </button>
        </div>
      </div>

      {/* N° de Passageiros */}
      <div className="mb-5">
        <Label className="text-xs font-medium mb-2 flex items-center gap-1">
          👥 N° de Passageiros
        </Label>
        <div className="flex items-center gap-3">
          <button
            onClick={removePassageiro}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-semibold">
            {numPassageiros}
          </span>
          <button
            onClick={addPassageiro}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
          <span className="text-xs text-muted-foreground">{numPassageiros} passageiro{numPassageiros > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Passengers */}
      {passageiros.map((p, idx) => (
        <div key={idx} className="mb-4 rounded-lg border border-border">
          <button
            onClick={() => togglePassageiro(idx)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
          >
            <span>{idx + 1} &nbsp; Passageiro {idx + 1}</span>
            {passageirosAbertos.includes(idx) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {passageirosAbertos.includes(idx) && (
            <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
              <div>
                <Label className="text-xs">Nome Completo *</Label>
                <Input placeholder="Nome completo" value={p.nomeCompleto || ""} onChange={(e) => updatePassageiro(idx, "nomeCompleto", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">CPF/Documento *</Label>
                  <Input placeholder="000.000.000-00" value={p.cpfDocumento || ""} onChange={(e) => updatePassageiro(idx, "cpfDocumento", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Data de Nascimento</Label>
                  <Input placeholder="DD/MM/AAAA" value={p.dataNascimento || ""} onChange={(e) => updatePassageiro(idx, "dataNascimento", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Sexo</Label>
                  <Select value={p.sexo || ""} onValueChange={(v) => updatePassageiro(idx, "sexo", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input placeholder="(11) 99999-9999" value={p.telefone || ""} onChange={(e) => updatePassageiro(idx, "telefone", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs">E-mail</Label>
                <Input placeholder="email@exemplo.com" value={p.email || ""} onChange={(e) => updatePassageiro(idx, "email", e.target.value)} />
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={addPassageiro} className="mb-5 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors w-full justify-center py-2">
        <Plus className="h-3.5 w-3.5" /> Adicionar passageiro
      </button>

      {/* Flight info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-xs">Origem</Label>
          <Input placeholder="Ex: GRU" value={origem} onChange={(e) => setOrigem(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Destino *</Label>
          <Input placeholder="Ex: SDU" value={destino} onChange={(e) => setDestino(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <Label className="text-xs">Companhia</Label>
          <Input placeholder="Ex: LATAM" value={companhia} onChange={(e) => setCompanhia(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">N° Voo</Label>
          <Input placeholder="AD5062" value={numeroVoo} onChange={(e) => setNumeroVoo(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Classe</Label>
          <Select value={classe} onValueChange={setClasse}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="economica">Econômica</SelectItem>
              <SelectItem value="executiva">Executiva</SelectItem>
              <SelectItem value="primeira">Primeira</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* IDA */}
      <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-primary">✈️ IDA</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Data</Label>
            <Input placeholder="DD/MM/YYYY" value={idaData} onChange={(e) => setIdaData(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Partida</Label>
            <Input placeholder="HH:MM" value={idaPartida} onChange={(e) => setIdaPartida(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Chegada</Label>
            <Input placeholder="HH:MM" value={idaChegada} onChange={(e) => setIdaChegada(e.target.value)} />
          </div>
        </div>
      </div>

      {/* VOLTA */}
      <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-primary">🔄 VOLTA</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Data</Label>
            <Input placeholder="DD/MM/YYYY" value={voltaData} onChange={(e) => setVoltaData(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Partida</Label>
            <Input placeholder="HH:MM" value={voltaPartida} onChange={(e) => setVoltaPartida(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Chegada</Label>
            <Input placeholder="HH:MM" value={voltaChegada} onChange={(e) => setVoltaChegada(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Descrição, Reserva, Valor */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-xs">Descrição</Label>
          <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Cód. Reserva</Label>
          <Input placeholder="Ex: ABC123" value={codReserva} onChange={(e) => setCodReserva(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-xs">Valor (R$) *</Label>
          <Input value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">WhatsApp</Label>
          <Input placeholder="5511999999999" value={whatsappCliente} onChange={(e) => setWhatsappCliente(e.target.value)} />
        </div>
      </div>

      {/* Config do Link */}
      <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="mb-3 flex items-center gap-1 text-xs font-semibold text-primary">
          ⚙️ Configuração do Link (desta reserva)
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground">Exibir tela de busca</span>
            <Switch checked={exibirTelaBusca} onCheckedChange={setExibirTelaBusca} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground">Solicitar campo Origem</span>
            <Switch checked={solicitarOrigem} onCheckedChange={setSolicitarOrigem} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground">Exigir origem para validar</span>
            <Switch checked={exigirOrigem} onCheckedChange={setExigirOrigem} />
          </div>
        </div>
      </div>

      {/* Código PIX */}
      <div className="mb-5">
        <Label className="text-xs">Código PIX *</Label>
        <Textarea
          value={codigoPix}
          onChange={(e) => setCodigoPix(e.target.value)}
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} className="w-full h-12 text-sm font-semibold">
        Gerar Pagamento ({numPassageiros} passageiro{numPassageiros > 1 ? "s" : ""})
      </Button>
    </div>
  );
};

export default NovoPagamentoForm;
