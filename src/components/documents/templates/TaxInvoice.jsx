import React from 'react';
import { DocumentLayout } from '../engine/DocumentLayout';
import { LineItemsTable } from '../engine/LineItemsTable';

export function TaxInvoice({ data }) {
  return (
    <DocumentLayout data={data}>
      <LineItemsTable items={data.lineItems} />
    </DocumentLayout>
  );
}
