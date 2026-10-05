import { useEffect, useState } from "react";

/**
 * Shared "N failed attempts → lock for M seconds with a countdown" behaviour
 * for PIN / password verification screens. Countdown-based (no `Date.now()`)
 * so it stays lint-pure.
 */
export function useLockout(maxAttempts = 3, lockSeconds = 30) {
  const [attempts, setAttempts] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(
      () => setRemaining((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [remaining]);

  const locked = remaining > 0;

  /** Call on a failed attempt. Returns true if this failure triggered the lock. */
  const registerFailure = (): boolean => {
    const next = attempts + 1;
    if (next >= maxAttempts) {
      setAttempts(0);
      setRemaining(lockSeconds);
      return true;
    }
    setAttempts(next);
    return false;
  };

  const reset = () => {
    setAttempts(0);
    setRemaining(0);
  };

  const message = `Too many attempts. Try again in ${remaining} second${
    remaining === 1 ? "" : "s"
  }.`;

  return { locked, remaining, message, registerFailure, reset };
}
