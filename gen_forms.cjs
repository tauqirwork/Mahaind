const fs = require('fs');
const path = require('path');
const forms = [
  { name: 'LoomQCForm', key: 'loom_qc' },
  { name: 'LinerQCForm', key: 'liner_qc' },
  { name: 'PrintingQCForm', key: 'printing_qc' },
  { name: 'PrintingInkQCForm', key: 'printing_ink_qc' },
  { name: 'BOPPQCForm', key: 'bopp_qc' },
  { name: 'BCSQCForm', key: 'bcs_qc' },
  { name: 'ManualStitchQCForm', key: 'manual_stitch_qc' },
  { name: 'TapelineForm', key: 'tapeline' },
  { name: 'RolldownForm', key: 'rolldown' },
  { name: 'LinerForm', key: 'liner' },
  { name: 'PrintingForm', key: 'printing' },
  { name: 'BOPPForm', key: 'bopp' },
  { name: 'BCSForm', key: 'bcs' },
  { name: 'BalingForm', key: 'baling' },
];

const template = (name, key) => `import React from 'react';
import BaseForm from './BaseForm';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function ${name}({ onSubmitSuccess }) {
  const { submit, loading, error } = useAppendEntry('${key}', onSubmitSuccess);
  return <BaseForm tabKey="${key}" onSubmit={submit} loading={loading} error={error} />;
}
`;

forms.forEach(f => {
  fs.writeFileSync(path.join('src/components/conversion/forms', f.name + '.jsx'), template(f.name, f.key));
});
console.log('Done');
