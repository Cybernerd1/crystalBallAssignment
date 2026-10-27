import type { User, UserRole, UserStatus } from '../../types/user';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import Select from '../ui/Select';

/** Values edited by the create/edit form (new page and prefill). */
export interface FormValues {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
}

export function initialValues(user: User | null): FormValues {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'viewer',
    status: user?.status ?? 'active',
    phone: user?.phone ?? '',
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9\s()+.\-]+$/;

/** Client-side checks; the server re-validates and reports field errors. */
export function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (values.phone.trim()) {
    const digits = values.phone.match(/\d/g)?.length ?? 0;
    if (!PHONE_RE.test(values.phone.trim())) {
      errors.phone = 'Phone can only contain digits, spaces and + ( ) . - characters';
    } else if (digits < 7 || digits > 15) {
      errors.phone = 'Phone must contain between 7 and 15 digits';
    }
  }
  return errors;
}

interface UserFormFieldsProps {
  values: FormValues;
  errors: Record<string, string>;
  /** Fields the user has left once — blur-level validation shows errors then. */
  touched: Partial<Record<keyof FormValues, boolean>>;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  onBlur: (key: keyof FormValues) => void;
}

/** The editable fields, shared by the create and edit pages. */
export default function UserFormFields({
  values,
  errors,
  touched,
  onChange,
  onBlur,
}: UserFormFieldsProps) {
  function visibleError(key: keyof FormValues): string | undefined {
    return touched[key] ? errors[key] : undefined;
  }

  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor="user-name">
          Full name
        </label>
        <Input
          id="user-name"
          invalid={Boolean(visibleError('name'))}
          value={values.name}
          autoComplete="name"
          autoFocus
          aria-describedby="user-name-error"
          onChange={(event) => onChange('name', event.target.value)}
          onBlur={() => onBlur('name')}
        />
        {visibleError('name') ? (
          <p id="user-name-error" className="field-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="user-email">
          Email
        </label>
        <Input
          id="user-email"
          type="email"
          invalid={Boolean(visibleError('email'))}
          value={values.email}
          autoComplete="email"
          placeholder="user@example.com"
          aria-describedby="user-email-error"
          onChange={(event) => onChange('email', event.target.value)}
          onBlur={() => onBlur('email')}
        />
        {visibleError('email') ? (
          <p id="user-email-error" className="field-error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field__label" htmlFor="user-role">
            Role
          </label>
          <span className="select-wrap">
            <Select
              id="user-role"
              value={values.role}
              onChange={(event) => onChange('role', event.target.value as UserRole)}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </Select>
            <Icon name="chevron-down" size={13} className="select-wrap__chevron" />
          </span>
        </div>

        <div className="field">
          <span className="field__label" id="status-label">
            Status
          </span>
          <div className="segmented" role="group" aria-labelledby="status-label">
            {(['active', 'inactive'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={`segmented__option ${values.status === option ? 'segmented__option--active' : ''}`}
                aria-pressed={values.status === option}
                onClick={() => onChange('status', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="user-phone">
          Phone <span className="field__hint">(optional · 7–15 digits)</span>
        </label>
        <Input
          id="user-phone"
          invalid={Boolean(visibleError('phone'))}
          value={values.phone}
          autoComplete="tel"
          placeholder="+1 555 010 0100"
          aria-describedby="user-phone-error"
          onChange={(event) => onChange('phone', event.target.value)}
          onBlur={() => onBlur('phone')}
        />
        {visibleError('phone') ? (
          <p id="user-phone-error" className="field-error">
            {errors.phone}
          </p>
        ) : null}
      </div>
    </>
  );
}
