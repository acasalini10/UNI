// AI-assisted (Claude Code): wrote the unit tests for grades.ts at my request.
/// <reference types="jest" />
import { toTenScale } from './grades';

describe('toTenScale', () => {
    it('leaves the 0 to 10 scale unchanged', () => {
        expect(toTenScale(0, '10')).toBe(0);
        expect(toTenScale(6, '10')).toBe(6);
        expect(toTenScale(7.5, '10')).toBe(7.5);
        expect(toTenScale(10, '10')).toBe(10);
    });

    it('maps the US 4.0 scale with 2.0 as the passing grade', () => {
        expect(toTenScale(2.0, '4.0')).toBe(6);
        expect(toTenScale(3.0, '4.0')).toBe(8);
        expect(toTenScale(3.6, '4.0')).toBe(9.2);
        expect(toTenScale(4.0, '4.0')).toBe(10);
    });

    it('maps percentages with 60 as the passing grade', () => {
        expect(toTenScale(60, '100')).toBe(6);
        expect(toTenScale(80, '100')).toBe(8);
        expect(toTenScale(90, '100')).toBe(9);
        expect(toTenScale(100, '100')).toBe(10);
    });

    it('maps the Italian 18 to 30 scale', () => {
        expect(toTenScale(18, '30')).toBe(6);
        expect(toTenScale(24, '30')).toBe(8);
        expect(toTenScale(27, '30')).toBe(9);
        expect(toTenScale(30, '30')).toBe(10);
    });

    it('uses the middle of each UK class band, with the database ids', () => {
        expect(toTenScale('first', 'uk_class')).toBe(9.5);
        expect(toTenScale('2:1', 'uk_class')).toBe(8.5);
        expect(toTenScale('2:2', 'uk_class')).toBe(7.5);
        expect(toTenScale('third', 'uk_class')).toBe(6.5);
    });

    it('uses the bottom of each UK class band for a program minimum', () => {
        expect(toTenScale('first', 'uk_class', 'minimum')).toBe(9);
        expect(toTenScale('2:1', 'uk_class', 'minimum')).toBe(8);
        expect(toTenScale('2:2', 'uk_class', 'minimum')).toBe(7);
        expect(toTenScale('third', 'uk_class', 'minimum')).toBe(6);
    });

    it('converts linear scales the same way for a student and a minimum', () => {
        expect(toTenScale(3.0, '4.0', 'minimum')).toBe(toTenScale(3.0, '4.0'));
        expect(toTenScale(80, '100', 'minimum')).toBe(8);
    });

    it('returns null for the "other" scale', () => {
        expect(toTenScale(85, 'other')).toBeNull();
    });

    it('stays linear below the passing grade', () => {
        expect(toTenScale(0, '4.0')).toBe(2);
        expect(toTenScale(30, '100')).toBe(3);
    });

    it('keeps the result between 0 and 10', () => {
        expect(toTenScale(-1, '10')).toBe(0);
        expect(toTenScale(12, '10')).toBe(10);
    });

    it('returns null when the grade does not fit the scale', () => {
        expect(toTenScale(8, 'uk_class')).toBeNull();
        expect(toTenScale('first', '10')).toBeNull();
        expect(toTenScale(Number.NaN, '10')).toBeNull();
        expect(toTenScale(Number.POSITIVE_INFINITY, '100')).toBeNull();
    });
});
