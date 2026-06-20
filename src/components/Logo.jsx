// PropTrack logo — renders the official lockup mark + wordmark as inline SVG
// so it inherits theme colors correctly in both dark and light mode.

export function LogoMark({ size = 40 }) {
  // Just the icon mark (rounded square + checkmark path + accent dot) — no wordmark.
  // Used in the sidebar and compact spaces.
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="120" height="120" rx="28" fill="var(--logo-mark-bg, #080C14)" />
      <path d="M32,84 L58,40 L72,58 L94,26" fill="none" stroke="var(--logo-mark-stroke, #F7F4EF)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="94" cy="26" r="5" fill="#D97D44" />
    </svg>
  );
}

export function LogoFull({ height = 36 }) {
  // Full lockup — mark + "proptrack." wordmark. Used on Landing page and Auth page.
  const width = (430 / 140) * height;
  return (
    <svg width={width} height={height} viewBox="0 0 430 140" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(10,10)">
        <rect x="0" y="0" width="120" height="120" rx="28" fill="var(--logo-mark-bg, #080C14)" />
        <path d="M32,84 L58,40 L72,58 L94,26" fill="none" stroke="var(--logo-mark-stroke, #F7F4EF)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="94" cy="26" r="5" fill="#D97D44" />
      </g>
      <text x="152" y="82" fontFamily="'Poppins', 'Segoe UI', Arial, sans-serif" fontSize="40" fontWeight="600" fill="var(--logo-text, #080C14)" letterSpacing="0.5px">
        proptrack<tspan fill="#D97D44">.</tspan>
      </text>
    </svg>
  );
}
