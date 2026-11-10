// AI-assisted (Claude Code): wrote the unit tests for checklist.ts at my request, from the cases in docs/business-rules.md section 6.
/// <reference types="jest" />
import { getChecklist, type ChecklistInput } from './checklist';
import { getFit, type ProgramMinimums, type StudentScores } from './fit';

function input(
    overrides: Partial<ChecklistInput> = {},
    scores: Partial<StudentScores> = {},
    minimums: Partial<ProgramMinimums> = {},
): ChecklistInput {
    const fit = getFit({ gpa: 8.5, ielts: 7.0, ...scores }, { minGpa: 8.0, minIelts: 6.5, highlySelective: false, ...minimums });
    return {
        fit,
        testRequired: 'none',
        testType: null,
        testScore: null,
        lettersRequired: 2,
        attached: { cv: 1, motivation_letter: 1, reference_letter: 2 },
        submitted: false,
        ...overrides,
    };
}

function stateOf(key: 'gpa' | 'english' | 'test', i: ChecklistInput) {
    return getChecklist(i).requirements.find((r) => r.key === key)?.state;
}

describe('getChecklist: GPA', () => {
    it('is met at or above the minimum', () => {
        expect(stateOf('gpa', input({}, { gpa: 8.0 }))).toBe('met');
    });

    it('warns up to 0.5 below the minimum without counting as missing', () => {
        const i = input({}, { gpa: 7.5 });
        expect(stateOf('gpa', i)).toBe('warning');
        expect(getChecklist(i).itemsMissing).toBe(0);
    });

    it('counts as missing more than 0.5 below the minimum', () => {
        const i = input({}, { gpa: 7.4 });
        expect(stateOf('gpa', i)).toBe('missing');
        expect(getChecklist(i).itemsMissing).toBe(1);
    });

    it('shows no_minimum and never counts as missing when the program publishes none', () => {
        const i = input({}, { gpa: 5.0 }, { minGpa: null });
        expect(stateOf('gpa', i)).toBe('no_minimum');
        expect(getChecklist(i).itemsMissing).toBe(0);
    });

    it('is not_rated and does not block Apply when the grade cannot be converted (scale Other)', () => {
        const i = input({}, { gpa: null });
        expect(stateOf('gpa', i)).toBe('not_rated');
        expect(getChecklist(i).canApply).toBe(true);
    });
});

describe('getChecklist: English', () => {
    it('counts as missing below the minimum, with no tolerance', () => {
        expect(stateOf('english', input({}, { ielts: 6.0 }))).toBe('missing');
    });

    it('counts as missing when the student has no IELTS yet', () => {
        expect(stateOf('english', input({}, { ielts: null }))).toBe('missing');
    });

    it('never counts as missing when the program publishes no minimum', () => {
        expect(stateOf('english', input({}, { ielts: null }, { minIelts: null }))).toBe('no_minimum');
    });
});

describe('getChecklist: GMAT/GRE', () => {
    it('is not listed when the program does not ask for it', () => {
        expect(stateOf('test', input())).toBeUndefined();
    });

    it('is met by any entered score, since no minimum is stored', () => {
        expect(stateOf('test', input({ testRequired: 'required', testType: 'gmat', testScore: 605 }))).toBe('met');
    });

    it('counts as missing when required and no score is entered', () => {
        expect(stateOf('test', input({ testRequired: 'required' }))).toBe('missing');
    });

    it('is optional, never missing, when the program only accepts it', () => {
        const i = input({ testRequired: 'optional' });
        expect(stateOf('test', i)).toBe('optional');
        expect(getChecklist(i).itemsMissing).toBe(0);
    });
});

describe('getChecklist: documents and totals', () => {
    it('counts each missing reference letter as one item', () => {
        const c = getChecklist(input({ attached: { cv: 0, motivation_letter: 1, reference_letter: 0 } }));
        expect(c.itemsMissing).toBe(3);
        expect(c.documents.find((d) => d.kind === 'reference_letter')?.missing).toBe(2);
    });

    it('never gives a negative missing count when more letters are attached than required', () => {
        const c = getChecklist(input({ attached: { cv: 1, motivation_letter: 1, reference_letter: 3 } }));
        expect(c.documents.find((d) => d.kind === 'reference_letter')?.missing).toBe(0);
    });

    it('leaves out the reference letters row when none are required', () => {
        const c = getChecklist(input({ lettersRequired: 0 }));
        expect(c.documents.map((d) => d.kind)).toEqual(['cv', 'motivation_letter']);
    });

    it('adds unmet requirements and missing documents together', () => {
        const c = getChecklist(input({ attached: { cv: 0, motivation_letter: 1, reference_letter: 2 } }, { ielts: null }));
        expect(c.itemsMissing).toBe(2);
    });

    it('leaves rows that can never be missing out of the total', () => {
        // GPA no minimum, English met, test optional: 1 requirement + 4 documents.
        const c = getChecklist(input({ testRequired: 'optional' }, {}, { minGpa: null }));
        expect(c.itemsTotal).toBe(5);
    });
});

describe('getChecklist: state and Apply', () => {
    it('is incomplete with Apply disabled while an item is missing', () => {
        const c = getChecklist(input({ attached: { cv: 0, motivation_letter: 1, reference_letter: 2 } }));
        expect(c.state).toBe('incomplete');
        expect(c.canApply).toBe(false);
    });

    it('is ready with Apply enabled at 0 items missing', () => {
        const c = getChecklist(input());
        expect(c.state).toBe('ready');
        expect(c.canApply).toBe(true);
    });

    it('is applied once the student marks it submitted, whatever is missing', () => {
        expect(getChecklist(input({ submitted: true, attached: { cv: 0, motivation_letter: 0, reference_letter: 0 } })).state).toBe('applied');
    });
});
