import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function BCSForm({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('bcs', onSubmitSuccess);
  return <BaseForm tabKey="bcs" onSubmit={submit} loading={loading} error={error} />;
}
