// Simplified brand-colored icons for Dutch supermarkets
// Each renders as a colored letter/badge at w-5 h-5 by default

function IconBase({ children, bg, text, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold leading-none flex-shrink-0 ${className}`}
      style={{ backgroundColor: bg, color: text }}
      aria-hidden
    >
      {children}
    </span>
  );
}

function AHIcon({ className }) {
  return <IconBase bg="#00a0e2" text="#fff" className={className}>AH</IconBase>;
}

function DirkIcon({ className }) {
  return <IconBase bg="#e30613" text="#fff" className={className}>D</IconBase>;
}

function HemaIcon({ className }) {
  return <IconBase bg="#e30613" text="#fff" className={className}>H</IconBase>;
}

function LidlIcon({ className }) {
  return <IconBase bg="#0050aa" text="#ffe500" className={className}>L</IconBase>;
}

function JumboIcon({ className }) {
  return <IconBase bg="#ffc600" text="#000" className={className}>J</IconBase>;
}

function AldiIcon({ className }) {
  return <IconBase bg="#00529b" text="#fff" className={className}>A</IconBase>;
}

function PlusIcon({ className }) {
  return <IconBase bg="#009a3b" text="#fff" className={className}>+</IconBase>;
}

function SligroIcon({ className }) {
  return <IconBase bg="#003366" text="#fff" className={className}>S</IconBase>;
}

export const supermarketIcons = {
  'Albert Heijn': AHIcon,
  'Dirk': DirkIcon,
  'HEMA': HemaIcon,
  'LIDL': LidlIcon,
  'Jumbo': JumboIcon,
  'ALDI': AldiIcon,
  'Plus': PlusIcon,
  'Sligro': SligroIcon,
};

export function SupermarketIcon({ name, className }) {
  const Icon = supermarketIcons[name];
  if (Icon) return <Icon className={className} />;
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-sm bg-th-elevated text-th-text-sub text-[10px] font-bold flex-shrink-0 ${className || ''}`} aria-hidden>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}
