// Comments tidied by Claude Code; the code is mine.
// Email format check for screen 1 (email entry, used to sign up and to sign in).
// Pure function: takes a string and returns true or false.
// Checks the shape only (something@something.something), not that the address exists.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(email.trim());
}
