// Returns the international fee as published by the university,
// plus an approximate conversion into the user's currency.
// Tuition and fees stay separate; getCardCost sums them for the program card.
// Returns values, not display text: screens translate the unit with t().

export type CostUnit = 'per_year' | 'total' | 'per_credit';

export interface ProgramCost {
    amount: number;   // international fee, as published on the university site
    currency: string; // ISO 4217 code
    unit: CostUnit;   // unit as published on the university site
}

// Tuition and fees as published, kept separate for the detail screen.
// fees is null when the university doesn't publish them (not the same as 0).
export interface ProgramFees {
    tuition: ProgramCost;
    fees: ProgramCost | null;
}

export interface CardCost {
    cost: ProgramCost;
    includesFees: boolean; // false: the card shows tuition only, label it that way
}

// Shape of rates.json: how many units of each currency equal 1 unit of `base`.
// `rates` must include the base currency itself with value 1.
export interface Rates {
    date: string;
    base: string;
    rates: Record<string, number>;
}

export interface ConvertedCost {
    amount: number;
    currency: string;
    rateDate: string;
}

export interface CostValues {
    original: ProgramCost;
    converted: ConvertedCost | null; // null if same currency or rate missing
}

// MVP: 10 countries, every other country falls back to USD.
const DEFAULT_CURRENCY: Record<string, string> = {
    MX: 'MXN',
    US: 'USD',
    IT: 'EUR',
    ES: 'EUR',
    DE: 'EUR',
    FR: 'EUR',
    NL: 'EUR',
    IE: 'EUR',
    GB: 'GBP',
    CH: 'CHF',
};

export function defaultCurrencyFor(countryCode: string): string {
    return DEFAULT_CURRENCY[countryCode.toUpperCase()] ?? 'USD';
}

export function convert(
    amount: number,
    from: string,
    to: string,
    rates: Rates,
): number | null {
    const fromRate = rates.rates[from.toUpperCase()];
    const toRate = rates.rates[to.toUpperCase()];
    if (fromRate === undefined || toRate === undefined) return null;
    return (amount / fromRate) * toRate;
}

export function getCostValues(
    cost: ProgramCost,
    userCurrency: string,
    rates: Rates,
): CostValues {
    const from = cost.currency.toUpperCase();
    const to = userCurrency.toUpperCase();
    const original: ProgramCost = { ...cost, currency: from };

    if (from === to) {
        return { original, converted: null };
    }
    const amount = convert(cost.amount, from, to, rates);
    if (amount === null) {
        return { original, converted: null };
    }
    return {
        original,
        converted: { amount, currency: to, rateDate: rates.date },
    };
}

// One amount for the program card: tuition + fees, in the published currency.
// Sums only when both share currency and unit; otherwise returns tuition alone,
// so the card never shows a sum of incompatible amounts.
export function getCardCost({ tuition, fees }: ProgramFees): CardCost {
    if (fees === null) {
        return { cost: tuition, includesFees: false };
    }
    const sameCurrency = tuition.currency.toUpperCase() === fees.currency.toUpperCase();
    const sameUnit = tuition.unit === fees.unit;
    if (!sameCurrency || !sameUnit) {
        return { cost: tuition, includesFees: false };
    }
    return {
        cost: { ...tuition, amount: tuition.amount + fees.amount },
        includesFees: true,
    };
}

// A currency is valid only if it is a 3-letter code that exists in rates.json.
// Intl alone accepts any 3-letter code, even ones that don't exist.
export function isValidCurrency(code: string, rates: Rates): boolean {
    const upper = code.toUpperCase();
    return /^[A-Z]{3}$/.test(upper) && rates.rates[upper] !== undefined;
}

// Locale comes from the active i18n language (e.g. 'es-MX', 'en-US').
export function formatMoney(amount: number, currency: string, locale: string): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency.toUpperCase(),
            currencyDisplay: 'code',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency.toUpperCase()} ${Math.round(amount)}`;
    }
}