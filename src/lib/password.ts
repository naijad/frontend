export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Weak" | "Fair" | "Good" | "Strong" | "Very strong";
  hint: string;
  meetsMinimumRequirements: boolean;
};

/**
 * Regex-based password scorer. Good enough for v1 — swap for `zxcvbn` later to
 * catch common patterns ("password123", keyboard walks, etc.).
 */
export function scorePassword(password: string): PasswordStrength {
  let score = 0;
  const missing: string[] = [];

  if (password.length >= 8) score++;
  else missing.push("Make it at least 8 characters");

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else missing.push("Mix uppercase and lowercase letters");

  if (/\d/.test(password)) score++;
  else missing.push("Add a number");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else missing.push("Add a symbol");

  if (password.length >= 12) score = Math.min(4, score + 1);

  const labels: Record<number, PasswordStrength["label"]> = {
    0: "Weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  return {
    score: score as PasswordStrength["score"],
    label: score >= 4 ? "Very strong" : labels[score],
    hint: missing.length > 0 ? missing[0] : "Nice — this password is strong.",
    meetsMinimumRequirements: password.length >= 8 && score >= 2,
  };
}
