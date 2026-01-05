export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const emailRe = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;

export function validateEmail(email: string): string | null {
  const e = normalizeEmail(email);
  if (!e) return "Email is required";
  if (e.length > 254) return "Email is too long";
  if (!emailRe.test(e)) return "Invalid email format";
  return null;
}

export function validateEmailOptional(email: string): string | null {
  const e = normalizeEmail(email);
  if (!e) return null;
  return validateEmail(e);
}

export function validatePassword(pw: string): string | null {
  if (!pw) return "Password is required";
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (pw.length > 72) return "Password must be at most 72 characters";
  if (!/[a-z]/.test(pw)) return "Password must contain a lower-case letter";
  if (!/[A-Z]/.test(pw)) return "Password must contain an upper-case letter";
  if (!/[0-9]/.test(pw)) return "Password must contain a number";
  if (!/[\p{P}\p{S}]/u.test(pw)) return "Password must contain a symbol";
  return null;
}

export function validatePasswordOptional(pw: string): string | null {
  if (!pw || pw.trim() === "") return null;
  return validatePassword(pw);
}
