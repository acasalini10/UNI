// AI-assisted (Claude Code): display text shared by Careers 8 and the careers preview on Program detail 4.
import type { EmploymentBlock } from "@/data/careerBlocks";
import { locale } from "@/format";
import { t } from "@/i18n";

// "95.5%" with the active language's decimal separator; whole numbers stay whole.
export function percent(value: number): string {
  return `${new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(value)}%`;
}

// "employed within 3 months", or just "employed" when the report gives no timeframe.
export function employmentText(block: EmploymentBlock): string {
  return block.months === null ? t("careers.employment.employed") : t("careers.employment.withinMonths", { count: block.months });
}
