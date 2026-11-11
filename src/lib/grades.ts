// AI-assisted (Claude Code): on Nov 11 added the `side` parameter and the bottom-of-band table for a program's minimum UK class, at my request for lack of time; I will rewrite this change myself before the CS50 submission.
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

// Each UK class is a band (First 9–10, 2:1 8–9, 2:2 7–8, Third 6–7).
// A student's class can be anywhere in the band: we use the middle.
const UK_CLASS_ON_TEN: Record<UkClass, number> = {
    first: 9.5,
    '2:1': 8.5,
    '2:2': 7.5,
    third: 6.5,
};

// A program asking for "at least a 2:1" accepts the whole band: we use its bottom.
const UK_CLASS_MINIMUM_ON_TEN: Record<UkClass, number> = {
    first: 9,
    '2:1': 8,
    '2:2': 7,
    third: 6,
};

// Whose grade is converted. Only UK classes differ; linear scales are the same for both.
export type GradeSide = 'student' | 'minimum';

const PASS_ON_TEN = 6;
const BEST_ON_TEN = 10;

export function toTenScale(grade: number | UkClass, scale: GradeScaleId, side: GradeSide = 'student'): number | null {
    if (scale === 'other') return null;

    if (scale === 'uk_class') {
        if (typeof grade !== 'string') return null;
        const table = side === 'minimum' ? UK_CLASS_MINIMUM_ON_TEN : UK_CLASS_ON_TEN;
        return table[grade] ?? null;
    }

    if (typeof grade !== 'number' || !Number.isFinite(grade)) return null;

    const { best, pass } = LINEAR_SCALES[scale];
    const position = (grade - pass) / (best - pass);
    const onTen = PASS_ON_TEN + position * (BEST_ON_TEN - PASS_ON_TEN);
    const clamped = Math.min(BEST_ON_TEN, Math.max(0, onTen));

    return Math.round(clamped * 10) / 10;
}