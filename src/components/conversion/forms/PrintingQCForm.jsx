import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function PrintingQCForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('printing_qc', onSubmitSuccess);
  return <BaseForm tabKey="printing_qc" onSubmit={submit} loading={loading} error={error} />;
}
