import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportCanvasToPDF = async (elementId: string, filename = 'automata-report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const imgData = await toPng(element, {
      backgroundColor: '#020617', // slate-950
      pixelRatio: 2,
    });
    
    // Default A4 paper
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;
    
    const marginX = (pdfWidth - imgWidth) / 2;
    const marginY = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', marginX, marginY, imgWidth, imgHeight);
    
    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(200, 200, 200);
    pdf.text("Automata Simulation Report", 10, 10);
    
    pdf.save(filename);
  } catch (err) {
    console.error('Export failed:', err);
  }
};
