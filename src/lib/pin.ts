/**
 * Transaction PIN stubs. Real implementations hash the PIN and talk to the
 * backend — these just simulate latency and success/failure for the UI build.
 * Never log PINs; never persist them beyond ephemeral form state.
 */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyTransactionPin(pin: string): Promise<boolean> {
  await sleep(500);
  return pin === "1234"; // testing only
}

export async function verifyAccountPassword(
  password: string,
): Promise<boolean> {
  await sleep(500);
  return password === "Password123"; // testing only
}

export async function changeTransactionPin(
  currentPin: string,
  newPin: string,
): Promise<void> {
  await sleep(500);
  void newPin;
  const valid = await verifyTransactionPin(currentPin);
  if (!valid) throw new Error("Current PIN is incorrect");
}

export async function resetTransactionPin(
  password: string,
  newPin: string,
): Promise<void> {
  await sleep(500);
  void newPin;
  if (password !== "Password123") throw new Error("Password is incorrect");
}

/** Blocks repeated digits, sequences, and a handful of common weak PINs. */
export function isWeakPin(pin: string): boolean {
  if (pin.length !== 4) return false;

  // All same digit
  if (/^(\d)\1{3}$/.test(pin)) return true;

  // Sequential ascending or descending
  const digits = pin.split("").map(Number);
  const isAscending = digits.every(
    (d, i) => i === 0 || d === digits[i - 1] + 1,
  );
  const isDescending = digits.every(
    (d, i) => i === 0 || d === digits[i - 1] - 1,
  );
  if (isAscending || isDescending) return true;

  const commonWeak = ["0123", "1234", "4321", "9876", "1122", "2211"];
  return commonWeak.includes(pin);
}
