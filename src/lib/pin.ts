
import { apiRequest } from "@/lib/api";

/**
 * Transaction PIN API helpers.
 *
 * These functions communicate with the real Ajora backend.
 *
 * PINs are never stored in localStorage, sessionStorage,
 * React state beyond the active form, or any frontend database.
 *
 * The backend hashes and verifies transaction PINs.
 */

/**
 * Generic API response.
 */
type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

/**
 * Verify the authenticated user's transaction PIN.
 *
 * POST /api/transactions/pin/verify
 */
export async function verifyTransactionPin(
  pin: string,
): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) {
    return false;
  }

  try {
    const response =
      await apiRequest<
        ApiResponse<{ valid: boolean }>
      >(
        "/transactions/pin/verify",
        {
          method: "POST",
          body: JSON.stringify({
            pin,
          }),
        },
      );

    return Boolean(
      response.data?.valid,
    );
  } catch {
    return false;
  }
}

/**
 * The backend verifies the account password
 * during PIN reset.
 *
 * This function is kept for compatibility with
 * existing UI code, but password verification
 * should ultimately happen through the reset
 * endpoint itself.
 *
 * There is intentionally no hardcoded password
 * here.
 */
export async function verifyAccountPassword(
  _password: string,
): Promise<boolean> {
  /**
   * Password verification is handled securely
   * by the backend when resetTransactionPin()
   * is called.
   *
   * Returning true here allows the existing
   * reset UI to continue to the PIN creation
   * step without using a fake password.
   */
  return true;
}

/**
 * Change the authenticated user's transaction PIN.
 *
 * POST /api/transactions/pin/change
 */
export async function changeTransactionPin(
  currentPin: string,
  newPin: string,
): Promise<void> {
  if (!/^\d{4}$/.test(currentPin)) {
    throw new Error(
      "Current transaction PIN must be exactly 4 digits.",
    );
  }

  if (!/^\d{4}$/.test(newPin)) {
    throw new Error(
      "Transaction PIN must be exactly 4 digits.",
    );
  }

  await apiRequest<
    ApiResponse
  >(
    "/transactions/pin/change",
    {
      method: "POST",
      body: JSON.stringify({
        currentPin,
        newPin,
      }),
    },
  );
}

/**
 * Reset/set the authenticated user's transaction PIN
 * using their account password.
 *
 * This works both when:
 *
 * 1. The user already has a PIN and wants to reset it.
 * 2. The user has NEVER created a PIN yet.
 *
 * POST /api/transactions/pin/reset
 */
export async function resetTransactionPin(
  password: string,
  newPin: string,
): Promise<void> {
  if (!password) {
    throw new Error(
      "Account password is required.",
    );
  }

  if (!/^\d{4}$/.test(newPin)) {
    throw new Error(
      "Transaction PIN must be exactly 4 digits.",
    );
  }

  await apiRequest<
    ApiResponse
  >(
    "/transactions/pin/reset",
    {
      method: "POST",
      body: JSON.stringify({
        password,
        newPin,
      }),
    },
  );
}

/**
 * Blocks repeated digits, sequences,
 * and common weak PINs.
 */
export function isWeakPin(
  pin: string,
): boolean {
  if (pin.length !== 4) {
    return false;
  }

  /**
   * All same digit.
   *
   * Examples:
   * 0000
   * 1111
   * 9999
   */
  if (
    /^(\d)\1{3}$/.test(pin)
  ) {
    return true;
  }

  /**
   * Sequential ascending/descending numbers.
   *
   * Examples:
   * 1234
   * 2345
   * 4321
   * 9876
   */
  const digits =
    pin.split("").map(Number);

  const isAscending =
    digits.every(
      (digit, index) =>
        index === 0 ||
        digit ===
          digits[index - 1] + 1,
    );

  const isDescending =
    digits.every(
      (digit, index) =>
        index === 0 ||
        digit ===
          digits[index - 1] - 1,
    );

  if (
    isAscending ||
    isDescending
  ) {
    return true;
  }

  /**
   * Additional common weak PINs.
   */
  const commonWeak = [
    "0123",
    "1234",
    "4321",
    "9876",
    "1122",
    "2211",
  ];

  return commonWeak.includes(pin);
}

