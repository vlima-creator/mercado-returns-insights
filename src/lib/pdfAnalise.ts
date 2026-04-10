import jsPDF from 'jspdf';

const COLORS = {
  primary: [30, 64, 175] as [number, number, number],     // blue
  heading: [17, 24, 39] as [number, number, number],       // near-black
  body: [55, 65, 81] as [number, number, number],          // dark gray
  muted: [107, 114, 128] as [number, number, number],      // gray
  accent: [79, 70, 229] as [number, number, number],       // indigo
  success: [22, 163, 74] as [number, number, number],      // green
  warning: [202, 138, 4] as [number, number, number],      // amber
  divider: [229, 231, 235] as [number, number, number],    // light gray
  sectionBg: [243, 244, 246] as [number, number, number],  // very light gray
  white: [255, 255, 255] as [number, number, number],
};

const PAGE = { width: 210, height: 297, marginX: 15, marginTop: 22, marginBottom: 20 };
const CONTENT_WIDTH = PAGE.width - PAGE.marginX * 2;

interface PdfContext {
  pdf: jsPDF;
  y: number;
  pageNum: number;
}

function checkPage(ctx: PdfContext, needed: number) {
  if (ctx.y + needed > PAGE.height - PAGE.marginBottom) {
    ctx.pdf.addPage();
    ctx.pageNum++;
    ctx.y = PAGE.marginTop;
  }
}

function addHeader(ctx: PdfContext, pageTitle: string) {
  // Top accent bar
  ctx.pdf.setFillColor(...COLORS.primary);
  ctx.pdf.rect(0, 0, PAGE.width, 3, 'F');

  ctx.pdf.setFontSize(7);
  ctx.pdf.setTextColor(...COLORS.muted);
  ctx.pdf.text(pageTitle, PAGE.marginX, 10);
  ctx.pdf.text(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), PAGE.width - PAGE.marginX, 10, { align: 'right' });

  // Thin line under header
  ctx.pdf.setDrawColor(...COLORS.divider);
  ctx.pdf.setLineWidth(0.3);
  ctx.pdf.line(PAGE.marginX, 13, PAGE.width - PAGE.marginX, 13);
}

function addFooters(pdf: jsPDF, totalPages: number) {
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    // Bottom accent bar
    pdf.setFillColor(...COLORS.primary);
    pdf.rect(0, PAGE.height - 3, PAGE.width, 3, 'F');

    pdf.setFontSize(6.5);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(
      '© 2026 Desenvolvido por Vinicius Lima | CNPJ: 47.192.694/0001-70 · Todos os direitos reservados',
      PAGE.width / 2, PAGE.height - 6, { align: 'center' }
    );
    pdf.text(`${i} / ${totalPages}`, PAGE.width - PAGE.marginX, PAGE.height - 6, { align: 'right' });
  }
}

function drawSectionTitle(ctx: PdfContext, title: string, sectionNumber?: string) {
  checkPage(ctx, 16);

  // Section background band
  ctx.pdf.setFillColor(...COLORS.sectionBg);
  ctx.pdf.roundedRect(PAGE.marginX, ctx.y - 1, CONTENT_WIDTH, 9, 1.5, 1.5, 'F');

  // Section number badge
  if (sectionNumber) {
    ctx.pdf.setFillColor(...COLORS.primary);
    ctx.pdf.roundedRect(PAGE.marginX + 2, ctx.y + 0.5, 6, 6, 1, 1, 'F');
    ctx.pdf.setFontSize(7);
    ctx.pdf.setTextColor(...COLORS.white);
    ctx.pdf.text(sectionNumber, PAGE.marginX + 5, ctx.y + 5, { align: 'center' });

    ctx.pdf.setFontSize(10);
    ctx.pdf.setTextColor(...COLORS.heading);
    ctx.pdf.setFont('helvetica', 'bold');
    ctx.pdf.text(title, PAGE.marginX + 11, ctx.y + 5.5);
  } else {
    ctx.pdf.setFontSize(10);
    ctx.pdf.setTextColor(...COLORS.heading);
    ctx.pdf.setFont('helvetica', 'bold');
    ctx.pdf.text(title, PAGE.marginX + 3, ctx.y + 5.5);
  }

  ctx.pdf.setFont('helvetica', 'normal');
  ctx.y += 13;
}

