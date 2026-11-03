// AI-assisted (Claude Code): wrote the unit tests for password.ts at my request.
/// <reference types="jest" />
import { checkPassword, isPasswordValid, MIN_PASSWORD_LENGTH } from './password';

describe('checkPassword', () => {
    it('fails every rule for an empty password', () => {
        expect(checkPassword('')).toEqual({
            minLength: false,
            hasDigit: false,
            hasUppercase: false,
        });
    });

    it('passes every rule for a valid password', () => {
        expect(checkPassword('Password1')).toEqual({
            minLength: true,
            hasDigit: true,
            hasUppercase: true,
        });
    });

    it('needs at least MIN_PASSWORD_LENGTH characters', () => {
        expect(checkPassword('a'.repeat(MIN_PASSWORD_LENGTH - 1)).minLength).toBe(false);
        expect(checkPassword('a'.repeat(MIN_PASSWORD_LENGTH)).minLength).toBe(true);
    });

    it('detects a digit anywhere in the password', () => {
        expect(checkPassword('abcdefgh').hasDigit).toBe(false);
        expect(checkPassword('9abcdefg').hasDigit).toBe(true);
        expect(checkPassword('abc5defg').hasDigit).toBe(true);
    });

    it('detects an uppercase letter and ignores lowercase ones', () => {
        expect(checkPassword('abcdefg1').hasUppercase).toBe(false);
        expect(checkPassword('abcDefg1').hasUppercase).toBe(true);
    });

    it('counts spaces and symbols toward the length', () => {
        expect(checkPassword('A1 !@#$%').minLength).toBe(true);
    });
});

describe('isPasswordValid', () => {
    it('is true only when every rule is met', () => {
        expect(isPasswordValid('Password1')).toBe(true);
    });

    it('is false when any single rule fails', () => {
        expect(isPasswordValid('Pass1')).toBe(false); // too short
        expect(isPasswordValid('Password')).toBe(false); // no digit
        expect(isPasswordValid('password1')).toBe(false); // no uppercase
    });
});
