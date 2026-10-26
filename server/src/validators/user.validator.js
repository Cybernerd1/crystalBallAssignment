import { ROLES, STATUSES, PHONE_RE, digitsIn } from '../models/User.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES_TEXT = ROLES.map((r) => r).join(', ');

function validateFields(body, { partial = false } = {}) {
  const value = {};
  const errors = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { value, errors: { __form: 'Expected a JSON object' } };
  }

  // Name
  if (body.name !== undefined || !partial) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (name.length > 80) {
      errors.name = 'Name must be 80 characters or fewer';
    } else {
      value.name = name;
    }
  }

  // Email
  if (body.email !== undefined || !partial) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email) {
      errors.email = 'Email is required';
    } else if (email.length > 254) {
      errors.email = 'Email must be 254 characters or fewer';
    } else if (!EMAIL_RE.test(email)) {
      errors.email = 'Enter a valid email address';
    } else {
      value.email = email;
    }
  }

  // Role (defaults to "viewer" on create, per the PRD role set)
  if (body.role !== undefined) {
    if (typeof body.role !== 'string' || !ROLES.includes(body.role)) {
      errors.role = `Role must be ${ROLES_TEXT}`;
    } else {
      value.role = body.role;
    }
  } else if (!partial) {
    value.role = 'viewer';
  }

  // Status (defaults to "active" on create)
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !STATUSES.includes(body.status)) {
      errors.status = 'Status must be active or inactive';
    } else {
      value.status = body.status;
    }
  } else if (!partial) {
    value.status = 'active';
  }

  // Phone (optional, may be emptied on update). 7–15 digits required.
  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') {
      errors.phone = 'Phone must be a string';
    } else {
      const phone = body.phone.trim();
      const digits = digitsIn(phone);
      if (phone && (phone.length > 25 || !PHONE_RE.test(phone))) {
        errors.phone = 'Phone can only contain digits, spaces and + ( ) . - characters';
      } else if (phone && (digits < 7 || digits > 15)) {
        errors.phone = 'Phone must contain between 7 and 15 digits';
      } else {
        value.phone = phone;
      }
    }
  } else if (!partial) {
    value.phone = '';
  }

  return { value, errors };
}

/** Full validation for POST /api/users */
export function validateCreateUser(body) {
  return validateFields(body, { partial: false });
}

/** Partial validation for PUT /api/users/:id — only provided keys are checked */
export function validateUpdateUser(body) {
  return validateFields(body, { partial: true });
}
