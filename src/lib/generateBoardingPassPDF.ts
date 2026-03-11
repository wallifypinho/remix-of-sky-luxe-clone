import jsPDF from "jspdf";

interface PagamentoData {
  passageiros: any[];
  origem: string;
  destino: string;
  companhia: string;
  numero_voo: string;
  classe: string;
  ida_data: string;
  ida_partida: string;
  ida_chegada: string;
  volta_data: string | null;
  volta_partida: string | null;
  volta_chegada: string | null;
  codigo_reserva: string;
  valor: string;
  codigo_pix: string | null;
  metodo_pagamento?: string;
  status?: string;
  whatsapp_operador?: string | null;
}

const maskCpfPDF = (cpf: string): string => {
  if (!cpf) return "—";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length < 6) return cpf;
  return `${clean.slice(0, 3)}.***.***.${clean.slice(-2)}`;
};

async function generateQRDataURL(text: string): Promise<string> {
  const { QRCodeCanvas } = await import("qrcode.react");
  const React = await import("react");
  const ReactDOMClient = await import("react-dom/client");

  return new Promise<string>((resolve) => {
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:-9999px;";
    document.body.appendChild(container);

    const root = ReactDOMClient.createRoot(container);
    root.render(
      React.createElement(QRCodeCanvas, {
        value: text,
        size: 400,
        level: "M",
        includeMargin: true,
      })
    );

    setTimeout(() => {
      const canvas = container.querySelector("canvas");
      const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
      root.unmount();
      document.body.removeChild(container);
      resolve(dataUrl);
    }, 300);
  });
}

// ═══ Colors ═══
const NAVY = [0, 33, 80] as const;
const DARK_NAVY = [0, 21, 56] as const;
const GOLD = [180, 140, 40] as const;
const GRAY_TEXT = [100, 100, 100] as const;
const GRAY_LIGHT = [150, 150, 150] as const;
const GRAY_LABEL = [120, 120, 120] as const;
const BLACK = [30, 30, 30] as const;
const WHITE = [255, 255, 255] as const;

function drawSectionHeader(doc: jsPDF, title: string, y: number, W: number, mx: number): number {
  doc.setFillColor(...DARK_NAVY);
  doc.roundedRect(mx, y, W - 2 * mx, 10, 1, 1, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(`  ${title}`, mx + 3, y + 7);
  return y + 15;
}

function drawLabelValue(doc: jsPDF, label: string, value: string, x: number, y: number): void {
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY_LABEL);
  doc.text(label, x, y);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.text(value || "—", x, y + 5);
}

function drawTableRow(doc: jsPDF, label: string, value: string, x: number, y: number, labelW: number): void {
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY_LABEL);
  doc.text(label, x, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.text(value || "—", x + labelW, y);
}

