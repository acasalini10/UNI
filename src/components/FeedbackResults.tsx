// AI-assisted (Claude Code): Feedback results 6: the documents checked, the program, every issue with its priority badge, and "Upload a new version" back to 6a.
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { FeedbackRound } from "@/data/feedback";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

const badge = {
  fix_first: { bg: colors.primaryTint, fg: colors.warningText },
  improve: { bg: colors.accentTint, fg: colors.link },
} as const;

export function FeedbackResults({ round, onNewVersion }: { round: FeedbackRound; onNewVersion: () => void }) {
  const documents = [
    { key: "cv", title: t("feedback.documents.cv"), file: round.cvFileName },
    { key: "statement", title: t("feedback.documents.statement"), file: round.statementFileName },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        {round.program && round.university
          ? t("feedback.results.subtitle", { program: round.program, university: round.university })
          : t("feedback.results.subtitleNoProgram")}
      </Text>

      <View style={styles.docs}>
        {documents.map((doc) => (
          <View key={doc.key} style={styles.docCard}>
            <View style={styles.check}>
              <SymbolView name="checkmark" tintColor={colors.successText} size={18} />
            </View>
            <Text style={styles.docTitle}>{doc.title}</Text>
            <Text style={styles.meta} numberOfLines={1}>{doc.file ?? t("feedback.results.fileRemoved")}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {round.issues.length > 0 ? t("feedback.results.issues", { count: round.issues.length }) : t("feedback.results.noIssues")}
        </Text>
        {round.issues.map((issue, index) => (
          <View key={index} style={[styles.issue, index > 0 && styles.divider]}>
            <View style={[styles.badge, { backgroundColor: badge[issue.priority].bg }]}>
              <Text style={[styles.badgeText, { color: badge[issue.priority].fg }]}>{t(`feedback.priority.${issue.priority}`)}</Text>
            </View>
            <Text style={styles.issueText}>{issue.text}</Text>
          </View>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={onNewVersion} style={({ pressed }) => [styles.outline, pressed && styles.pressed]}>
        <SymbolView name="arrow.up.to.line" tintColor={colors.link} size={18} />
        <Text style={styles.outlineText}>{t("feedback.results.newVersion")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  subtitle: { ...typography.body, color: colors.textMuted },
  docs: { flexDirection: "row", gap: spacing.md },
  docCard: {
    flex: 1,
    gap: spacing.sm,
    padding: layout.cardPadding,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  check: {
    width: sizes.iconTile,
    height: sizes.iconTile,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.successTint,
  },
  docTitle: { ...typography.bodyStrong, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  card: {
    padding: layout.cardPadding,
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { ...typography.cardTitle, color: colors.text },
  issue: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, paddingTop: spacing.sm },
  divider: { borderTopWidth: layout.borderWidth, borderTopColor: colors.border, paddingTop: spacing.md },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  badgeText: { ...typography.chip },
  issueText: { ...typography.body, color: colors.text, flex: 1 },
  outline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: sizes.button,
    borderRadius: radius.lg,
    borderWidth: layout.borderWidth,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  outlineText: { ...typography.button, color: colors.link },
  pressed: { opacity: 0.8 },
});
