import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAutomataStore } from '@/store/automataStore';

export const exportCanvasToPDF = async (elementId: string, filename = 'Laporan_Automata.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const { automaton, testString, simulationTrace } = useAutomataStore.getState();

  try {
    // Gunakan orientasi portrait ukuran A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set Document Properties
    pdf.setProperties({
      title: 'Laporan Analisis Automata',
      subject: 'DFA/NFA Simulation Report',
      creator: 'Automata Simulator AI'
    });

    // 1. Header
    pdf.setFontSize(20);
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFont('helvetica', 'bold');
    pdf.text("Laporan Analisis Automata", pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, 26, { align: 'center' });

    // 2. 5-Tuple Definition
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text("1. Definisi 5-Tuple", 14, 40);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85); // slate-700
    
    let currentY = 48;
    const lineHeight = 6;
    
    const typeText = automaton.isNFA ? "Non-Deterministic Finite Automaton (NFA)" : "Deterministic Finite Automaton (DFA)";
    pdf.text(`Tipe Automata : ${typeText}`, 14, currentY); currentY += lineHeight;
    pdf.text(`States (Q)     : { ${automaton.states.join(', ')} }`, 14, currentY); currentY += lineHeight;
    pdf.text(`Alphabet (Sigma) : { ${automaton.alphabet.join(', ')} }`, 14, currentY); currentY += lineHeight;
    pdf.text(`Initial (q0)    : ${automaton.initialState}`, 14, currentY); currentY += lineHeight;
    pdf.text(`Final (F)      : { ${automaton.acceptStates.join(', ')} }`, 14, currentY); currentY += lineHeight;

    // 3. Transition Table (Hybrid Matrix)
    currentY += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text("2. Tabel Transisi (Delta)", 14, currentY);

    const head = [['State', ...automaton.alphabet]];
    const body = automaton.states.map(state => {
      let prefix = '';
      if (state === automaton.initialState && automaton.acceptStates.includes(state)) prefix = '-> * ';
      else if (state === automaton.initialState) prefix = '-> ';
      else if (automaton.acceptStates.includes(state)) prefix = '* ';

      const row = [prefix + state];
      
      automaton.alphabet.forEach(symbol => {
        const dests = automaton.transitions
          .filter(t => t.from === state && t.input === symbol)
          .flatMap(t => t.to);
        
        row.push(dests.length > 0 ? `{${dests.join(', ')}}` : '∅');
      });
      return row;
    });

    autoTable(pdf, {
      startY: currentY + 5,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] }, // cyan-500
      styles: { fontSize: 10, halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
    });

    // @ts-expect-error jspdf-autotable injects lastAutoTable
    currentY = pdf.lastAutoTable.finalY + 15;

    // 4. Diagram Visual
    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text("3. Visualisasi Diagram", 14, currentY);

    // Tangkap kanvas saja, ubah background jadi slate-900 biar keren
    const imgData = await toPng(element, {
      backgroundColor: '#0f172a',
      pixelRatio: 2,
    });

    const imgProps = pdf.getImageProperties(imgData);
    
    // Fit to width or height
    const maxWidth = pageWidth - 28;
    const maxHeight = 100;
    
    const ratio = Math.min(maxWidth / imgProps.width, maxHeight / imgProps.height);
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;
    
    const marginX = (pageWidth - imgWidth) / 2;

    pdf.addImage(imgData, 'PNG', marginX, currentY + 5, imgWidth, imgHeight);
    
    currentY += imgHeight + 20;

    // 5. Simulation Log
    if (testString && simulationTrace.length > 0) {
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text("4. Riwayat Simulasi Terakhir", 14, currentY);
      
      const lastTrace = simulationTrace[simulationTrace.length - 1];
      const statusText = lastTrace.isAccepted ? "DITERIMA (Accepted)" : "DITOLAK (Rejected)";
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      currentY += 8;
      pdf.text(`String Input : "${testString}"`, 14, currentY); currentY += 6;
      
      pdf.setFont('helvetica', 'bold');
      if (lastTrace.isAccepted) {
        pdf.setTextColor(22, 163, 74); // green-600
      } else {
        pdf.setTextColor(220, 38, 38); // red-600
      }
      pdf.text(`Status Akhir : ${statusText}`, 14, currentY); 
      
      pdf.setTextColor(15, 23, 42);
      
      const traceHead = [['Langkah', 'Current States', 'Input Symbol']];
      const traceBody = simulationTrace.map((trace) => [
        `Step ${trace.stepIndex}`,
        `{${trace.currentStates.join(', ')}}`,
        trace.inputSymbol || '(end)'
      ]);

      autoTable(pdf, {
        startY: currentY + 10,
        head: traceHead,
        body: traceBody,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85] },
        styles: { fontSize: 10, halign: 'center' }
      });
    }

    pdf.save(filename);
  } catch (err) {
    console.error('Export failed:', err);
  }
};
