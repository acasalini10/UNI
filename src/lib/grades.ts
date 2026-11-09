// Converts a grade to UNI's 0–10 scale.
// Rule: the scale's passing grade maps to 6 (Mexican passing grade),
// the best grade maps to 10, linear in between.
// Scale ids match profiles.grade_scale in the database.
// UK class ids match profiles.grade_class in the database.

export type GradeScaleId = '10' | '4.0' | '100' | '30' | 'uk_class' | 'other';
export type UkClass = 'first' | '2:1' | '2:2' | 'third';

type LinearScaleId = '10' | '4.0' | '100' | '30';

const LINEAR_SCALES: Record<LinearScaleId, { best: number; pass: number }> = {
    '10': { best: 10, pass: 6 },
    '4.0': { best: 4, pass: 2 },
    '100': { best: 100, pass: 60 },
    '30': { best: 30, pass: 18 },
};

// Each UK class is a band; we use the middle of the band.
const UK_CLASS_ON_TEN: Record<UkClass, number> = {
    first: 9.5,
    '2:1': 8.5,
    '2:2': 7.5,
    third: 6.5,
};

const PASS_ON_TEN = 6;
const BEST_ON_TEN = 10;

export function toTenScale(grade: number | UkClass, scale: GradeScaleId): number | null {
    if (scale === 'other') return null;

    if (scale === 'uk_class') {
        if (typeof grade !== 'string') return null;
        return UK_CLASS_ON_TEN[grade] ?? null;
    }

    if (typeof grade !== 'number' || !Number.isFinite(grade)) return null;

    const { best, pass } = LINEAR_SCALES[scale];
    const position = (grade - pass) / (best - pass);
    const onTen = PASS_ON_TEN + position * (BEST_ON_TEN - PASS_ON_TEN);
    const clamped = Math.min(BEST_ON_TEN, Math.max(0, onTen));

    return Math.round(clamped * 10) / 10;
}