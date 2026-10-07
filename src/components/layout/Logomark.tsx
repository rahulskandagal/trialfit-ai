export function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="6" fill="var(--color-navy-800)" />
      <path d="M16 7v18M7 16h18" stroke="var(--color-teal-500)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3.2" fill="var(--color-teal-500)" />
      <circle cx="16" cy="16" r="3.2" stroke="#ffffff" strokeWidth="1" />
      <path
        d="M11.5 20.5l2 2 3.5-5"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}
