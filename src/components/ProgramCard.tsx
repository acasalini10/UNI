// AI-assisted (Claude Code): program card for Programs 3 (opens Program detail 4): badge, names, fit label with a one-line reason, published cost with "≈", deadline.
import { Pressable, StyleSheet, Text, View } from "react-native";

import { countryName } from "@/countries";
import type { ProgramRow } from "@/data/programs";
import { formatMoney } from "@/lib/cost";
import { t } from "@/i18n";
import { locale, monthYear, shortDate } from "@/format";
import { colors, layout, radius, spacing, typography } from "@/theme";

import { FitChip } from "./FitChip";
import { InitialsBadge } from "./InitialsBadge";

// One line that explains the label, built only from the checks fit.ts returned.
export function fitReason(row: ProgramRow): string {
  const { gpa, english, label } = row.fit;
  const parts: string[] = [];
  if (row.highlySelective) parts.push(t("programs.reason.highlySelective"));

  if (english.status === "below") {
    parts.push(t("programs.reason.englishBelow", { min: english.minimum?.toFixed(1), you: english.student?.toFixed(1) }));
  } else if (gpa.status === "no_minimum") {
    parts.push(t("programs.reason.noGpaMinimum"));
  } else if (gpa.status === "missing_score") {
    parts.push(t("programs.reason.noStudentGpa"));
  } else if (gpa.difference !== null && gpa.minimum !== null) {
    const min = gpa.minimum.toFixed(1);
    if (gpa.difference < 0) parts.push(t("programs.reason.gpaBelow", { min }));
    else if (gpa.difference === 0) parts.push(t("programs.reason.gpaAt", { min }));
    else parts.push(t("programs.reason.gpaAbove", { diff: gpa.difference.toFixed(1), min }));
  }

  if (english.status === "met" && label !== "not_yet_eligible") {
    parts.push(t("programs.reason.englishMet", { min: english.minimum?.toFixed(1) }));
  } else if (english.status === "missing_score") {
    parts.push(t("fit.missingIelts"));
  }
  return parts.join(" · ");
}

export function lengthText(months: number): string {
  return months % 12 === 0 && months >= 24
    ? t("programs.card.years", { count: months / 12 })
    : t("programs.card.months", { count: months });
}

export function ProgramCard({ row, showLabel, onPress }: { row: ProgramRow; showLabel: boolean; onPress: () => void }) {
  const { original, converted } = row.cost;
  const costLabel = t(`programs.card.cost.${row.includesFees ? "withFees" : "tuitionOnly"}.${original.unit}`);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${row.program}, ${row.university}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <InitialsBadge initials={row.initials} color={row.brandColor} />
        <View style={styles.names}>
          <Text style={styles.university}>{row.university}</Text>
          <Text style={styles.program}>{row.program}</Text>
          <Text style={styles.meta}>{countryName(row.country)} · {lengthText(row.lengthMonths)}</Text>
        </View>
        {showLabel && <FitChip label={row.fit.label} />}
      </View>
      {showLabel && <Text style={styles.reason}>{fitReason(row)}</Text>}
      <View style={styles.divider} />
      <View style={styles.bottom}>
        <View style={styles.costBox}>
          <Text style={styles.costLabel}>{costLabel}</Text>
          <Text style={styles.price}>{formatMoney(original.amount, original.currency, locale())}</Text>
          {converted && (
            <Text style={styles.converted}>
              {t("programs.card.approx", { amount: formatMoney(converted.amount, converted.currency, locale()), date: shortDate(converted.rateDate) })}
            </Text>
          )}
        </View>
        <Text style={styles.deadline}>
          {row.deadline ? t("programs.card.deadline", { date: monthYear(row.deadline) }) : t("programs.card.noDeadline")}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: layout.cardPadding,
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.8 },
  top: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  names: { flex: 1, gap: spacing.xxs },
  university: { ...typography.caption, color: colors.textMuted },
  program: { ...typography.cardTitle, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  reason: { ...typography.bodySmall, color: colors.textSecondary },
  divider: { height: layout.borderWidth, backgroundColor: colors.border },
  bottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md },
  costBox: { flexShrink: 1, gap: spacing.xxs },
  costLabel: { ...typography.small, color: colors.textMuted },
  price: { ...typography.price, color: colors.text },
  converted: { ...typography.small, color: colors.textMuted },
  deadline: { ...typography.caption, color: colors.textSecondary },
});
