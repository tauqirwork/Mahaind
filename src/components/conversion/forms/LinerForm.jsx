import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function LinerForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('liner', onSubmitSuccess);
  return <BaseForm tabKey="liner" onSubmit={submit} loading={loading} error={error} />;
}
