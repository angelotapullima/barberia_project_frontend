import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera la boleta de pago en PDF con diseño optimizado y compacto.
 */
export function generateBarberPaymentSlip(data) {
  const {
    nombre,
    puesto,
    periodo,
    sueldoBase,
    totalServicios,
    totalAdelantos,
    servicios = [],
    adelantos = [],
    logoDataUrl,
  } = data;

  // --- helpers ---
  const currency = (n) =>
    `S/ ${Number(n || 0).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const sum = (arr, key) =>
    arr.reduce((acc, it) => acc + Number(it[key] || 0), 0);

  // Cálculos
  const totalServiciosFinal = servicios.length
    ? sum(servicios, 'monto')
    : Number(totalServicios || 0);
  const totalAdelantosFinal = adelantos.length
    ? sum(adelantos, 'monto')
    : Number(totalAdelantos || 0);

  const calculoBaseFinal =
    totalServiciosFinal >= 2 * Number(sueldoBase)
      ? totalServiciosFinal / 2
      : Number(sueldoBase);

  const netoPagar = Math.max(0, calculoBaseFinal - totalAdelantosFinal);

  // --- PDF con diseño compacto ---
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // Reducido de 20 a 15
  let currentY = margin;

  // Colores profesionales
  const colors = {
    primary: [41, 69, 99], // Azul corporativo
    secondary: [240, 244, 248], // Gris muy claro
    accent: [34, 139, 34], // Verde para totales
    danger: [220, 53, 69], // Rojo para descuentos
    text: [51, 65, 85], // Gris oscuro para texto
    textLight: [100, 116, 139], // Gris medio
  };

  // Propiedades del documento
  doc.setProperties({
    title: `Boleta de Pago - ${nombre} - ${periodo}`,
    subject: 'Boleta de Pago',
    creator: 'Sistema de Barbería',
  });

  // ===== ENCABEZADO SIN FONDO AZUL =====
  // Logo en la esquina superior derecha
  const logoX = pageWidth - margin - 25;
  const logoY = margin;
  const logoW = 20;
  const logoH = 8;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH);
    } catch {
      drawLogoPlaceholder();
    }
  } else {
    drawLogoPlaceholder();
  }

  function drawLogoPlaceholder() {
    doc.setFillColor(...colors.secondary);
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(logoX, logoY, logoW, logoH, 1, 1, 'FD');
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('LOGO', logoX + logoW / 2, logoY + logoH / 2 + 1, {
      align: 'center',
    });
  }

  // Título sin fondo
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BOLETA DE PAGO', margin, margin + 6);

  // Fecha debajo del título
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textLight);
  const fechaEmision = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Emitida el ${fechaEmision}`, margin, margin + 12);

  // Resetear color para el resto del documento
  doc.setTextColor(...colors.text);
  currentY = margin + 20;

  // ===== INFORMACIÓN COMPACTA =====
  const panelHeight = 28; // Reducido de 35 a 28
  doc.setFillColor(...colors.secondary);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(
    margin,
    currentY,
    pageWidth - 2 * margin,
    panelHeight,
    2,
    2,
    'FD',
  );

  // División visual
  const midX = pageWidth / 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(midX, currentY + 3, midX, currentY + panelHeight - 3);

  // Lado izquierdo - Datos del empleado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9); // Reducido de 12 a 9
  doc.setTextColor(...colors.primary);
  doc.text('COLABORADOR', margin + 3, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8); // Reducido de 10 a 8
  doc.setTextColor(...colors.text);
  doc.text(`${nombre}`, margin + 3, currentY + 12);
  doc.text(`${puesto} | ${periodo}`, margin + 3, currentY + 18);

  // Lado derecho - Resumen financiero compacto
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.primary);
  doc.text('RESUMEN', midX + 3, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.text);

  const rightColX = midX + 3;
  const valueX = pageWidth - margin - 3;

  doc.text('Base:', rightColX, currentY + 12);
  doc.text(currency(sueldoBase), valueX, currentY + 12, { align: 'right' });

  doc.text('Servicios:', rightColX, currentY + 18);
  doc.text(currency(totalServiciosFinal), valueX, currentY + 18, {
    align: 'right',
  });

  doc.text('Adelantos:', rightColX, currentY + 24);
  doc.setTextColor(...colors.danger);
  doc.text(`-${currency(totalAdelantosFinal)}`, valueX, currentY + 24, {
    align: 'right',
  });

  currentY += panelHeight + 8; // Reducido espaciado

  // ===== MONTO NETO EN LA DERECHA CON FONDO VERDE SUTIL =====
  const netoBoxWidth = 80; // Solo parte derecha
  const netoBoxHeight = 14;
  const netoBoxX = pageWidth - margin - netoBoxWidth;

  // Fondo verde muy sutil
  doc.setFillColor(240, 253, 244); // Verde muy claro
  doc.setDrawColor(34, 139, 34); // Borde verde
  doc.setLineWidth(0.8);
  doc.roundedRect(netoBoxX, currentY, netoBoxWidth, netoBoxHeight, 3, 3, 'FD');

  // Texto del monto neto
  doc.setTextColor(22, 101, 52); // Verde oscuro
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NETO A PAGAR:', netoBoxX + 4, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(currency(netoPagar), netoBoxX + netoBoxWidth - 4, currentY + 9, {
    align: 'right',
  });

  currentY += netoBoxHeight + 10;

  // ===== TABLA DE SERVICIOS OPTIMIZADA =====
  if (servicios.length > 0) {
    // Título de sección más compacto
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10); // Reducido de 14 a 10
    doc.text('SERVICIOS REALIZADOS', margin, currentY);
    currentY += 6; // Reducido espaciado

    autoTable(doc, {
      startY: currentY,
      head: [['Fecha', 'Servicio', 'Monto']],
      body: servicios.map((s, index) => [
        s.fecha || '',
        s.nombreServicio || '',
        currency(s.monto || 0),
      ]),
      theme: 'striped',
      styles: {
        fontSize: 7, // Reducido de 9 a 7
        cellPadding: { top: 2, right: 3, bottom: 2, left: 3 }, // Reducido padding
        textColor: colors.text,
        lineColor: [220, 220, 220],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: colors.primary,
        textColor: 255,
        fontSize: 8, // Reducido
        fontStyle: 'bold',
        halign: 'center',
        minCellHeight: 6, // Altura mínima reducida
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' }, // Reducido de 25 a 20
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }, // Reducido de 30 a 25
      },
      showFoot: 'lastPage',
      foot: [['', 'TOTAL', currency(totalServiciosFinal)]],
      footStyles: {
        fillColor: colors.secondary,
        textColor: colors.primary,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'right',
        minCellHeight: 6,
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        drawPageNumber(doc, pageWidth, pageHeight, margin);
      },
    });

    currentY = doc.lastAutoTable.finalY + 8; // Reducido espaciado
  }

  // ===== TABLA DE ADELANTOS OPTIMIZADA =====
  if (adelantos.length > 0) {
    // Verificar si necesitamos nueva página
    if (currentY + 40 > pageHeight - 25) {
      // Reducido de 60 a 40
      doc.addPage();
      currentY = 25; // Reducido de 30 a 25
    }

    // Título de sección compacto
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ADELANTOS OTORGADOS', margin, currentY);
    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      head: [['Fecha', 'Concepto', 'Monto']],
      body: adelantos.map((a) => [
        a.fecha || '',
        a.concepto || 'Adelanto',
        currency(a.monto || 0),
      ]),
      theme: 'striped',
      styles: {
        fontSize: 7,
        cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
        textColor: colors.text,
        lineColor: [220, 220, 220],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: colors.danger,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        minCellHeight: 6,
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242],
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: {
          cellWidth: 25,
          halign: 'right',
          fontStyle: 'bold',
          textColor: colors.danger,
        },
      },
      showFoot: 'lastPage',
      foot: [['', 'TOTAL', currency(totalAdelantosFinal)]],
      footStyles: {
        fillColor: [254, 226, 226],
        textColor: colors.danger,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'right',
        minCellHeight: 6,
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        drawPageNumber(doc, pageWidth, pageHeight, margin);
      },
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // ===== SECCIÓN DE FIRMAS COMPACTA =====
  // Verificar espacio para firmas
  if (currentY + 35 > pageHeight - 20) {
    // Reducido espacio necesario
    doc.addPage();
    currentY = 20;
  } else {
    currentY = Math.max(currentY, pageHeight - 60); // Posicionar cerca del final
  }

  // Línea decorativa
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8; // Reducido espaciado

  // Firmas compactas
  const signatureWidth = 60; // Reducido de 70 a 60
  const signatureY = currentY + 12; // Reducido espaciado

  // Firma del empleado
  doc.setDrawColor(...colors.textLight);
  doc.setLineWidth(0.3);
  doc.line(margin, signatureY, margin + signatureWidth, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7); // Reducido de 9 a 7
  doc.setTextColor(...colors.textLight);
  doc.text('Firma del Colaborador', margin, signatureY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8); // Reducido de 10 a 8
  doc.setTextColor(...colors.text);
  doc.text(nombre, margin + signatureWidth / 2, signatureY + 8, {
    align: 'center',
  });

  // Firma autorizada
  const rightSignX = pageWidth - margin - signatureWidth;
  doc.setDrawColor(...colors.textLight);
  doc.line(rightSignX, signatureY, rightSignX + signatureWidth, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colors.textLight);
  doc.text('Administración', rightSignX, signatureY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colors.text);
  doc.text('Autorizado', rightSignX + signatureWidth / 2, signatureY + 8, {
    align: 'center',
  });

  // ===== PIE DE PÁGINA COMPACTO =====
  drawFooter(doc, pageWidth, pageHeight, margin, colors);

  // ===== ABRIR PARA IMPRIMIR =====
  openPdfForPrint(doc, nombre, periodo);
}

