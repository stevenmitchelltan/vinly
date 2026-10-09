import { useState } from 'react';
import { getImageUrl } from '../../utils/image';

// Official website favicons, stored locally so supplier sites are never needed at runtime.
const supplierFavicons = {
  'Albert Heijn': 'albert-heijn.png',
  'Dirk': 'dirk.ico',
  'HEMA': 'hema.svg',
  'LIDL': 'lidl.svg',
  'Jumbo': 'jumbo.png',
  'ALDI': 'aldi.ico',
  'Plus': 'plus.ico',
  'Sligro': 'sligro.png',
  'Gall & Gall': 'gall-en-gall.svg',
};

function SupplierFavicon({ name }) {
  const [failed, setFailed] = useState(false);
  const filename = supplierFavicons[name];

  if (!filename || failed) return (name || '?').charAt(0).toUpperCase();

  return (
    <img
      src={getImageUrl(`images/suppliers/${filename}`)}
      alt=""
      width="20"
      height="20"
      className="w-full h-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export function SupermarketIcon({ name, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-sm overflow-hidden bg-th-elevated text-th-text-sub text-[10px] font-bold leading-none flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <SupplierFavicon key={name} name={name} />
    </span>
  );
}
