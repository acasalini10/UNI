// AI-assisted (Claude Code): wrote the unit tests for cost.ts at my request.
/// <reference types="jest" />
import {
    convert,
    defaultCurrencyFor,
    formatMoney,
    getCostValues,
    isValidCurrency,
    type Rates,
} from './cost';

const rates: Rates = {
    date: '2026-11-08',
    base: 'USD',
    rates: { USD: 1, MXN: 18, EUR: 0.9, GBP: 0.8 },
};

describe('defaultCurrencyFor', () => {
    it('uses the currency of the 10 listed countries', () => {
        expect(defaultCurrencyFor('MX')).toBe('MXN');
        expect(defaultCurrencyFor('IT')).toBe('EUR');
        expect(defaultCurrencyFor('GB')).toBe('GBP');
        expect(defaultCurrencyFor('CH')).toBe('CHF');
    });

    it('accepts lowercase country codes', () => {
        expect(defaultCurrencyFor('mx')).toBe('MXN');
    });

    it('falls back to USD for every other country', () => {
        expect(defaultCurrencyFor('JP')).toBe('USD');
    });
});

describe('convert', () => {
    it('converts through the base currency', () => {
        expect(convert(100, 'USD', 'MXN', rates)).toBeCloseTo(1800);
        expect(convert(90, 'EUR', 'MXN', rates)).toBeCloseTo(1800);
        expect(convert(80, 'GBP', 'EUR', rates)).toBeCloseTo(90);
    });

    it('ignores the case of the currency codes', () => {
        expect(convert(100, 'usd', 'mxn', rates)).toBeCloseTo(1800);
    });

    it('returns null when a rate is missing', () => {
        expect(convert(100, 'USD', 'CHF', rates)).toBeNull();
        expect(convert(100, 'CHF', 'USD', rates)).toBeNull();
    });
});

describe('getCostValues', () => {
    it('keeps the published amount and unit and adds the conversion with the rate date', () => {
        const result = getCostValues({ amount: 30000, currency: 'EUR', unit: 'per_year' }, 'MXN', rates);
        expect(result.original).toEqual({ amount: 30000, currency: 'EUR', unit: 'per_year' });
        expect(result.converted?.currency).toBe('MXN');
        expect(result.converted?.amount).toBeCloseTo(600000);
        expect(result.converted?.rateDate).toBe('2026-11-08');
    });

    it('gives no conversion when the currency is the same, whatever the case', () => {
        const result = getCostValues({ amount: 50000, currency: 'usd', unit: 'total' }, 'USD', rates);
        expect(result.original.currency).toBe('USD');
        expect(result.converted).toBeNull();
    });

    it('gives no conversion when a rate is missing', () => {
        const result = getCostValues({ amount: 900, currency: 'GBP', unit: 'per_credit' }, 'CHF', rates);
        expect(result.original.amount).toBe(900);
        expect(result.converted).toBeNull();
    });
});

describe('isValidCurrency', () => {
    it('accepts 3-letter codes present in rates.json, in any case', () => {
        expect(isValidCurrency('EUR', rates)).toBe(true);
        expect(isValidCurrency('eur', rates)).toBe(true);
    });

    it('rejects codes that are malformed or missing from rates.json', () => {
        expect(isValidCurrency('EURO', rates)).toBe(false);
        expect(isValidCurrency('ABC', rates)).toBe(false);
        expect(isValidCurrency('CHF', rates)).toBe(false);
        expect(isValidCurrency('', rates)).toBe(false);
    });
});

describe('formatMoney', () => {
    it('shows the currency code and no decimals', () => {
        expect(formatMoney(58000, 'USD', 'en-US')).toMatch(/^USD\s58,000$/);
        expect(formatMoney(1234.6, 'usd', 'en-US')).toMatch(/^USD\s1,235$/);
    });

    it('falls back to "CODE amount" when Intl rejects the code', () => {
        expect(formatMoney(1234.6, 'euro', 'en-US')).toBe('EURO 1235');
    });
});