function drawFooter(doc: jsPDF, reserva: string, page: number, totalPages: number, W: number): void {
  const H = doc.internal.pageSize.getHeight();
  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(15, H - 22, W - 15, H - 22);
  // Footer band
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, H - 18, W, 18, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(`Reserva: ${reserva}  |  Página ${page}/${totalPages}`, W / 2, H - 10, { align: "center" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("Agência de Viagens - Documento gerado automaticamente", W / 2, H - 5, { align: "center" });
}

// ═══════════════════════════════════════════════════
// PAGE 1 — Flight info, passenger, payment, QR
// ═══════════════════════════════════════════════════
function drawPage1(doc: jsPDF, data: PagamentoData, qrDataUrl: string) {
  const W = doc.internal.pageSize.getWidth();
  const mx = 18;
  const totalPages = 3;

  // ── Header band ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 38, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("AGÊNCIA DE VIAGENS", mx, 18);

  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text("BILHETE ELETRÔNICO", mx, 28);

  // Right side
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  doc.text(`Reserva: ${data.codigo_reserva}`, W - mx, 14, { align: "right" });
  const emissaoDate = new Date().toLocaleDateString("pt-BR");
  doc.text(`Emissão: ${emissaoDate}`, W - mx, 22, { align: "right" });
  doc.text(`Cia: ${data.companhia || "Azul"}`, W - mx, 30, { align: "right" });

  // ── Red/gold line ──
  doc.setFillColor(...GOLD);
  doc.rect(0, 38, W, 1.5, "F");

  // ── Route banner ──
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, 42, W, 32, "F");

  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(data.origem || "—", mx + 20, 62);
  doc.text(data.destino || "—", W - mx - 20, 62, { align: "right" });

  // Plane arrow
  doc.setFontSize(14);
  doc.setTextColor(180, 200, 255);
  doc.text(">", W / 2, 60, { align: "center" });

  // Subtext
  doc.setFontSize(7);
  doc.setTextColor(150, 170, 220);
  doc.text(data.origem || "", mx + 20, 68);
  doc.text(`Voo ${data.numero_voo || "—"}`, W / 2, 68, { align: "center" });
  doc.text(data.destino || "", W - mx - 20, 68, { align: "right" });

  // ── Passenger name bar ──
  let y = 82;
  const passengers = data.passageiros || [];
  const mainPax = passengers[0] || {};
  const nome = (mainPax.nomeCompleto || mainPax.nome || "—").toUpperCase();

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  const nameLines = doc.splitTextToSize(nome, W - 2 * mx - 60);
  doc.text(nameLines, mx, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY_LIGHT);
  doc.text(`${passengers.length} passageiro(s)`, W - mx, y, { align: "right" });

  y += nameLines.length * 6 + 5;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 5;

  // ═══ INFORMAÇÕES DO VOO ═══
  y = drawSectionHeader(doc, "INFORMAÇÕES DO VOO", y, W, mx);

  // Bordered box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  const boxY = y - 2;
  const boxH = data.volta_data ? 60 : 48;
  doc.rect(mx, boxY, W - 2 * mx, boxH, "S");

  const col1 = mx + 5;
  const col2 = mx + (W - 2 * mx) / 3 + 5;
  const col3 = mx + ((W - 2 * mx) * 2) / 3 + 5;

  // Row 1
  drawLabelValue(doc, "ORIGEM", data.origem || "—", col1, y + 2);
  drawLabelValue(doc, "DESTINO", data.destino || "—", col2, y + 2);
  drawLabelValue(doc, "COMPANHIA", data.companhia || "Azul", col3, y + 2);

  // Row 2
  const r2y = y + 16;
  drawLabelValue(doc, "CLASSE", data.classe === "executiva" ? "Executiva" : data.classe === "primeira" ? "Primeira" : "Econômica", col1, r2y);
  drawLabelValue(doc, "VOO", data.numero_voo || "—", col2, r2y);
  drawLabelValue(doc, "RESERVA", data.codigo_reserva || "—", col3, r2y);

  // Row 3
  const r3y = y + 30;
  drawLabelValue(doc, "DATA IDA", data.ida_data || "—", col1, r3y);
  drawLabelValue(doc, "HORÁRIO IDA", `${data.ida_partida || "--:--"} - ${data.ida_chegada || "--:--"}`, col2, r3y);
  drawLabelValue(doc, "DATA VOLTA", data.volta_data || "—", col3, r3y);

  // Row 4 - volta horário
  if (data.volta_data) {
    const r4y = y + 44;
    drawLabelValue(doc, "HORÁRIO VOLTA", `${data.volta_partida || "--:--"} - ${data.volta_chegada || "--:--"}`, col1, r4y);
  }

  y = boxY + boxH + 8;

  // ═══ DADOS DO PASSAGEIRO ═══
  y = drawSectionHeader(doc, "DADOS DO PASSAGEIRO", y, W, mx);

  const paxBoxY = y - 2;
  const paxLines: [string, string][] = [];
  passengers.forEach((p: any, i: number) => {
    const pName = (p.nomeCompleto || p.nome || "—").toUpperCase();
    const pCpf = maskCpfPDF(p.cpfDocumento || p.cpf || "");
    const pEmail = p.email || "—";
    if (i > 0) paxLines.push(["", ""]);
    paxLines.push(["Nome Completo", pName]);
    paxLines.push(["CPF", pCpf]);
    paxLines.push(["Email", pEmail]);
  });

  const paxBoxH = paxLines.length * 7 + 6;
  doc.setDrawColor(200, 200, 200);
  doc.rect(mx, paxBoxY, W - 2 * mx, paxBoxH, "S");

  let paxY = y + 2;
  paxLines.forEach(([label, value]) => {
    if (label === "") {
      doc.setDrawColor(220, 220, 220);
      doc.line(mx + 5, paxY - 1, W - mx - 5, paxY - 1);
      paxY += 2;
      return;
    }
    drawTableRow(doc, label, value, col1, paxY, 42);
    paxY += 7;
  });

  y = paxBoxY + paxBoxH + 8;

  // ═══ INFORMAÇÕES DE PAGAMENTO ═══
  y = drawSectionHeader(doc, "INFORMAÇÕES DE PAGAMENTO", y, W, mx);

  const payBoxY = y - 2;
  const payLines: [string, string][] = [
    ["Valor Total", `R$ ${data.valor}`],
    ["Forma de Pagamento", (data.metodo_pagamento || "PIX").toUpperCase()],
    ["Status", data.status === "pago" || data.status === "taxa_paga" ? "Pagamento Confirmado" : "Pagamento Pendente"],
  ];
  const payBoxH = payLines.length * 7 + 6;
  doc.setDrawColor(200, 200, 200);
  doc.rect(mx, payBoxY, W - 2 * mx, payBoxH, "S");

  let payY = y + 2;
  payLines.forEach(([label, value]) => {
    drawTableRow(doc, label, value, col1, payY, 42);
    payY += 7;
  });

  y = payBoxY + payBoxH + 8;

  // ═══ QR CODE ═══
  if (data.codigo_pix) {
    y = drawSectionHeader(doc, "QR CODE PARA PAGAMENTO PIX", y, W, mx);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TEXT);
    doc.text("Escaneie o QR Code abaixo ou copie o código PIX para efetuar o pagamento.", mx, y + 2);
    y += 8;

    // QR code image
    if (qrDataUrl) {
      const qrSize = 45;
      const qrX = (W - qrSize) / 2;
      try {
        doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
      } catch { /* skip */ }
      y += qrSize + 6;
    }

    // PIX code box
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    const pixText = data.codigo_pix;
    const pixLines = doc.splitTextToSize(pixText, W - 2 * mx - 10);
    const pixBoxH = Math.max(pixLines.length * 3.5 + 6, 12);
    doc.roundedRect(mx, y, W - 2 * mx, pixBoxH, 2, 2, "FD");

    doc.setFontSize(5.5);
    doc.setFont("courier", "normal");
    doc.setTextColor(...GRAY_TEXT);
    doc.text(pixLines, mx + 5, y + 5);
    y += pixBoxH + 5;
  }

  drawFooter(doc, data.codigo_reserva, 1, totalPages, W);
}

