// Assigns the fit label by comparing the student's GPA and IELTS
// with the program's published minimums. GPAs on the 0–10 scale.
// Returns keys, not display text: screens translate them with t().

export type FitLabel = 'safety' | 'match' | 'reach' | 'not_yet_eligible' | 'not_rated';

export interface StudentScores {
    gpa: number | null;   // 0–10, null if the scale could not be converted
    ielts: number | null; // null if the student has no score yet
}

export interface ProgramMinimums {
    minGpa: number | null; // 0–10, already converted with toTenScale
    minIelts: number | null;
    highlySelective: boolean;
}

export type CheckStatus = 'met' | 'below' | 'no_minimum' | 'missing_score';

export interface RequirementCheck {
    status: CheckStatus;
    minimum: number | null;
    student: number | null;
    difference: number | null; // student - minimum, rounded to 0.1
}

export interface FitResult {
    label: FitLabel;
    gpa: RequirementCheck;
    english: RequirementCheck;
}

const REACH_MIN = -0.5;
const REACH_MAX = 0.5;
const MATCH_MAX = 1.0;

function round1(n: number): number {
    return Math.round(n * 10) / 10;
}

function check(student: number | null, minimum: number | null): RequirementCheck {
    if (minimum === null) {
        return { status: 'no_minimum', minimum: null, student, difference: null };
    }
    if (student === null) {
        return { status: 'missing_score', minimum, student: null, difference: null };
    }
    const difference = round1(student - minimum);
    return {
        status: difference >= 0 ? 'met' : 'below',
        minimum,
        student,
        difference,
    };
}

function labelFrom(
    gpa: RequirementCheck,
    english: RequirementCheck,
    highlySelective: boolean,
): FitLabel {
    // An English score below the minimum wins over everything else.
    if (english.status === 'below') return 'not_yet_eligible';

    // No GPA minimum, or no convertible student GPA: we cannot place the program.
    if (gpa.status === 'no_minimum' || gpa.status === 'missing_score') return 'not_rated';

    const difference = gpa.difference ?? 0;
    if (difference < REACH_MIN) return 'not_yet_eligible';
    if (difference <= REACH_MAX) return 'reach';
    if (difference <= MATCH_MAX) return 'match';
    return highlySelective ? 'match' : 'safety';
}

export function getFit(student: StudentScores, program: ProgramMinimums): FitResult {
    const gpa = check(student.gpa, program.minGpa);
    const english = check(student.ielts, program.minIelts);
    return {
        label: labelFrom(gpa, english, program.highlySelective),
        gpa,
        english,
    };
}