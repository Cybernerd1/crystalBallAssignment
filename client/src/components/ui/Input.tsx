import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Marks the field red with the standard invalid style. */
  invalid?: boolean;
}

/** Text/search/email/phone input primitive (`.input` look from global.css). */
export default function Input({ invalid, className, ...rest }: InputProps) {
  const classes = ['input', invalid ? 'input--invalid' : '', className ?? ''].filter(Boolean);
  return <input className={classes.join(' ')} {...rest} />;
}