function drawText(ctx: PdfContext, text: string, opts?: { bold?: boolean; indent?: number; fontSize?: number; color?: [number, number, number]; bullet?: boolean }) {
  const fontSize = opts?.fontSize ?? 8.5;
  const indent = opts?.indent ?? 0;
  const color = opts?.color ?? COLORS.body;
  const maxWidth = CONTENT_WIDTH - indent - 2;

  ctx.pdf.setFontSize(fontSize);
  ctx.pdf.setTextColor(...color);
  ctx.pdf.setFont('helvetica', opts?.bold ? 'bold' : 'normal');

  const lines = ctx.pdf.splitTextToSize(text, maxWidth);
  const lineHeight = fontSize * 0.45;

  checkPage(ctx, lines.length * lineHeight + 2);

  const x = PAGE.marginX + indent;

  if (opts?.bullet) {
    ctx.pdf.setFillColor(...COLORS.primary);
    ctx.pdf.circle(x - 2, ctx.y + 1.2, 0.8, 'F');
  }

  for (const line of lines) {
    checkPage(ctx, lineHeight + 1);
    ctx.pdf.text(line, x, ctx.y + 2);
    ctx.y += lineHeight;
  }
  ctx.y += 1.5;
  ctx.pdf.setFont('helvetica', 'normal');
}

function drawDivider(ctx: PdfContext) {
  checkPage(ctx, 6);
  ctx.y += 2;
  ctx.pdf.setDrawColor(...COLORS.divider);
  ctx.pdf.setLineWidth(0.3);
  ctx.pdf.line(PAGE.marginX, ctx.y, PAGE.width - PAGE.marginX, ctx.y);
  ctx.y += 4;
}

// Parse markdown into structured blocks for the PDF
function parseMarkdownToPdf(ctx: PdfContext, markdown: string) {
  const lines = markdown.split('\n');
  let sectionCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      ctx.y += 1.5;
      continue;
    }

    // H1
    if (trimmed.startsWith('# ')) {
      // Skip, we handle the title separately
      continue;
    }

    // H2 - section titles
    if (trimmed.startsWith('## ')) {
      const title = trimmed.slice(3).replace(/\*\*/g, '');
      // Detect numbered sections
      const numMatch = title.match(/^(\d+)\.\s*(.*)/);
      if (numMatch) {
        sectionCount++;
        drawDivider(ctx);
        drawSectionTitle(ctx, numMatch[2], numMatch[1]);
      } else {
        drawDivider(ctx);
        drawSectionTitle(ctx, title);
      }
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      const title = trimmed.slice(4).replace(/\*\*/g, '');
      checkPage(ctx, 10);
      ctx.y += 2;
      ctx.pdf.setFontSize(9);
      ctx.pdf.setTextColor(...COLORS.accent);
      ctx.pdf.setFont('helvetica', 'bold');
      ctx.pdf.text(title, PAGE.marginX + 2, ctx.y + 2);
      ctx.pdf.setFont('helvetica', 'normal');
      ctx.y += 6;
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      drawDivider(ctx);
      continue;
    }

    // Checkbox items
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      const checked = trimmed.startsWith('- [x]');
      const text = trimmed.slice(5).trim();
      checkPage(ctx, 6);

      // Draw checkbox
      const cbX = PAGE.marginX + 4;
      ctx.pdf.setDrawColor(...COLORS.muted);
      ctx.pdf.setLineWidth(0.3);
      ctx.pdf.rect(cbX, ctx.y - 0.5, 3, 3);
      if (checked) {
        ctx.pdf.setFillColor(...COLORS.success);
        ctx.pdf.rect(cbX + 0.5, ctx.y, 2, 2, 'F');
      }

      drawText(ctx, text, { indent: 12, fontSize: 8 });
      continue;
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      checkPage(ctx, 8);
      // Number badge
      ctx.pdf.setFillColor(...COLORS.primary);
      ctx.pdf.roundedRect(PAGE.marginX + 2, ctx.y - 0.5, 5, 5, 1, 1, 'F');
      ctx.pdf.setFontSize(7);
      ctx.pdf.setTextColor(...COLORS.white);
      ctx.pdf.text(numberedMatch[1], PAGE.marginX + 4.5, ctx.y + 3, { align: 'center' });

      // Parse bold parts
      const content = numberedMatch[2];
      const boldMatch = content.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
      if (boldMatch) {
        drawText(ctx, boldMatch[1] + ':', { indent: 10, bold: true, fontSize: 8.5, color: COLORS.heading });
        if (boldMatch[2]) {
          drawText(ctx, boldMatch[2], { indent: 10, fontSize: 8 });
        }
      } else {
        drawText(ctx, content, { indent: 10 });
      }
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
      const content = trimmed.slice(2);
      const boldMatch = content.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
      if (boldMatch) {
        drawText(ctx, boldMatch[1] + ':', { indent: 6, bold: true, bullet: true, color: COLORS.heading });
        if (boldMatch[2]) {
          drawText(ctx, boldMatch[2], { indent: 10, fontSize: 8 });
        }
      } else {
        drawText(ctx, content.replace(/\*\*/g, ''), { indent: 6, bullet: true });
      }
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2);
      drawText(ctx, content.replace(/\*\*/g, ''), { indent: 6, bullet: true, fontSize: 8 });
      continue;
    }

    // Bold line
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      const text = trimmed.replace(/\*\*/g, '');
      ctx.y += 1;
      drawText(ctx, text, { bold: true, color: COLORS.heading, fontSize: 9 });
      continue;
    }

    // Bold with content after
    const inlineBold = trimmed.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
    if (inlineBold) {
      drawText(ctx, inlineBold[1] + ':', { bold: true, color: COLORS.heading });
      if (inlineBold[2]) {
        drawText(ctx, inlineBold[2], { indent: 4, fontSize: 8 });
      }
      continue;
    }

    // Regular text
    drawText(ctx, trimmed.replace(/\*\*/g, '').replace(/\*/g, ''), { fontSize: 8.5 });
  }
}

