import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function LinerQCForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('liner_qc', onSubmitSuccess);
  return <BaseForm tabKey="liner_qc" onSubmit={submit} loading={loading} error={error} />;
}
