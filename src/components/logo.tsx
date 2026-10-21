// The "10" mark, same drawing as src/app/icon.svg. Fixed brand colours, so it reads the same in both themes.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#0b3d91" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="#ffd200" strokeWidth="12">
          <path d="M14 21l7-5v32" />
          <ellipse cx="42" cy="32" rx="9" ry="16" />
        </g>
        <g stroke="#d6261c" strokeWidth="7">
          <path d="M14 21l7-5v32" />
          <ellipse cx="42" cy="32" rx="9" ry="16" />
        </g>
      </g>
    </svg>
  );
}
