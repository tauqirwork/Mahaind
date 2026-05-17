import React from 'react';
import { ToWords } from 'to-words';

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  }
});

export function AmountWords({ amount }) {
  if (!amount) return null;
  
  let words = '';
  try {
    words = toWords.convert(amount);
  } catch (e) {
    words = 'Amount in words error';
  }

  return (
    <div className="border border-gray-300 p-2 mb-4 bg-gray-50">
      <span className="font-bold text-xs uppercase text-gray-700 block mb-1">Amount in Words:</span>
      <span className="text-sm font-medium text-gray-900">{words}</span>
    </div>
  );
}
