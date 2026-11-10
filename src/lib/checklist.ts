// AI-assisted (Claude): wrote this file from docs/business-rules.md section 6. It reuses getFit's
// requirement checks, so GPA and English use exactly the same conversion and rounding as the fit label.
// AI-assisted (Claude Code): added the not_rated state for a grade that cannot be converted (scale "Other").
// Builds the checklist for one application (screen 12): which requirements are met, which documents
// are attached, how many items are missing, and whether Apply is enabled.
// Returns keys, not display text: screens translate them with t().

import type { FitResult, RequirementCheck } from './fit';

export type TestRequirement = 'none' | 'optional' | 'required';
export type TestType = 'gmat' | 'gre';
export type DocumentKind = 'cv' | 'motivation_letter' | 'reference_letter';

// met: green check
// warning: amber "Below the published minimum", does not block Apply (GPA up to 0.5 below)
// missing: empty dashed circle, counts as an item missing
// no_minimum: "No published minimum" + "Check with the university", never missing
// optional: GMAT/GRE the program accepts but does not require, never missing
// not_rated: the student's grade cannot be converted (scale "Other"), never missing, as "Not rated" in fit.ts
export type RequirementState = 'met' | 'warning' | 'missing' | 'no_minimum' | 'optional' | 'not_rated';

export interface RequirementRow {
    key: 'gpa' | 'english' | 'test';
    state: RequirementState;
    minimum: number | null;
    student: number | null;
    difference: number | null; // student - minimum, rounded to 0.1, as in fit.ts
}

export interface DocumentRow {
    kind: DocumentKind;
    required: number;
    attached: number;
    missing: number; // required - attached, never below 0
}

export type ChecklistState = 'incomplete' | 'ready' | 'applied'; // 12a, 12b, 12c

export interface ChecklistInput {
    fit: FitResult;                   // getFit(student, program), already computed for the program
    testRequired: TestRequirement;    // programs.test_required
    testType: TestType | null;        // profiles.test_type
    testScore: number | null;         // profiles.test_score
    lettersRequired: number;          // programs.letters_required
    attached: Record<DocumentKind, number>; // documents linked to this application, by kind
    submitted: boolean;               // applications.status === 'submitted'
}

export interface Checklist {
    requirements: RequirementRow[];
    documents: DocumentRow[];
    itemsMissing: number;
    itemsTotal: number;
    canApply: boolean;
    state: ChecklistState;
}

const WARNING_FLOOR = -0.5; // same as REACH_MIN in fit.ts

function gpaState(check: RequirementCheck): RequirementState {
    if (check.status === 'no_minimum') return 'no_minimum';
    // Step 1 always saves a grade, so a missing GPA means the scale could not be converted:
    // the student cannot fix it, so it must not block Apply.
    if (check.status === 'missing_score') return 'not_rated';
    if (check.status === 'met') return 'met';
    // below: up to 0.5 under the minimum is a Reach, so warn but let the student apply
    return (check.difference ?? 0) >= WARNING_FLOOR ? 'warning' : 'missing';
}

function englishState(check: RequirementCheck): RequirementState {
    if (check.status === 'no_minimum') return 'no_minimum';
    if (check.status === 'met') return 'met';
    return 'missing'; // below or no IELTS yet: no tolerance on English
}

function fromCheck(key: 'gpa' | 'english', check: RequirementCheck, state: RequirementState): RequirementRow {
    return { key, state, minimum: check.minimum, student: check.student, difference: check.difference };
}

function testRow(input: ChecklistInput): RequirementRow | null {
    if (input.testRequired === 'none') return null;

    // We store no GMAT/GRE minimum, so a score entered by the student is enough.
    const hasScore = input.testType !== null && input.testScore !== null;
    let state: RequirementState;
    if (hasScore) state = 'met';
    else state = input.testRequired === 'required' ? 'missing' : 'optional';

    return { key: 'test', state, minimum: null, student: hasScore ? input.testScore : null, difference: null };
}

function documentRow(kind: DocumentKind, required: number, attached: number): DocumentRow {
    return { kind, required, attached, missing: Math.max(0, required - attached) };
}

export function getChecklist(input: ChecklistInput): Checklist {
    const requirements: RequirementRow[] = [
        fromCheck('gpa', input.fit.gpa, gpaState(input.fit.gpa)),
        fromCheck('english', input.fit.english, englishState(input.fit.english)),
    ];
    const test = testRow(input);
    if (test) requirements.push(test);

    const documents: DocumentRow[] = [
        documentRow('cv', 1, input.attached.cv),
        documentRow('motivation_letter', 1, input.attached.motivation_letter),
    ];
    if (input.lettersRequired > 0) {
        documents.push(documentRow('reference_letter', input.lettersRequired, input.attached.reference_letter));
    }

    // One item per unmet requirement, one per missing document (each missing reference letter counts).
    const missingRequirements = requirements.filter((r) => r.state === 'missing').length;
    const missingDocuments = documents.reduce((sum, d) => sum + d.missing, 0);
    const itemsMissing = missingRequirements + missingDocuments;

    // Rows that can never be missing do not count towards the total.
    const countedRequirements = requirements.filter(
        (r) => r.state !== 'no_minimum' && r.state !== 'optional' && r.state !== 'not_rated',
    ).length;
    const itemsTotal = countedRequirements + documents.reduce((sum, d) => sum + d.required, 0);

    const canApply = itemsMissing === 0;
    let state: ChecklistState;
    if (input.submitted) state = 'applied';
    else state = canApply ? 'ready' : 'incomplete';

    return { requirements, documents, itemsMissing, itemsTotal, canApply, state };
}