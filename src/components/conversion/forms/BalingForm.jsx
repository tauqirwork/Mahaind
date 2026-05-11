import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function BalingForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('baling', onSubmitSuccess);
  return <BaseForm tabKey="baling" onSubmit={submit} loading={loading} error={error} />;
}
