import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const ROLES = ['admin', 'editor', 'viewer'];
export const STATUSES = ['active', 'inactive'];

/** Phone rules: 7–15 digits (a "+" prefix and formatting separators are allowed). */
export const PHONE_DIGITS_MIN = 7;
export const PHONE_DIGITS_MAX = 15;
export const PHONE_RE = /^(\+?[\d\s()+.\-]*)$/;
export function digitsIn(value) {
  return (String(value).match(/\d/g) ?? []).length;
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxLength: [80, 'Name must be 80 characters or fewer'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
      maxLength: 254,
    },
    role: {
      type: String,
      enum: { values: ROLES, message: 'Role must be admin, editor or viewer' },
      default: 'viewer',
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be active or inactive' },
      default: 'active',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxLength: 25,
      validate: {
        validator: (value) => {
          if (value === '') return true;
          return PHONE_RE.test(value) && digitsIn(value) >= 7 && digitsIn(value) <= 15;
        },
        message: 'Phone must contain 7–15 digits (optional + and separators)',
      },
    },
  },
  { timestamps: true },
);

// Uniqueness must be enforced by the database, not only at the application
// layer, otherwise concurrent creates can slip duplicates past validation.
userSchema.index({ email: 1 }, { unique: true });

userSchema.set('toJSON', {
  virtuals: false,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default model('User', userSchema);
