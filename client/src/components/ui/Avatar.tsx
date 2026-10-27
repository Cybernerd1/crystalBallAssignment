interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Initials are decorative by default because the person's name is always
   * printed alongside them. Set false only when the avatar is the sole visual
   * label (e.g. the topbar account trigger) so its text joins the accessible
   * name.
   */
  decorative?: boolean;
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
export default function Avatar({ name, size = 'md', decorative = true }: AvatarProps) {
  return (
    <span
      className={`avatar avatar--${size}`}
      aria-hidden={decorative ? 'true' : undefined}
    >
      {initialsOf(name) || '?'}
    </span>
  );
}
