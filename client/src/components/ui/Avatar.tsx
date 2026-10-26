interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] ?? '').toUpperCase())
    .join('');
}

/** Initials avatar tinted with the current theme accent. */
export default function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {initialsOf(name) || '?'}
    </span>
  );
}
