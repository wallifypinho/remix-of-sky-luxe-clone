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
}

const BLUE = "#0033A0";
const DARK_BLUE = "#001560";
const GRAY = "#666666";
const LIGHT_GRAY = "#999999";

function generateQRDataURL(text: string, size: number): string {
  // Create a canvas-based simple QR placeholder using the text
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  
  // Use the QRCodeSVG already on the page if available
  const svgEl = document.querySelector(`svg[data-testid="qr-${text}"]`) as SVGElement | null;
  if (svgEl) {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  }

  // Fallback: render text as placeholder
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000000";
  ctx.font = `${Math.floor(size / 10)}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(text.slice(0, 10), size / 2, size / 2);
  return canvas.toDataURL("image/png");
}

async function renderQRToDataURL(value: string, size: number): Promise<string> {
  // Dynamically render QR using qrcode.react's toDataURL equivalent
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  // Use a hidden canvas approach
  const QRCode = (await import("qrcode.react")).QRCodeCanvas;

  return new Promise((resolve) => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const { createRoot } = require("react-dom/client");
    const root = createRoot(container);
    root.render(
      createElement(QRCode, {
        value,
        size,
        level: "M",
        includeMargin: false,
      })
    );

    setTimeout(() => {
      const canvas = container.querySelector("canvas");
      const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
      root.unmount();
      document.body.removeChild(container);
      resolve(dataUrl);
    }, 200);
  });
}

function drawBoardingPassPage(
  doc: jsPDF,
  data: PagamentoData,
  passenger: any,
  passengerIndex: number,
  isReturn: boolean,
  calcBoardingTime: (t: string) => string,
  qrDataUrl: string
) {
  const W = doc.internal.pageSize.getWidth();
  const companhia = (data.companhia || "AZUL VIAGENS").toUpperCase();

  // ── Blue header ──
  doc.setFillColor(0, 51, 160);
  doc.rect(0, 0, W, 72, "F");

  // Gradient overlay
  doc.setFillColor(0, 32, 128);
  doc.rect(0, 55, W, 17, "F");

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(companhia, W - 15, 18, { align: "right" });

  // "VIAGENS" subtitle
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("V I A G E N S", 15, 18);

  // "Cartão de Embarque" title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Cartão de Embarque", W / 2, 40, { align: "center" });

  // Route subtitle
  const origem = isReturn ? data.destino : data.origem;
  const destino = isReturn ? data.origem : data.destino;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 255);
  doc.text(`${origem}  →  ${destino}`, W / 2, 52, { align: "center" });

  // ── White content area ──
  let y = 82;
  const mx = 15; // margin x

  // Passenger name
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Passageiro:", mx, y);
  y += 6;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  const nome = (passenger.nomeCompleto || passenger.nome || "—").toUpperCase();
  doc.text(nome, mx, y, { maxWidth: W - 30 });
  y += 8;

  // CPF
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("CPF:", mx, y);
  const cpf = passenger.cpfDocumento || passenger.cpf || "—";
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(cpf, mx + 15, y);
  y += 12;

  // ── Table-like section: Assento | Horário saída | Chegada ──
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 6;

  const col1 = mx;
  const col2 = mx + 45;
  const col3 = mx + 110;

  // Headers
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Assento", col1, y);
  doc.text("Horário saída", col2, y);
  doc.text("Chegada", col3, y);
  y += 6;

  // Values
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  const assento = passenger.assento || "—";
  const partida = isReturn ? (data.volta_partida || "--:--") : (data.ida_partida || "--:--");
  const chegada = isReturn ? (data.volta_chegada || "--:--") : (data.ida_chegada || "--:--");
  doc.text(assento, col1, y);
  doc.text(partida, col2, y);
  doc.text(chegada, col3, y);
  y += 10;

  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 8;

  // ── Data | Portão | Código de reserva ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Data", col1, y);
  doc.text("Portão", col2, y);
  doc.text("Código de reserva", col3, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  const dataVoo = isReturn ? (data.volta_data || "—") : (data.ida_data || "—");
  doc.text(dataVoo, col1, y);
  doc.text("—", col2, y); // Portão
  doc.setTextColor(0, 51, 160);
  doc.text(data.codigo_reserva || "—", col3, y);
  y += 14;

  // ── QR Code ──
  if (qrDataUrl) {
    const qrSize = 55;
    const qrX = (W - qrSize) / 2;
    try {
      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    } catch {
      // QR failed, skip
    }
    y += qrSize + 8;
  } else {
    y += 8;
  }

  // ── Boarding time ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Horário de embarque:", mx, y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  const boardingTime = calcBoardingTime(partida);
  doc.text(boardingTime, mx + 55, y);
  y += 10;

  // ── Voo number ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Número do voo:", mx, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(data.numero_voo || "—", mx + 43, y);
  y += 14;

  // ── Footer ──
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 8;

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(`Emissão oficial da companhia ${data.companhia || "Azul"}`, mx, y);
  y += 5;
  doc.text("CNPJ (matriz): 09.296.295/0001-60", mx, y);
}

export async function generateBoardingPassPDF(
  data: PagamentoData,
  calcBoardingTime: (t: string) => string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Generate QR code data URL
  let qrDataUrl = "";
  try {
    qrDataUrl = await renderQRToDataURL(data.codigo_reserva || "BOARDING", 200);
  } catch {
    // Fallback
    qrDataUrl = generateQRDataURL(data.codigo_reserva || "BOARDING", 200);
  }

  // Generate boarding pass for each passenger (ida)
  const passengers = data.passageiros?.length ? data.passageiros : [{}];

  passengers.forEach((passenger: any, i: number) => {
    if (i > 0) doc.addPage();
    drawBoardingPassPage(doc, data, passenger, i, false, calcBoardingTime, qrDataUrl);
  });

  // If there's a return flight, add pages for volta
  if (data.volta_data) {
    passengers.forEach((passenger: any, i: number) => {
      doc.addPage();
      drawBoardingPassPage(doc, data, passenger, i, true, calcBoardingTime, qrDataUrl);
    });
  }

  doc.save(`bilhete-${data.codigo_reserva || "embarque"}.pdf`);
}
