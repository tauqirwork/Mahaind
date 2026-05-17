import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportPDF = async (elementId, data) => {
    setIsExporting(true);
    setError(null);
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error(`Element with id ${elementId} not found`);
      
      const rawHtml = element.outerHTML;
      
      // Inject Tailwind and force background/border printing
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .document-root table { width: 100%; border-collapse: collapse; }
            .document-root th, .document-root td { border: 1px solid #d0d7de; padding: 4px 8px; text-align: left; }
            .document-root th { background-color: #f0f4f8; font-weight: bold; }
            .document-root { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; min-height: 0 !important; }
          </style>
        </head>
        <body>
          ${rawHtml}
        </body>
        </html>
      `;
      
      const res = await fetch(`${API_BASE}/pdf/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, data })
      });
      
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.error || 'Failed to generate PDF');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${data?.documentNumber || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPDF, isExporting, error };
}

export function useBuyersProducts() {
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [buyRes, prodRes] = await Promise.all([
        fetch(`${API_BASE}/pdf/buyers`),
        fetch(`${API_BASE}/pdf/products`)
      ]);
      
      if (!buyRes.ok) throw new Error('Failed to fetch buyers');
      if (!prodRes.ok) throw new Error('Failed to fetch products');
      
      const buyData = await buyRes.json();
      const prodData = await prodRes.json();
      
      setBuyers(buyData);
      setProducts(prodData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { buyers, products, loading, error, refetch: fetchAll };
}