export function generateAnalysisPdf(markdown: string, adUrl: string) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const ctx: PdfContext = { pdf, y: PAGE.marginTop, pageNum: 1 };

  // === COVER / Title block ===
  addHeader(ctx, 'Análise de Anúncio — DevTrack ML');

  ctx.y = 30;

  // Title box
  pdf.setFillColor(...COLORS.primary);
  pdf.roundedRect(PAGE.marginX, ctx.y, CONTENT_WIDTH, 22, 2, 2, 'F');

  pdf.setFontSize(16);
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Diagnóstico Completo do Anúncio', PAGE.width / 2, ctx.y + 10, { align: 'center' });

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 210, 255);
  const displayUrl = adUrl.length > 80 ? adUrl.slice(0, 80) + '...' : adUrl;
  pdf.text(displayUrl, PAGE.width / 2, ctx.y + 17, { align: 'center' });

  ctx.y += 30;

  // Info badges
  const badgeData = [
    { label: 'Gerado em', value: new Date().toLocaleDateString('pt-BR') },
    { label: 'Modelo IA', value: 'Gemini 3 Flash' },
    { label: 'Seções', value: '6 análises' },
  ];

  const badgeWidth = (CONTENT_WIDTH - 8) / 3;
  badgeData.forEach((badge, i) => {
    const bx = PAGE.marginX + i * (badgeWidth + 4);
    pdf.setFillColor(...COLORS.sectionBg);
    pdf.roundedRect(bx, ctx.y, badgeWidth, 12, 1.5, 1.5, 'F');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(badge.label, bx + badgeWidth / 2, ctx.y + 4, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.heading);
    pdf.setFont('helvetica', 'bold');
    pdf.text(badge.value, bx + badgeWidth / 2, ctx.y + 9.5, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
  });

  ctx.y += 20;

  // === Content ===
  parseMarkdownToPdf(ctx, markdown);

  // === Footers on all pages ===
  addFooters(pdf, pdf.getNumberOfPages());

  // === Headers on subsequent pages ===
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    addHeader({ pdf, y: 0, pageNum: i }, 'Análise de Anúncio — DevTrack ML');
  }

  return pdf;
}
