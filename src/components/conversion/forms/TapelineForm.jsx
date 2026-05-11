import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function TapelineForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('tapeline', onSubmitSuccess);
  return <BaseForm tabKey="tapeline" onSubmit={submit} loading={loading} error={error} />;
}
