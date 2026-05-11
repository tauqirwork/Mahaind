import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function BOPPQCForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('bopp_qc', onSubmitSuccess);
  return <BaseForm tabKey="bopp_qc" onSubmit={submit} loading={loading} error={error} />;
}
