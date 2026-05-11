import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function PrintingForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('printing', onSubmitSuccess);
  return <BaseForm tabKey="printing" onSubmit={submit} loading={loading} error={error} />;
}
