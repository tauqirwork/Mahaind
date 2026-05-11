import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function LoomQCForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('loom_qc', onSubmitSuccess);
  return <BaseForm tabKey="loom_qc" onSubmit={submit} loading={loading} error={error} />;
}