// Función para dibujar numeración de página
function drawPageNumber(doc, pageWidth, pageHeight, margin) {
  const currentPage = doc.getCurrentPageInfo().pageNumber;
  const totalPages = doc.getNumberOfPages();

  doc.setFontSize(7); // Reducido de 8 a 7
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Página ${currentPage} de ${totalPages}`,
    pageWidth - margin,
    pageHeight - 8, // Ajustado posición
    { align: 'right' },
  );
}

// Función para dibujar pie de página compacto
function drawFooter(doc, pageWidth, pageHeight, margin, colors) {
  const footerY = pageHeight - 15; // Reducido de 20 a 15

  // Línea superior
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Texto del pie más compacto
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6); // Reducido de 8 a 6
  doc.setTextColor(...colors.textLight);
  doc.text(
    'Documento generado automáticamente',
    pageWidth / 2,
    footerY + 4, // Reducido espaciado
    { align: 'center' },
  );

  // Timestamp más pequeño
  const now = new Date();
  const timestamp = now.toLocaleString('es-PE');
  doc.text(`${timestamp}`, pageWidth / 2, footerY + 8, {
    align: 'center',
  });
}

// Función para abrir PDF para impresión
function openPdfForPrint(doc, nombre, periodo) {
  try {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600');

    if (printWindow) {
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
        }, 800);
      };

      // Limpiar URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60000);
    } else {
      console.warn('Ventana bloqueada. Descargando PDF...');
      doc.save(
        `boleta_pago_${nombre.replace(/\s+/g, '_')}_${periodo.replace(/\s+/g, '_')}.pdf`,
      );
    }
  } catch (error) {
    console.error('Error al abrir PDF:', error);
    doc.save(
      `boleta_pago_${nombre.replace(/\s+/g, '_')}_${periodo.replace(/\s+/g, '_')}.pdf`,
    );
  }
}
