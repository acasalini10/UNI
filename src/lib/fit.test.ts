// AI-assisted (Claude Code): wrote the unit tests for fit.ts at my request, from the cases in docs/business-rules.md section 1.
/// <reference types="jest" />
import { getFit, type ProgramMinimums, type StudentScores } from './fit';

function program(overrides: Partial<ProgramMinimums> = {}): ProgramMinimums {
    return { minGpa: 8.0, minIelts: 6.5, highlySelective: false, ...overrides };
}

function student(overrides: Partial<StudentScores> = {}): StudentScores {
    return { gpa: 8.0, ielts: 7.0, ...overrides };
}

describe('getFit: label from the GPA margin', () => {
    it('gives Not yet eligible just below −0.5', () => {
        expect(getFit(student({ gpa: 7.4 }), program()).label).toBe('not_yet_eligible');
    });

    it('gives Reach from −0.5 to 0.5, including below the minimum', () => {
        expect(getFit(student({ gpa: 7.5 }), program()).label).toBe('reach');
        expect(getFit(student({ gpa: 7.7 }), program()).label).toBe('reach');
        expect(getFit(student({ gpa: 8.0 }), program()).label).toBe('reach');
        expect(getFit(student({ gpa: 8.5 }), program()).label).toBe('reach');
    });

    it('gives Match above 0.5 and up to 1.0', () => {
        expect(getFit(student({ gpa: 8.6 }), program()).label).toBe('match');
        expect(getFit(student({ gpa: 9.0 }), program()).label).toBe('match');
    });

    it('gives Safety above 1.0', () => {
        expect(getFit(student({ gpa: 9.1 }), program()).label).toBe('safety');
    });

    it('keeps highly selective programs at Match', () => {
        expect(getFit(student({ gpa: 9.5 }), program({ highlySelective: true })).label).toBe('match');
    });

    it('reports the GPA difference rounded to 0.1', () => {
        const result = getFit(student({ gpa: 7.7 }), program());
        expect(result.gpa).toEqual({ status: 'below', minimum: 8.0, student: 7.7, difference: -0.3 });
    });
});

describe('getFit: English score', () => {
    it('counts a score exactly at the minimum as met', () => {
        const result = getFit(student({ ielts: 6.5 }), program());
        expect(result.english.status).toBe('met');
        expect(result.label).toBe('reach');
    });

    it('gives Not yet eligible below the minimum, even with a Safety GPA', () => {
        const result = getFit(student({ gpa: 9.5, ielts: 6.0 }), program());
        expect(result.english.status).toBe('below');
        expect(result.label).toBe('not_yet_eligible');
    });

    it('takes the label from the GPA when the student has no score yet', () => {
        const result = getFit(student({ gpa: 9.5, ielts: null }), program());
        expect(result.english.status).toBe('missing_score');
        expect(result.label).toBe('safety');
    });
});

describe('getFit: missing minimums', () => {
    it('skips the English check when the program publishes no IELTS minimum', () => {
        const withScore = getFit(student({ gpa: 9.0, ielts: 5.0 }), program({ minIelts: null }));
        expect(withScore.english.status).toBe('no_minimum');
        expect(withScore.label).toBe('match');

        const withoutScore = getFit(student({ gpa: 9.0, ielts: null }), program({ minIelts: null }));
        expect(withoutScore.label).toBe('match');
    });

    it('gives Not rated when the GPA minimum is missing and English is met or missing', () => {
        expect(getFit(student({ ielts: 7.0 }), program({ minGpa: null })).label).toBe('not_rated');
        expect(getFit(student({ ielts: null }), program({ minGpa: null })).label).toBe('not_rated');
    });

    it('gives Not yet eligible when the GPA minimum is missing but English is below the minimum', () => {
        expect(getFit(student({ ielts: 6.0 }), program({ minGpa: null })).label).toBe('not_yet_eligible');
    });

    it('gives Not rated when both minimums are missing', () => {
        const result = getFit(student(), program({ minGpa: null, minIelts: null }));
        expect(result.label).toBe('not_rated');
        expect(result.gpa.status).toBe('no_minimum');
        expect(result.english.status).toBe('no_minimum');
    });
});

describe('getFit: scale "Other" (student GPA null)', () => {
    it('gives Not rated', () => {
        const result = getFit(student({ gpa: null }), program());
        expect(result.gpa.status).toBe('missing_score');
        expect(result.label).toBe('not_rated');
    });

    it('gives Not yet eligible when English is below the minimum', () => {
        expect(getFit(student({ gpa: null, ielts: 6.0 }), program()).label).toBe('not_yet_eligible');
    });
});
