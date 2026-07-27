// Hand-authored line icons (Feather/Lucide-style visual idiom, original
// geometry) — this codebase has no icon library dependency, so every icon
// used across the redesign is a small inline SVG component here. Each takes
// `size` and `color`; stroke-based icons default to a 1.8 stroke width.

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const STROKE = 1.8;

function Svg({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={rest.className}
    >
      {children}
    </svg>
  );
}

export function ShieldCheckIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 3.5 5 6v5.2c0 4.4 2.9 7.6 7 8.8 4.1-1.2 7-4.4 7-8.8V6l-7-2.5Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path d="M9 12.2 11.2 14.4 15.4 10" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PoundCoinIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={STROKE} />
      <path
        d="M10.3 15.5h4.1M9.6 15.5c1.4 0 1.9-.7 1.9-1.7v-2M9.6 12.3h2.7M11.5 11.8v-1.4c0-1.2.9-2 2-2 .8 0 1.4.3 1.8.9"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ReceiptIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3.5Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function ClockIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={STROKE} />
      <path d="M12 7.5V12l3 2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckCircleIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={STROKE} />
      <path d="M8.2 12.3 10.7 14.8 15.8 9.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function StarIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 3.8 14.3 9 20 9.7 15.8 13.5 17 19.2 12 16.3 7 19.2 8.2 13.5 4 9.7 9.7 9 12 3.8Z"
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SearchPostcodeIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 3.5c-3 0-5.5 2.4-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5c0-3.1-2.5-5.5-5.5-5.5Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <circle cx={12} cy={9} r={1.8} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function HomeIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M4.5 11.5 12 4.5l7.5 7"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.3 10.2V19h11.4v-8.8" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19v-4.5h4V19" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SwapIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M5 8.5h13M15 5l3.2 3.5L15 12" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 15.5H6M9 12l-3.2 3.5L9 19" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function RefreshIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M5.5 12a6.5 6.5 0 0 1 11-4.6l1.5 1.4"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 5.5v3.5h-3.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M18.5 12a6.5 6.5 0 0 1-11 4.6l-1.5-1.4"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 18.5V15h3.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function UsersIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx={9} cy={8.5} r={2.6} stroke={color} strokeWidth={STROKE} />
      <path d="M4.3 18.5c.6-2.8 2.4-4.3 4.7-4.3s4.1 1.5 4.7 4.3" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <circle cx={16} cy={9.3} r={2.1} stroke={color} strokeWidth={STROKE} />
      <path d="M14.8 14.5c1.7.3 3 1.6 3.5 4" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function DocumentExtendIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M7 3.5h7l3 3v14H7Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path d="M14 3.5v3h3" stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M9.5 14h6M9.5 17h4" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M16.5 14.5 19.5 12M19.5 12h-2.4M19.5 12v2.4" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronDownIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M6 9.5 12 15.5 18 9.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MailIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <rect x={4} y={5.5} width={16} height={13} rx={2} stroke={color} strokeWidth={STROKE} />
      <path d="M4.5 6.5 12 12.5l7.5-6" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MapPinIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 21s7-7.1 7-12a7 7 0 1 0-14 0c0 4.9 7 12 7 12Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <circle cx={12} cy={9} r={2.4} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function BookmarkIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M6.5 4h11v16l-5.5-3.6L6.5 20V4Z" stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
    </Svg>
  );
}

export function PhoneIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M7 3.8 4.6 6.2c-.6 3.6 4.6 8.8 8.2 9.2 0 0 3.6-2.4 3.6-2.4l3.6 2.4c0 3-1.5 4.4-3.6 4.4C10.6 19.8 4.2 13.4 4.2 7.6c0-2.1 1.4-3.6 4.4-3.6l2.4 3.6-3.4 3.4"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RibbonBadgeIcon({ size, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx={12} cy={9} r={5.5} stroke={color} strokeWidth={STROKE} />
      <path d="M9 13.5 7.5 20l4.5-2.5 4.5 2.5-1.5-6.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.7 9 11.2 10.5 14.5 7.2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
