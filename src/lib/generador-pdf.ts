import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Cotizacion } from '@/types/cotizacion';

export const generarPDF = async (elementoHTML: HTMLElement, cotizacion: Cotizacion): Promise<Blob> => {
  try {
    // Configurar opciones para html2canvas
    const canvas = await html2canvas(elementoHTML, {
      scale: 2, // Mayor calidad
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: elementoHTML.scrollWidth,
      height: elementoHTML.scrollHeight,
    });

    // Crear el PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calcular dimensiones
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    // Agregar imagen al PDF
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    // Si el contenido es muy alto, agregar páginas adicionales
    const totalPDFPages = Math.ceil((imgHeight * ratio) / pdfHeight);
    for (let i = 1; i < totalPDFPages; i++) {
      pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        -(pdfHeight * i) + imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
    }

    // Convertir a Blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
};

export const descargarPDF = async (elementoHTML: HTMLElement, cotizacion: Cotizacion): Promise<void> => {
  try {
    const pdfBlob = await generarPDF(elementoHTML, cotizacion);
    
    // Crear enlace de descarga
    const url = URL.createObjectURL(pdfBlob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${cotizacion.numero}.pdf`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    throw error;
  }
};

// Función para imprimir
export const imprimirPDF = (): void => {
  window.print();
};