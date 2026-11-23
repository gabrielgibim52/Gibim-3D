/* eslint-disable @next/next/no-img-element */
export function Logo({ height = 40 }: { height?: number }) {
  return (
    <span className="logo">
      <img src="/brand/logo-gibim3d.png" alt="Gibim 3D" height={height} width={Math.round((height * 193) / 82)} />
    </span>
  );
}
