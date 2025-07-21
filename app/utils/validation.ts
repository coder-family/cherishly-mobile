import * as yup from "yup";

export function isValidRecordingId(id: string): boolean {
  return typeof id === "string" && /^recording_\d+_[a-z0-9]+$/.test(id);
}

export const loginSchema = yup.object().shape({
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const registerSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  role: yup.string().required("Role is required"),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

export type LoginForm = yup.InferType<typeof loginSchema>;
export type RegisterForm = yup.InferType<typeof registerSchema>;

// Memory validation schemas
export const createMemorySchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be between 1 and 200 characters")
    .required("Title is required"),
  content: yup
    .string()
    .trim()
    .min(1, "Content is required")
    .max(5000, "Content must not exceed 5000 characters")
    .required("Content is required"),
  childId: yup
    .string()
    .required("Child ID is required"),
  date: yup
    .string()
    .required("Date is required")
    .test('is-valid-date', 'Date must be a valid ISO date', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('not-in-future', 'Date cannot be in the future', (value) => {
      if (!value) return true;
      const date = new Date(value);
      const now = new Date();
      return date <= now;
    }),
  tags: yup
    .array()
    .of(yup.string().max(50, "Each tag must be a string with maximum 50 characters"))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  visibility: yup
    .string()
    .oneOf(['private', 'public'], 'Visibility must be either "private" or "public"')
    .optional(),
  location: yup
    .object()
    .shape({
      type: yup.string().oneOf(['Point'], 'Invalid location type').required(),
      coordinates: yup
        .array()
        .of(yup.number())
        .length(2, 'Coordinates must be an array of 2 numbers [longitude, latitude]')
        .test('valid-coordinates', 'Invalid coordinates values', (value) => {
          if (!value || value.length !== 2) return false;
          const [longitude, latitude] = value;
          return typeof longitude === 'number' && typeof latitude === 'number' && 
                 longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
        })
        .required()
    })
    .optional(),
});

export const updateMemorySchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .min(1, "Title must be between 1 and 200 characters")
    .max(200, "Title must be between 1 and 200 characters")
    .optional(),
  content: yup
    .string()
    .trim()
    .max(5000, "Content must not exceed 5000 characters")
    .optional(),
  date: yup
    .string()
    .test('is-valid-date', 'Date must be a valid ISO date', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('not-in-future', 'Date cannot be in the future', (value) => {
      if (!value) return true;
      const date = new Date(value);
      const now = new Date();
      return date <= now;
    })
    .optional(),
  tags: yup
    .array()
    .of(yup.string().max(50, "Each tag must be a string with maximum 50 characters"))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  visibility: yup
    .string()
    .oneOf(['private', 'public'], 'Visibility must be either "private" or "public"')
    .optional(),
  location: yup
    .object()
    .shape({
      type: yup.string().oneOf(['Point'], 'Invalid location type').required(),
      coordinates: yup
        .array()
        .of(yup.number())
        .length(2, 'Coordinates must be an array of 2 numbers [longitude, latitude]')
        .test('valid-coordinates', 'Invalid coordinates values', (value) => {
          if (!value || value.length !== 2) return false;
          const [longitude, latitude] = value;
          return typeof longitude === 'number' && typeof latitude === 'number' && 
                 longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
        })
        .required()
    })
    .optional(),
});

export type CreateMemoryForm = yup.InferType<typeof createMemorySchema>;
export type UpdateMemoryForm = yup.InferType<typeof updateMemorySchema>;
