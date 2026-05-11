import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function BCSQCForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('bcs_qc', onSubmitSuccess);
  return <BaseForm tabKey="bcs_qc" onSubmit={submit} loading={loading} error={error} />;
}
