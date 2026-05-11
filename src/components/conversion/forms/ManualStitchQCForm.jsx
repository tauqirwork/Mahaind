import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function ManualStitchQCForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('manual_stitch_qc', onSubmitSuccess);
  return <BaseForm tabKey="manual_stitch_qc" onSubmit={submit} loading={loading} error={error} />;
}
