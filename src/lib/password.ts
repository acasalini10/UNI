// Comments translated from Italian to English by Claude Code; the code is mine.
// Password rules for the sign-up screen (1b).
// Pure functions: they take a string and return a result,
// without touching app state. That makes them easy to test.

export const MIN_PASSWORD_LENGTH = 8;

export type PasswordChecks = {
    minLength: boolean;    // at least 8 characters
    hasDigit: boolean;     // at least one digit
    hasUppercase: boolean; // at least one uppercase letter
};

export function checkPassword(password: string): PasswordChecks {
    return {
        minLength: password.length >= MIN_PASSWORD_LENGTH,
        hasDigit: /[0-9]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
    };
}

// True only if every rule is met.
// Used to enable the "Continue" button.
export function isPasswordValid(password: string): boolean {
    const checks = checkPassword(password);
    return checks.minLength && checks.hasDigit && checks.hasUppercase;
}
