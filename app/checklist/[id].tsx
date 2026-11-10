// AI-assisted (Claude Code): Checklist 12 (12a incomplete, 12b ready, 12c applied): status and deadline chips, requirements vs you and documents from getChecklist, Upload opens sheet 12d, Apply opens the official page, "I've submitted my application" after a confirm.
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { FilePickerSheet } from "@/components/FilePickerSheet";
import { InitialsBadge } from "@/components/InitialsBadge";
import { countryName } from "@/countries";
import { attachDocument, getApplication, markSubmitted, type ApplicationDetail } from "@/data/applications";
import { documentKinds, listDocuments, type DocumentKind, type UserDocument } from "@/data/documents";
import { getProfile, type Profile } from "@/data/profile";
import { toRows } from "@/data/programs";
import { getChecklist, type DocumentRow, type RequirementRow, type RequirementState, type TestRequirement, type TestType } from "@/lib/checklist";
import { daysUntil, shortDate } from "@/format";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

type LoadError = "offline" | "unknown" | "not_found";

const stateIcon: Record<Exclude<RequirementState, "missing">, { name: SymbolViewProps["name"]; color: string }> = {
  met: { name: "checkmark.circle.fill", color: colors.success },
  warning: { name: "exclamationmark.circle.fill", color: colors.warningText },
  no_minimum: { name: "questionmark.circle", color: colors.textMuted },
  optional: { name: "minus.circle", color: colors.textMuted },
  not_rated: { name: "questionmark.circle", color: colors.textMuted },
};

const documentIcon: Record<DocumentKind, { name: SymbolViewProps["name"]; color: string; bg: string }> = {
  cv: { name: "doc.text", color: colors.link, bg: colors.accentTint },
  motivation_letter: { name: "pencil", color: colors.primary, bg: colors.primaryTint },
  reference_letter: { name: "envelope", color: colors.successText, bg: colors.successTint },
};