// ═══════════════════════════════════════════════════
// PAGE 2 — Rules, check-in, recommendations, FAQ
// ═══════════════════════════════════════════════════
function drawPage2(doc: jsPDF, data: PagamentoData) {
  const W = doc.internal.pageSize.getWidth();
  const mx = 18;
  let y = 18;

  const sections = [
    {
      title: "REGRAS TARIFÁRIAS",
      lines: [
        "Base tarifária (Domésticos): Promo - Econômica promocional | Flex - Econômica flexível.",
        "Base tarifária (Internacionais): Economy - Econômica | Business - Executiva.",
        "Endossos: Não permitidos. Tipo: ida ou ida e volta.",
        "Cancelamentos: Consultar regras da companhia aérea selecionada.",
        "Valores pagos devem ser utilizados em até 1 ano da data de reserva original.",
      ]
    },
    {
      title: "COMO REMARCAR SUA PASSAGEM",
      lines: [
        "Entre em contato com seu agente de viagens pelo WhatsApp informando o código de reserva.",
        "A remarcação está sujeita a disponibilidade e diferença tarifária.",
        "Taxas de remarcação podem ser aplicadas conforme regras da companhia aérea.",
        "Solicite a remarcação com pelo menos 24h de antecedência do voo original.",
      ]
    },
    {
      title: "COMO REALIZAR O CHECK-IN",
      lines: [
        "O check-in online abre 72h antes do voo e fecha 1h antes (voos nacionais) ou 2h antes (internacionais).",
        "Acesse o site ou app da companhia aérea e informe o código de reserva ou e-ticket.",
        "Após o check-in, salve o cartão de embarque no celular ou imprima.",
        "Apresente-se no aeroporto com documento de identidade original ou passaporte (internacional).",
        "Se tiver bagagem para despachar, dirija-se ao balcão da companhia com antecedência.",
      ]
    },
    {
      title: "RECOMENDAÇÕES PARA A VIAGEM",
      lines: [
        "Chegue ao aeroporto com pelo menos 2h de antecedência para voos domésticos e 3h para internacionais.",
        "Mantenha seus documentos, cartão de embarque e comprovante de pagamento sempre acessíveis.",
        "Verifique as regras de bagagem de mão e despachada da sua companhia aérea.",
        "Leve carregadores e adaptadores para dispositivos eletrônicos.",
        "Em viagens internacionais, verifique a necessidade de visto e vacinas obrigatórias.",
      ]
    },
    {
      title: "REGRAS DE CANCELAMENTO",
      lines: [
        "O cancelamento pode ser solicitado junto ao seu agente de viagens.",
        "Cancelamentos realizados até 24h após a compra podem ter reembolso integral (conforme ANAC).",
        "Após o prazo de 24h, aplicam-se as regras tarifárias da companhia aérea.",
        "Multas e taxas de cancelamento variam conforme a classe tarifária adquirida.",
        "Créditos podem ser gerados para utilização futura, válidos por 1 ano.",
      ]
    },
  ];

  sections.forEach((section) => {
    y = drawSectionHeader(doc, section.title, y, W, mx);

    doc.setDrawColor(200, 200, 200);
    const boxStart = y - 2;
    const lineH = 5.5;
    const boxH = section.lines.length * lineH + 6;
    doc.rect(mx, boxStart, W - 2 * mx, boxH, "S");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TEXT);

    section.lines.forEach((line, i) => {
      const wrappedLines = doc.splitTextToSize(line, W - 2 * mx - 10);
      doc.text(wrappedLines, mx + 5, boxStart + 5 + i * lineH);
    });

    y = boxStart + boxH + 6;
  });

  // ═══ FAQ ═══
  y = drawSectionHeader(doc, "PERGUNTAS FREQUENTES (FAQ)", y, W, mx);

  const faqs = [
    { q: "Posso alterar o nome do passageiro?", a: "Não. Alteração de nome não é permitida após a emissão. Verifique os dados antes da confirmação." },
    { q: "Como acompanho meu voo?", a: "Utilize o site ou aplicativo da companhia aérea com seu código de reserva." },
    { q: "Posso levar bagagem de mão?", a: "Sim, conforme as regras da companhia. Geralmente 1 mala de até 10kg (55x35x25cm)." },
    { q: "O que fazer se perder o voo?", a: "Entre em contato imediato com seu agente de viagens para verificar opções de reacomodação." },
    { q: "Como solicito reembolso?", a: "Através do seu agente de viagens, respeitando as regras tarifárias vigentes." },
  ];

  doc.setDrawColor(200, 200, 200);
  const faqBoxStart = y - 2;
  const faqBoxH = faqs.length * 12 + 6;
  doc.rect(mx, faqBoxStart, W - 2 * mx, faqBoxH, "S");

  let faqY = faqBoxStart + 6;
  faqs.forEach((faq) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLACK);
    doc.text(`P: ${faq.q}`, mx + 5, faqY);
    faqY += 5;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TEXT);
    doc.text(`R: ${faq.a}`, mx + 8, faqY);
    faqY += 7;
  });

  drawFooter(doc, data.codigo_reserva, 2, 3, W);
}

