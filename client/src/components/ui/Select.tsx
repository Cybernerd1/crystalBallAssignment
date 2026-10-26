import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Marks the field red with the standard invalid style. */
  invalid?: boolean;
}

/** Select primitive (`.input .select` look from global.css). */
export default function Select({ invalid, className, ...rest }: SelectProps) {
  const classes = ['input', 'select', invalid ? 'input--invalid' : '', className ?? ''].filter(Boolean);
  return <select className={classes.join(' ')} {...rest} />;
}
