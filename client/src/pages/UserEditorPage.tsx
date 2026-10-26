import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';
import Spinner from '../components/ui/Spinner';
import UserFormFields, {
  initialValues,
  validate,
  type FormValues,
} from '../components/users/UserFormFields';
import { useToast } from '../context/ToastContext';
import { usersApi } from '../services/usersApi';
import type { UserInput } from '../types/user';

type TouchedMap = Partial<Record<keyof FormValues, boolean>>;

/**
 * Dedicated full page for creating a user (`/users/new`) or editing one
 * (`/users/:id/edit`). Field errors appear on blur (PRD §4.3) and block the
 * submit; failed saves keep the page open and show the server's field errors —
 * the UI never pretends a failed request succeeded.
 */
export default function UserEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const showToast = useToast();

  const [userId, setUserId] = useState<string | null>(id ?? null);
  const [values, setValues] = useState<FormValues>(() => initialValues(null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<TouchedMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [initialError, setInitialError] = useState<string | null>(null);

  // Edit mode: load the record first, then prefill the form.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setInitialLoading(true);
    setInitialError(null);

    usersApi
      .get(id)
      .then((user) => {
        if (cancelled) return;
        setValues(initialValues(user));
        setUserId(user._id);
        setInitialLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setInitialError(err instanceof Error ? err.message : 'Failed to load this user');
        setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setFormError(null);
    // Re-validate live once the field has been visited, so a bad value fixed
    // in-place clears its error without another blur.
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  };

  // PRD: validation runs on blur, not only on submit.
  const handleBlur = (key: keyof FormValues) => {
    setTouched((previous) => ({ ...previous, [key]: true }));

    const fieldResult = validate(values);
    if (fieldResult[key]) {
      setErrors((previous) => ({ ...previous, [key]: fieldResult[key] }));
    } else {
      setErrors((previous) => {
        if (!previous[key]) return previous;
        const next = { ...previous };
        delete next[key as string];
        return next;
      });
    }
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validate(values);
    if (Object.keys(clientErrors).length > 0) {
      const allTouched: TouchedMap = {};
      for (const key of Object.keys(clientErrors) as Array<keyof FormValues>) {
        allTouched[key] = true;
      }
      setTouched((previous) => ({ ...previous, ...allTouched }));
      setErrors(clientErrors);
      return;
    }

    const input: UserInput = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      status: values.status,
      phone: values.phone.trim(),
    };

    setSaving(true);
    try {
      if (isEdit && userId) {
        const updated = await usersApi.update(userId, input);
        showToast(`User "${updated.name}" updated`);
      } else {
        const created = await usersApi.create(input);
        showToast(`User "${created.name}" created`);
      }
      navigate('/users');
    } catch (err) {
      const failure = err as { fields?: Record<string, string>; message?: string };
      if (failure.fields && Object.keys(failure.fields).length > 0) {
        const serverTouched: TouchedMap = {};
        for (const key of Object.keys(failure.fields) as Array<keyof FormValues>) {
          serverTouched[key] = true;
        }
        setTouched((previous) => ({ ...previous, ...serverTouched }));
        setErrors(failure.fields);
        setFormError('Please fix the errors below.');
      } else {
        setFormError(failure.message ?? 'Something went wrong. Please try again.');
      }
      setSaving(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="page page--form">
        <div className="card form-loading">
          <Spinner size={20} label="Loading user" />
          <span>Loading user…</span>
        </div>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="page page--form">
        <ErrorBanner message={initialError} />
        <Link to="/users" className="btn btn--secondary">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="page page--form">
      <header className="page__header">
        <div>
          <Link to="/users" className="page__back-link">
            Users
          </Link>
          <h1 className="page__title">{isEdit ? 'Edit user' : 'Create user'}</h1>
          <p className="page__subtitle">
            {isEdit ? `Editing record ${userId}` : 'Add a new team member to Forma.'}
          </p>
        </div>
      </header>

      <form id="user-editor" className="card user-form-card" onSubmit={handleSubmit} noValidate>
        {formError ? <p className="form-banner">{formError}</p> : null}

        <UserFormFields
          values={values}
          errors={errors}
          touched={touched}
          onChange={setField}
          onBlur={handleBlur}
        />

        <footer className="user-form-card__footer">
          <Button variant="secondary" disabled={saving} onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner size={14} label="Saving" /> : null}
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </footer>
      </form>
    </div>
  );
}
