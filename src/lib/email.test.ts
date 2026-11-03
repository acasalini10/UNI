// AI-assisted (Claude Code): wrote the unit tests for email.ts at my request.
/// <reference types="jest" />
import { isValidEmail } from './email';

describe('isValidEmail', () => {
    it('accepts common addresses', () => {
        expect(isValidEmail('anna@example.com')).toBe(true);
        expect(isValidEmail('alessandro1.casalini@mail.polimi.it')).toBe(true);
        expect(isValidEmail('first+uni@sub.domain.co.uk')).toBe(true);
    });

    it('ignores spaces before and after the address', () => {
        expect(isValidEmail('  anna@example.com ')).toBe(true);
    });

    it('rejects an empty or blank string', () => {
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail('   ')).toBe(false);
    });

    it('rejects an address without @ or with more than one', () => {
        expect(isValidEmail('anna.example.com')).toBe(false);
        expect(isValidEmail('anna@@example.com')).toBe(false);
        expect(isValidEmail('an@na@example.com')).toBe(false);
    });

    it('rejects a missing name or domain', () => {
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('anna@')).toBe(false);
    });

    it('rejects a domain without a dot', () => {
        expect(isValidEmail('anna@example')).toBe(false);
    });

    it('rejects spaces inside the address', () => {
        expect(isValidEmail('an na@example.com')).toBe(false);
        expect(isValidEmail('anna@exa mple.com')).toBe(false);
    });
});
