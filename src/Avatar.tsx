export function Avatar({ strategy }: { strategy: number }) {
  return <span className="avatar" aria-hidden="true" style={{ backgroundPosition: `${(strategy % 3) * 50}% ${Math.floor(strategy / 3) * 100}%` }} />;
}
