export default function Spinner({ size = 18, label = 'Loading' }: { size?: number; label?: string }) {
  return <span className="spinner" role="status" aria-label={label} style={{ width: size, height: size }} />;
}