// ═══════════════════════════════════════════════════
// PAGE 3 — Important disclaimer
// ═══════════════════════════════════════════════════
function drawPage3(doc: jsPDF, data: PagamentoData) {
  const W = doc.internal.pageSize.getWidth();
  const mx = 18;
  let y = 25;

  // Warning box with gold border
  doc.setFillColor(255, 248, 230);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.roundedRect(mx, y, W - 2 * mx, 30, 3, 3, "FD");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(160, 120, 20);
  doc.text("IMPORTANTE", mx + 8, y + 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY_TEXT);
  doc.text("Documento de reserva - emissão sujeita a confirmação de pagamento.", mx + 8, y + 18);
  doc.text("A emissão oficial ocorre somente após a conclusão de todo o processo com seu agente de viagens.", mx + 8, y + 24);

  drawFooter(doc, data.codigo_reserva, 3, 3, W);
}

export async function generateBoardingPassPDF(
  data: PagamentoData,
  calcBoardingTime: (t: string) => string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Generate QR code for PIX
  let qrDataUrl = "";
  if (data.codigo_pix) {
    try {
      qrDataUrl = await generateQRDataURL(data.codigo_pix);
    } catch (err) {
      console.warn("QR generation failed:", err);
    }
  }

  // Page 1 — Flight info, passenger data, payment, QR
  drawPage1(doc, data, qrDataUrl);

  // Page 2 — Rules, check-in, recommendations, FAQ
  doc.addPage();
  drawPage2(doc, data);

  // Page 3 — Important disclaimer
  doc.addPage();
  drawPage3(doc, data);

  doc.save(`bilhete-${data.codigo_reserva || "embarque"}.pdf`);
}
