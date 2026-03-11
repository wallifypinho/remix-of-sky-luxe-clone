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

/**
 * Captures QR code from the visible page SVG elements rendered by qrcode.react
 */
function captureQRFromPage(): string {
  // Find any QRCodeSVG on the page
  const svgEls = document.querySelectorAll("svg");
  for (const svg of svgEls) {
    // QRCodeSVG from qrcode.react renders with specific structure
    const rects = svg.querySelectorAll("rect");
    if (rects.length > 20) {
      // Likely a QR code SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      return new Promise<string>((resolve) => {
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 400, 400);
          ctx.drawImage(img, 0, 0, 400, 400);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve("");
        };
        img.src = url;
      }) as unknown as string;
    }
  }
  return "";
}

/**
 * Generate QR code as data URL using a hidden canvas
 */
async function generateQRDataURL(text: string): Promise<string> {
  // Dynamically import qrcode.react's canvas variant
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

    // Wait for render
    setTimeout(() => {
      const canvas = container.querySelector("canvas");
      const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
      root.unmount();
      document.body.removeChild(container);
      resolve(dataUrl);
    }, 300);
  });
}

function drawBoardingPassPage(
  doc: jsPDF,
  data: PagamentoData,
  passenger: any,
  isReturn: boolean,
  calcBoardingTime: (t: string) => string,
  qrDataUrl: string
) {
  const W = doc.internal.pageSize.getWidth();
  const mx = 15;

  // ═══ Blue header band ═══
  doc.setFillColor(0, 51, 160);
  doc.rect(0, 0, W, 65, "F");
  // Darker bottom strip
  doc.setFillColor(0, 21, 96);
  doc.rect(0, 50, W, 15, "F");

  // Company branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("A Z U L", mx, 16);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("V I A G E N S", mx, 22);

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Cartão de Embarque", W / 2, 38, { align: "center" });

  // Route in header
  const origem = isReturn ? data.destino : data.origem;
  const destino = isReturn ? data.origem : data.destino;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 255);
  doc.text(`${origem}  —  ${destino}`, W / 2, 48, { align: "center" });

  if (isReturn) {
    doc.setFontSize(7);
    doc.setTextColor(255, 220, 100);
    doc.text("VOLTA", W - mx, 16, { align: "right" });
  }

  // ═══ Content ═══
  let y = 78;

  // Passenger
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Passageiro:", mx, y);
  y += 6;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  const nome = (passenger.nomeCompleto || passenger.nome || "—").toUpperCase();
  // Handle long names
  const nameLines = doc.splitTextToSize(nome, W - 30);
  doc.text(nameLines, mx, y);
  y += nameLines.length * 6 + 3;

  // CPF
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("CPF:", mx, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  const cpf = passenger.cpfDocumento || passenger.cpf || "—";
  doc.text(cpf, mx + 13, y);
  y += 10;

  // ── Separator ──
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 7;

  // ── 3-column: Assento | Saída | Chegada ──
  const colW = (W - 2 * mx) / 3;
  const c1 = mx;
  const c2 = mx + colW;
  const c3 = mx + colW * 2;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Assento", c1, y);
  doc.text("Horário saída", c2, y);
  doc.text("Chegada", c3, y);
  y += 7;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  const assento = passenger.assento || "—";
  const partida = isReturn ? (data.volta_partida || "--:--") : (data.ida_partida || "--:--");
  const chegada = isReturn ? (data.volta_chegada || "--:--") : (data.ida_chegada || "--:--");
  doc.text(assento, c1, y);
  doc.text(partida, c2, y);
  doc.text(chegada, c3, y);
  y += 10;

  // ── Separator ──
  doc.setDrawColor(220, 220, 220);
  doc.line(mx, y, W - mx, y);
  y += 7;

  // ── 3-column: Data | Portão | Reserva ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Data", c1, y);
  doc.text("Portão", c2, y);
  doc.text("Código de reserva", c3, y);
  y += 7;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  const dataVoo = isReturn ? (data.volta_data || "—") : (data.ida_data || "—");
  doc.text(dataVoo, c1, y);
  doc.text("—", c2, y);
  doc.setTextColor(0, 51, 160);
  doc.text(data.codigo_reserva || "—", c3, y);
  y += 14;

  // ── QR Code ──
  if (qrDataUrl) {
    const qrSize = 50;
    const qrX = (W - qrSize) / 2;
    try {
      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    } catch {
      // skip
    }
    y += qrSize + 10;
  } else {
    y += 5;
  }

  // ── Company label ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 160);
  doc.text(data.companhia || "Azul", W / 2, y, { align: "center" });
  y += 10;

  // ── Boarding time ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Horário de embarque:", mx, y);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(calcBoardingTime(partida), mx + 52, y);
  y += 12;

  // ── Footer ──
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 6;

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(`Emissão oficial da companhia ${data.companhia || "Azul"}`, mx, y);
  y += 4;
  doc.text("CNPJ (matriz): 09.296.295/0001-60", mx, y);
}

export async function generateBoardingPassPDF(
  data: PagamentoData,
  calcBoardingTime: (t: string) => string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Generate QR code
  let qrDataUrl = "";
  try {
    qrDataUrl = await generateQRDataURL(data.codigo_reserva || "BOARDING");
  } catch (err) {
    console.warn("QR generation failed:", err);
  }

  const passengers = data.passageiros?.length ? data.passageiros : [{}];

  // IDA pages
  passengers.forEach((passenger: any, i: number) => {
    if (i > 0) doc.addPage();
    drawBoardingPassPage(doc, data, passenger, false, calcBoardingTime, qrDataUrl);
  });

  // VOLTA pages
  if (data.volta_data) {
    passengers.forEach((passenger: any) => {
      doc.addPage();
      drawBoardingPassPage(doc, data, passenger, true, calcBoardingTime, qrDataUrl);
    });
  }

  doc.save(`bilhete-${data.codigo_reserva || "embarque"}.pdf`);
}
