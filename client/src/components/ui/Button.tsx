import type { ButtonHTMLAttributes, ReactNode } from 'react';

import Icon, { type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';
export type ButtonSize = 'md' | 'sm';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
  'danger-outline': 'btn--danger-outline',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Renders a disabled-looking (non-focusable) label — e.g. busy states. */
  busy?: boolean;
  children?: ReactNode;
}

/**
 * Button primitive. The whole app renders buttons through this component so
 * variants/spacing remain consistent (the theming engine recolors the primary
 * variant via `--btn-bg` / `--btn-text`).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  busy = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = ['btn', VARIANT_CLASS[variant]];
  if (size === 'sm') classes.push('btn--sm');
  if (busy) classes.push('btn--disabled');
  if (className) classes.push(className);

  return (
    <button type="button" className={classes.join(' ')} disabled={disabled || busy} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} /> : null}
      {children}
    </button>
  );
}
