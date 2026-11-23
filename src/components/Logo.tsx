export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 2 28 9v14l-12 7-12-7V9z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M4 13.5 16 20.5l12-7M4 18 16 25l12-7" fill="none" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <span className="logo-word">
        GIBIM<span className="logo-3d">3D</span>
      </span>
    </span>
  );
}
