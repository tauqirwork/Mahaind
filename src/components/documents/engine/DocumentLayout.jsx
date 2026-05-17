import React from 'react';
import { DocumentHeader } from './DocumentHeader';
import { PartyDetails } from './PartyDetails';
import { DocumentFooter } from './DocumentFooter';
import { TaxSummary } from './TaxSummary';
import { AmountWords } from './AmountWords';
import '../../../styles/document-base.css';

export function DocumentLayout({ data, children }) {
  if (!data || !data.company) return <div>Loading document...</div>;

  let watermarkContent = null;
  if (data.company?.logoBase64) {
    watermarkContent = <img src={data.company.logoBase64} alt="watermark" className="w-[500px] h-auto transform -rotate-12 grayscale opacity-50" />;
  } else if (data.company?.name) {
    watermarkContent = <span className="text-[80px] font-black transform -rotate-45 text-gray-500 uppercase tracking-widest whitespace-nowrap">{data.company.name}</span>;
  }

  return (
    <div className="document-root relative bg-white" id="pdf-document-root">
      {watermarkContent && (
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none overflow-hidden z-0">
          {watermarkContent}
        </div>
      )}

      <div className="relative z-10">
        <DocumentHeader
          company={data.company}
          documentMeta={{
            type: data.documentType,
            documentNumber: data.documentNumber,
            documentDate: data.documentDate
          }}
        />

        <PartyDetails buyer={data.buyer} dispatch={data.dispatch} />

        <div className="document-body pb-4">
          {children}
        </div>

        <TaxSummary totals={data.totals} />

        <AmountWords amount={data.totals?.grandTotal} />

        <DocumentFooter
          bankDetails={data.company.bankDetails}
          terms={data.config?.termsAndConditions}
          companyName={data.company.name}
        />
      </div>
    </div>
  );
}
