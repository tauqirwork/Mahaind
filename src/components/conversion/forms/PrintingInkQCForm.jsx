import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function PrintingInkQCForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('printing_ink_qc', onSubmitSuccess);
  return <BaseForm tabKey="printing_ink_qc" onSubmit={submit} loading={loading} error={error} />;
}
