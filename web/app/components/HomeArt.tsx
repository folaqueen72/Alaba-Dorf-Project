// Flat brand illustrations for the homepage (no photos, no gradients).
export function FarmArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} role="img" aria-label="Farm illustration">
      <rect width="400" height="220" fill="#EDF4D7" />
      <circle cx="318" cy="52" r="30" fill="#6B9E0E" />
      <ellipse cx="318" cy="52" r="38" fill="none" stroke="#6B9E0E" strokeWidth="3" opacity="0.35" />
      <path d="M0 150 Q100 110 200 150 T400 150 V220 H0 Z" fill="#6B9E0E" />
      <path d="M0 175 Q100 145 200 175 T400 175 V220 H0 Z" fill="#4C7500" />
      <g stroke="#F7FAEC" strokeWidth="4" strokeLinecap="round" opacity="0.8">
        <line x1="40" y1="196" x2="90" y2="188" />
        <line x1="150" y1="192" x2="200" y2="184" />
        <line x1="260" y1="188" x2="310" y2="182" />
      </g>
      <g>
        <rect x="52" y="118" width="86" height="52" rx="8" fill="#8B5E2E" />
        <rect x="52" y="118" width="86" height="14" rx="7" fill="#A06B35" />
        <line x1="95" y1="118" x2="95" y2="170" stroke="#6E451F" strokeWidth="4" />
        <ellipse cx="74" cy="112" rx="13" ry="16" fill="#FFFFFF" stroke="#E4E6DD" strokeWidth="2" />
        <ellipse cx="116" cy="112" rx="13" ry="16" fill="#FFFFFF" stroke="#E4E6DD" strokeWidth="2" />
      </g>
      <g>
        <ellipse cx="290" cy="188" rx="26" ry="10" fill="#141610" opacity="0.15" />
        <ellipse cx="290" cy="176" rx="22" ry="26" fill="#FFFFFF" stroke="#141610" strokeWidth="4" />
        <circle cx="282" cy="168" r="3" fill="#141610" />
      </g>
    </svg>
  );
}

export function EateryArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} role="img" aria-label="Eatery illustration">
      <rect width="400" height="220" fill="#F7FAEC" />
      <circle cx="60" cy="46" r="26" fill="#EDF4D7" />
      <circle cx="344" cy="170" r="34" fill="#EDF4D7" />
      <g stroke="#B4B8A6" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M172 78 q10 -12 0 -26 q-10 -12 0 -26" />
        <path d="M200 78 q10 -12 0 -26 q-10 -12 0 -26" />
        <path d="M228 78 q10 -12 0 -26 q-10 -12 0 -26" />
      </g>
      <path d="M110 150 a90 90 0 0 1 180 0 Z" fill="#33362B" />
      <rect x="104" y="146" width="192" height="10" rx="5" fill="#141610" />
      <circle cx="200" cy="52" r="9" fill="#6B9E0E" />
      <rect x="196" y="58" width="8" height="14" fill="#6B9E0E" />
      <ellipse cx="200" cy="186" rx="120" ry="12" fill="#141610" opacity="0.12" />
      <rect x="96" y="192" width="208" height="10" rx="5" fill="#E4E6DD" />
      <g>
        <circle cx="160" cy="132" r="12" fill="#6B9E0E" />
        <circle cx="200" cy="126" r="12" fill="#FFFFFF" stroke="#6B9E0E" strokeWidth="4" />
        <circle cx="240" cy="132" r="12" fill="#6B9E0E" />
      </g>
    </svg>
  );
}

export function StudioArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} role="img" aria-label="Photo studio illustration">
      <rect width="400" height="220" fill="#141610" />
      <circle cx="52" cy="40" r="3" fill="#F7FAEC" opacity="0.8" />
      <circle cx="352" cy="52" r="3" fill="#F7FAEC" opacity="0.8" />
      <circle cx="320" cy="170" r="3" fill="#F7FAEC" opacity="0.6" />
      <circle cx="90" cy="180" r="3" fill="#F7FAEC" opacity="0.6" />
      <path d="M330 34 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 Z" fill="#6B9E0E" />
      <g>
        <rect x="110" y="70" width="180" height="110" rx="18" fill="#F7FAEC" />
        <rect x="110" y="70" width="180" height="110" rx="18" fill="none" stroke="#B4B8A6" strokeWidth="3" />
        <rect x="168" y="52" width="64" height="26" rx="8" fill="#F7FAEC" stroke="#B4B8A6" strokeWidth="3" />
        <circle cx="200" cy="125" r="38" fill="#141610" />
        <circle cx="200" cy="125" r="38" fill="none" stroke="#6B9E0E" strokeWidth="6" />
        <circle cx="200" cy="125" r="16" fill="#6B9E0E" />
        <circle cx="194" cy="119" r="5" fill="#FFFFFF" />
        <circle cx="136" cy="98" r="6" fill="#6B9E0E" />
        <rect x="262" y="92" width="12" height="20" rx="4" fill="#B4B8A6" />
      </g>
      <ellipse cx="200" cy="196" rx="120" ry="8" fill="#000000" opacity="0.5" />
    </svg>
  );
}

export function HeroCollage({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 320" className={className} role="img" aria-label="Orders, food and bookings at a glance">
      <circle cx="180" cy="150" r="128" fill="#EDF4D7" />
      <circle cx="180" cy="150" r="128" fill="none" stroke="#FFFFFF" strokeWidth="10" opacity="0.6" />
      <g>
        <rect x="70" y="60" width="220" height="86" rx="14" fill="#FFFFFF" />
        <rect x="86" y="78" width="52" height="52" rx="10" fill="#6B9E0E" />
        <path d="M99 117 l9 -18 9 18 M99 117 h18" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="150" y="80" width="120" height="14" rx="7" fill="#141610" />
        <rect x="150" y="100" width="88" height="10" rx="5" fill="#B4B8A6" />
        <rect x="150" y="116" width="64" height="18" rx="9" fill="#6B9E0E" />
      </g>
      <g>
        <rect x="96" y="160" width="200" height="80" rx="14" fill="#141610" />
        <circle cx="126" cy="200" r="18" fill="none" stroke="#6B9E0E" strokeWidth="6" />
        <circle cx="126" cy="200" r="7" fill="#6B9E0E" />
        <rect x="156" y="182" width="110" height="14" rx="7" fill="#FFFFFF" />
        <rect x="156" y="202" width="76" height="10" rx="5" fill="#B4B8A6" />
      </g>
      <g>
        <rect x="56" y="248" width="248" height="56" rx="14" fill="#FFFFFF" stroke="#E4E6DD" strokeWidth="2" />
        <circle cx="86" cy="276" r="14" fill="#6B9E0E" />
        <path d="M80 276 l5 5 9 -10" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="112" y="264" width="130" height="14" rx="7" fill="#141610" />
        <rect x="112" y="282" width="90" height="10" rx="5" fill="#B4B8A6" />
      </g>
    </svg>
  );
}
