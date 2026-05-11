import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function BOPPForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('bopp', onSubmitSuccess);
  return <BaseForm tabKey="bopp" onSubmit={submit} loading={loading} error={error} />;
}
