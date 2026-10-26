import type { User, UserRole, UserStatus } from '../../types/user';

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
    role: user?.role ?? 'member',
    status: user?.status ?? 'inactive',
    phone: user?.phone ?? '',
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+.\-]*$/;

/** Client-side checks; the server re-validates and reports field errors. */
export function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) {
    errors.phone = 'Phone can only contain digits, spaces and + ( ) - characters';
  }
  return errors;
}

/** The editable fields, shared by the modal and the dedicated form pages. */
export default function UserFormFields({
  values,
  errors,
  onChange,
}: {
  values: FormValues;
  errors: Record<string, string>;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
}) {
  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor="user-name">
          Full name
        </label>
        <input
          id="user-name"
          className={`input ${errors.name ? 'input--invalid' : ''}`}
          value={values.name}
          autoComplete="name"
          autoFocus
          onChange={(event) => onChange('name', event.target.value)}
        />
        {errors.name ? <p className="field-error">{errors.name}</p> : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="user-email">
          Email
        </label>
        <input
          id="user-email"
          type="email"
          className={`input ${errors.email ? 'input--invalid' : ''}`}
          value={values.email}
          autoComplete="email"
          placeholder="user@example.com"
          onChange={(event) => onChange('email', event.target.value)}
        />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field__label" htmlFor="user-role">
            Role
          </label>
          <select
            id="user-role"
            className="input select"
            value={values.role}
            onChange={(event) => onChange('role', event.target.value as UserRole)}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="editor">Editor</option>
          </select>
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
          Phone <span className="field__hint">(optional)</span>
        </label>
        <input
          id="user-phone"
          className={`input ${errors.phone ? 'input--invalid' : ''}`}
          value={values.phone}
          autoComplete="tel"
          placeholder="+1 555 010 0100"
          onChange={(event) => onChange('phone', event.target.value)}
        />
        {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
      </div>
    </>
  );
}