// submitted_at is a timestamp: show the student's own calendar day.
function localDay(timestamp: string): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Checklist() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [error, setError] = useState<LoadError | null>(null);
  const [picking, setPicking] = useState<DocumentKind | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reload on focus (the student may have added a score or a file in My Profile meanwhile) and on "Try again".
  const load = useCallback(() => {
    let active = true;
    void Promise.all([getApplication(id), getProfile(), listDocuments()]).then(([appResult, profileResult, docsResult]) => {
      if (!active) return;
      if (!appResult.ok) return setError(appResult.error);
      if (!profileResult.ok) return setError(profileResult.error);
      if (!docsResult.ok) return setError(docsResult.error === "offline" ? "offline" : "unknown");
      setError(null);
      setApplication(appResult.data);
      setProfile(profileResult.data);
      setDocuments(docsResult.data);
    });
    return () => {
      active = false;
    };
  }, [id]);
  useFocusEffect(load);

  const backButton = (
    <Pressable accessibilityRole="button" accessibilityLabel={t("common.back")} onPress={() => router.back()} style={styles.circle}>
      <SymbolView name="chevron.left" tintColor={colors.text} size={sizes.icon} />
    </Pressable>
  );

  if (error || !application || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.bar}>{backButton}</View>
        <View style={styles.center}>
          {error ? (
            <>
              <Text style={styles.stateTitle}>{error === "not_found" ? t("checklist.notFound") : t(`errors.${error}`)}</Text>
              {error !== "not_found" && (
                <Button
                  label={t("programs.retry")}
                  onPress={() => {
                    setError(null);
                    load();
                  }}
                />
              )}
            </>
          ) : (
            <ActivityIndicator color={colors.textMuted} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const program = application.program;
  const row = toRows([program], profile)[0];
  const attachedIds = new Set(application.attached.map((d) => d.id));
  const attachedCount = Object.fromEntries(
    documentKinds.map((kind) => [kind, application.attached.filter((d) => d.kind === kind).length]),
  ) as Record<DocumentKind, number>;
  const checklist = getChecklist({
    fit: row.fit,
    testRequired: program.test_required as TestRequirement,
    testType: profile.test_type as TestType | null,
    testScore: profile.test_score,
    lettersRequired: program.letters_required,
    attached: attachedCount,
    submitted: application.status === "submitted",
  });
  const days = program.deadline ? daysUntil(program.deadline) : null;
  const applied = checklist.state === "applied";

  function latestAttached(kind: DocumentKind): UserDocument | undefined {
    return application!.attached.find((d) => d.kind === kind);
  }

  async function use(document: UserDocument): Promise<boolean> {
    const result = await attachDocument(application!, document.id);
    if (!result.ok) return false;
    setApplication((current) => current && { ...current, status: result.data, attached: [document, ...current.attached] });
    setPicking(null);
    return true;
  }

  function openApply() {
    void WebBrowser.openBrowserAsync(program.official_url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
  }

  function confirmSubmitted() {
    Alert.alert(t("checklist.submit.confirmTitle"), t("checklist.submit.confirmBody"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("checklist.submit.confirm"), onPress: () => void submit() },
    ]);
  }

  async function submit() {
    setSubmitting(true);
    const result = await markSubmitted(application!.id);
    setSubmitting(false);
    if (!result.ok) return Alert.alert(t("checklist.submit.failed"));
    setApplication((current) => current && { ...current, status: "submitted", submittedAt: result.data });
  }

  const statusChip =
    checklist.state === "applied"
      ? { text: t("checklist.chip.applied"), fg: colors.successText, bg: colors.successTint }
      : checklist.state === "ready"
        ? { text: t("checklist.chip.ready"), fg: colors.link, bg: colors.accentTint }
        : {
            text: `${t(`applications.status.${application.status}`)} · ${t("checklist.itemsMissing", { count: checklist.itemsMissing })}`,
            fg: application.status === "saved" ? colors.textSecondary : colors.warningText,
            bg: application.status === "saved" ? colors.neutralTint : colors.primaryTint,
          };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.bar}>{backButton}</View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <InitialsBadge initials={row.initials} color={row.brandColor} />
          <View style={styles.flex}>
            <Text style={styles.title} accessibilityRole="header">{program.program}</Text>
            <Text style={styles.meta}>
              {program.universities.name} · {program.universities.city}, {countryName(program.universities.country)}
            </Text>
          </View>
        </View>

        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: statusChip.bg }]}>
            <Text style={[styles.chipText, { color: statusChip.fg }]}>{statusChip.text}</Text>
          </View>
          <View style={[styles.chip, styles.chipOutline]}>
            <Text style={[styles.chipText, styles.chipOutlineText]}>
              {program.deadline
                ? `${t("checklist.deadline", { date: shortDate(program.deadline) })} · ${
                    days !== null && days >= 0 ? t("programDetail.application.daysLeft", { count: days }) : t("programDetail.application.closed")
                  }`
                : t("checklist.noDeadline")}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("programDetail.vsYou.title")}</Text>
          {checklist.requirements.map((requirement) => (
            <RequirementLine key={requirement.key} requirement={requirement} profile={profile} testRequired={program.test_required as TestRequirement} />
          ))}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{t("checklist.note", { university: program.universities.name })}</Text>
          </View>
        </View>

        <Text style={styles.overline}>{t("checklist.documents")}</Text>
        {checklist.documents.map((document) => (
          <DocumentLine
            key={document.kind}
            document={document}
            latest={latestAttached(document.kind)}
            canUpload={!applied}
            onUpload={() => setPicking(document.kind)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {checklist.state === "incomplete" && (
          <>
            <Button label={t("checklist.apply")} onPress={() => undefined} disabled />
            <Text style={styles.footerText}>{t("checklist.itemsMissing", { count: checklist.itemsMissing })}</Text>
          </>
        )}
        {checklist.state === "ready" && (
          <>
            <Button label={t("checklist.applyOnSite")} onPress={openApply} />
            <Text style={styles.footerHint}>{t("checklist.applyHint")}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={confirmSubmitted}
              disabled={submitting}
              style={styles.submitted}
              hitSlop={spacing.sm}
            >
              {submitting ? (
                <ActivityIndicator color={colors.link} />
              ) : (
                <>
                  <SymbolView name="checkmark" tintColor={colors.link} size={16} />
                  <Text style={styles.link}>{t("checklist.submit.button")}</Text>
                </>
              )}
            </Pressable>
          </>
        )}
        {applied && (
          <>
            <View style={styles.appliedBox} accessibilityRole="text">
              <SymbolView name="checkmark" tintColor={colors.successText} size={sizes.icon} />
              <Text style={styles.appliedText}>{t("checklist.chip.applied")}</Text>
            </View>
            {application.submittedAt && (
              <Text style={styles.footerHint}>{t("checklist.submittedOn", { date: shortDate(localDay(application.submittedAt)) })}</Text>
            )}
          </>
        )}
      </View>

      <FilePickerSheet
        kind={picking}
        subtitle={t("checklist.picker.for", { university: program.universities.name, program: program.program })}
        documents={documents.filter((d) => d.kind === picking && !attachedIds.has(d.id))}
        onUploaded={(document) => setDocuments((current) => [document, ...current])}
        onUse={use}
        onClose={() => setPicking(null)}
      />
    </SafeAreaView>
  );
}

function RequirementLine({ requirement, profile, testRequired }: { requirement: RequirementRow; profile: Profile; testRequired: TestRequirement }) {
  const { key, state, minimum, student, difference } = requirement;
  const notAdded = t("checklist.notAdded");

  let title: string;
  let detail: string;
  let hint: string | undefined;
  let value: string;
  if (key === "gpa") {
    title = t("programDetail.vsYou.gpa");
    detail = minimum !== null ? t("programDetail.vsYou.gpaMinimum", { min: minimum.toFixed(1) }) : t("fit.noMinimum");
    value =
      student === null
        ? t("programDetail.vsYou.notConverted")
        : difference !== null
          ? `${student.toFixed(1)} (${difference >= 0 ? "+" : ""}${difference.toFixed(1)})`
          : student.toFixed(1);
  } else if (key === "english") {
    title = t("programDetail.vsYou.english");
    detail = minimum !== null ? t("programDetail.vsYou.ieltsMinimum", { min: minimum.toFixed(1) }) : t("fit.noMinimum");
    value = student === null ? t("fit.missingIelts") : student.toFixed(1);
  } else {
    title = t("checklist.test.title");
    detail = t(`checklist.test.${testRequired}`);
    value = student !== null && profile.test_type ? `${t(`profile.tests.${profile.test_type}`)} ${student}` : notAdded;
  }
  if (state === "no_minimum") hint = t("fit.checkWithUniversity");
  if (state === "warning") hint = t("checklist.belowMinimum");
  if (state === "not_rated") hint = t("checklist.notRated");

  const icon = state === "missing" ? null : stateIcon[state];
  const valueColor = state === "missing" ? colors.textMuted : state === "met" ? colors.successText : state === "warning" ? colors.warningText : colors.text;

  return (
    <View style={styles.reqRow}>
      {icon ? <SymbolView name={icon.name} tintColor={icon.color} size={28} /> : <View style={styles.dashed} />}
      <View style={styles.flex}>
        <Text style={styles.reqTitle}>{title}</Text>
        <Text style={styles.meta}>{detail}</Text>
        {hint && <Text style={[styles.small, state === "warning" && styles.warning]}>{hint}</Text>}
      </View>
      <Text style={[styles.reqValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function DocumentLine({
  document,
  latest,
  canUpload,
  onUpload,
}: {
  document: DocumentRow;
  latest: UserDocument | undefined;
  canUpload: boolean;
  onUpload: () => void;
}) {
  const icon = documentIcon[document.kind];
  const done = document.missing === 0;
  const isLetters = document.kind === "reference_letter";
  const subtitle = isLetters
    ? t("checklist.lettersAttached", { attached: Math.min(document.attached, document.required), required: document.required })
    : done
      ? latest?.file_name ?? ""
      : t("checklist.required");
  const title = t(`checklist.kinds.${document.kind}`);

  return (
    <View style={styles.docCard}>
      <View style={[styles.docIcon, { backgroundColor: icon.bg }]}>
        <SymbolView name={icon.name} tintColor={icon.color} size={sizes.icon} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.reqTitle}>
          {title}
          {isLetters && (
            <Text style={{ color: done ? colors.successText : colors.warningText }}>
              {` ${Math.min(document.attached, document.required)}/${document.required}`}
            </Text>
          )}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>{subtitle}</Text>
      </View>
      {done ? (
        <View style={styles.ready}>
          <SymbolView name="checkmark" tintColor={colors.successText} size={16} />
          <Text style={styles.readyText}>{t("profile.my.documents.ready")}</Text>
        </View>
      ) : (
        canUpload && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.my.documents.uploadKind", { kind: title })}
            onPress={onUpload}
            style={({ pressed }) => [styles.uploadPill, pressed && styles.pressed]}
          >
            <SymbolView name="arrow.up.to.line" tintColor={colors.link} size={16} />
            <Text style={styles.uploadText}>{t("profile.my.documents.upload")}</Text>
          </Pressable>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: layout.screenPaddingX, paddingVertical: spacing.sm },
  circle: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
  content: { paddingHorizontal: layout.screenPaddingX, paddingBottom: spacing.xxl, gap: spacing.md },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  title: { ...typography.display, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  small: { ...typography.small, color: colors.textMuted },
  warning: { color: colors.warningText },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill },
  chipText: { ...typography.chip },
  chipOutline: { borderWidth: layout.borderWidth, borderColor: colors.borderStrong },
  chipOutlineText: { color: colors.textSecondary },
  card: {
    padding: layout.cardPadding,
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { ...typography.cardTitle, color: colors.text },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: layout.borderWidth,
    borderTopColor: colors.border,
  },
  dashed: { width: 28, height: 28, borderRadius: radius.pill, borderWidth: 2, borderStyle: "dashed", borderColor: colors.control },
  reqTitle: { ...typography.bodyStrong, color: colors.text },
  reqValue: { ...typography.bodyStrong, textAlign: "right", maxWidth: "40%" },
  noteBox: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceSunken },
  noteText: { ...typography.bodySmall, color: colors.textSecondary },
  overline: { ...typography.overline, color: colors.textMuted, marginTop: spacing.md },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: layout.cardPadding,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  docIcon: { width: sizes.iconTile, height: sizes.iconTile, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  ready: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  readyText: { ...typography.bodyStrong, color: colors.successText },
  uploadPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  uploadText: { ...typography.bodyStrong, color: colors.link },
  pressed: { opacity: 0.8 },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: layout.borderWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  footerText: { ...typography.bodyStrong, color: colors.textSecondary, textAlign: "center" },
  footerHint: { ...typography.bodySmall, color: colors.textMuted, textAlign: "center" },
  submitted: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, minHeight: sizes.touchTarget },
  link: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  appliedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: sizes.button,
    borderRadius: radius.lg,
    borderWidth: layout.borderWidth,
    borderColor: colors.success,
    backgroundColor: colors.successTint,
  },
  appliedText: { ...typography.button, color: colors.successText },
});
