import React, { useRef, useState } from 'react';
import { PreviewToolbar } from './PreviewToolbar';
import { getToken } from '../../../services/sheetsApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function DocumentPreview({ documentData, TemplateComponent }) {
  const containerRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    
    setIsExporting(true);
    try {
      // Get the rendered HTML
      const html = containerRef.current.innerHTML;
      const token = await getToken();

      const response = await fetch(`${API_BASE}/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ html })
      });

      if (!response.ok) throw new Error('PDF Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentData.documentNumber.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to generate PDF. Please check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <PreviewToolbar onExport={handleExportPDF} isExporting={isExporting} />
      
      {/* The preview container wraps the template. We scale it down slightly if needed, but for simplicity we render it centered. */}
      <div className="flex justify-center bg-gray-100 p-8 rounded-xl border border-gray-300 shadow-inner overflow-auto">
        <div ref={containerRef} className="origin-top transform scale-90 sm:scale-100">
          <TemplateComponent data={documentData} />
        </div>
      </div>
    </div>
  );
}
