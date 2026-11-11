// AI-assisted (Claude Code): Feedback tab: start 6a (program from Applications or preselected from Program detail 4, CV and motivational letter through sheet 12d, AI consent) and results 6 (latest round); replaces the title-only tab.
import { SymbolView } from "expo-symbols";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { FeedbackResults } from "@/components/FeedbackResults";
import { FilePickerSheet } from "@/components/FilePickerSheet";
import { Logo } from "@/components/Logo";
import { FormError } from "@/components/Message";
import { listApplications, type Application } from "@/data/applications";
import { listDocuments, type UserDocument } from "@/data/documents";
import { getLatestRound, requestFeedback, setAiConsent, type FeedbackError, type FeedbackRound } from "@/data/feedback";
import { getProfile } from "@/data/profile";
import { getProgram } from "@/data/programs";
import { t } from "@/i18n";
import { openLegalPage } from "@/legal";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

type Slot = "cv" | "statement";
const slotKind = { cv: "cv", statement: "motivation_letter" } as const;

type ProgramChoice = { programId: string; program: string; university: string };

export default function Feedback() {
  // "Get feedback on my application" on Program detail 4 opens this tab with ?programId= (flows.md §4).
  const params = useLocalSearchParams<{ programId?: string }>();
  const fromDetailId = useRef<string | null>(null);
  const [fromDetail, setFromDetail] = useState<ProgramChoice | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<"offline" | "unknown" | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [consent, setConsent] = useState(false);
  const [round, setRound] = useState<FeedbackRound | null>(null);
  const [showStart, setShowStart] = useState(false); // true after "Upload a new version" on 6

  const [programId, setProgramId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<Slot, string | null>>({ cv: null, statement: null });
  const [picking, setPicking] = useState<Slot | null>(null);
  const [choosingProgram, setChoosingProgram] = useState(false);
  const [savingConsent, setSavingConsent] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<FeedbackError | "consent" | null>(null);

  // Reload on focus: the student may have added an application or a file in another tab meanwhile.
  const load = useCallback(() => {
    let active = true;
    void Promise.all([listApplications(), listDocuments(), getProfile(), getLatestRound()]).then(([apps, docs, profile, latest]) => {
      if (!active) return;
      const failed = [apps, docs, profile, latest].find((r) => !r.ok);
      if (failed && !failed.ok) {
        setLoadError(failed.error === "offline" ? "offline" : "unknown");
        return;
      }
      if (!apps.ok || !docs.ok || !profile.ok || !latest.ok) return;
      setLoadError(null);
      setApplications(apps.data);
      setDocuments(docs.data);
      setConsent(profile.data.ai_consent);
      setRound(latest.data);
      // Keep the student's choices; fill only what is still empty or no longer exists.
      setProgramId((current) =>
        current && (apps.data.some((a) => a.programId === current) || current === fromDetailId.current)
          ? current
          : latest.data?.programId && apps.data.some((a) => a.programId === latest.data!.programId)
            ? latest.data.programId
            : apps.data[0]?.programId ?? null,
      );
      setSelected((current) => {
        const pick = (slot: Slot, fromRound: string | null | undefined) => {
          const ofKind = docs.data.filter((d) => d.kind === slotKind[slot]);
          if (current[slot] && ofKind.some((d) => d.id === current[slot])) return current[slot];
          if (fromRound && ofKind.some((d) => d.id === fromRound)) return fromRound;
          return ofKind[0]?.id ?? null; // newest
        };
        return { cv: pick("cv", latest.data?.cvDocumentId), statement: pick("statement", latest.data?.statementDocumentId) };
      });
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);
  useFocusEffect(load);

  // A program opened from detail is preselected even when it is not in Applications (decision 2026-11-11):
  // it is listed first in the picker, and nothing is added to Applications behind the student's back.
  // The choice is applied during render when the param changes (React's pattern for state derived from a prop);
  // the effect below only loads the program's name and clears the param.
  const paramId = params.programId ?? null;
  const [handledParam, setHandledParam] = useState<string | null>(null);
  if (paramId !== handledParam) {
    setHandledParam(paramId);
    if (paramId) {
      setProgramId(paramId);
      setShowStart(true);
      setError(null);
    }
  }
  useEffect(() => {
    if (!paramId) return;
    fromDetailId.current = paramId;
    // Cleared so the next tap on the same button sets it again. No cancel flag: clearing re-runs this effect.
    router.setParams({ programId: undefined });
    void getProgram(paramId).then((result) => {
      if (result.ok) setFromDetail({ programId: result.data.id, program: result.data.program, university: result.data.universities.name });
    });
  }, [paramId]);

  const choices: ProgramChoice[] = [
    ...(fromDetail && !applications.some((a) => a.programId === fromDetail.programId) ? [fromDetail] : []),
    ...applications.map(({ programId: id, program: name, university }) => ({ programId: id, program: name, university })),
  ];
  const program = choices.find((c) => c.programId === programId) ?? null;
  const notSaved = program !== null && !applications.some((a) => a.programId === program.programId);
  const fileOf = (slot: Slot) => documents.find((d) => d.id === selected[slot]) ?? null;

  async function toggleConsent() {
    const next = !consent;
    setError(null);
    setSavingConsent(true);
    const result = await setAiConsent(next);
    setSavingConsent(false);
    if (!result.ok) return setError("consent");
    setConsent(next);
  }

  async function run() {
    if (!programId || !selected.cv || !selected.statement) return;
    setError(null);
    setRunning(true);
    const result = await requestFeedback({ programId, cvDocumentId: selected.cv, statementDocumentId: selected.statement });
    setRunning(false);
    if (!result.ok) {
      if (result.error === "consent_required") setConsent(false);
      return setError(result.error);
    }
    setRound({
      ...result.data,
      programId,
      program: program?.program ?? null,
      university: program?.university ?? null,
      cvDocumentId: selected.cv,
      cvFileName: fileOf("cv")?.file_name ?? null,
      statementDocumentId: selected.statement,
      statementFileName: fileOf("statement")?.file_name ?? null,
    });
    setShowStart(false);
  }

  if (!loaded || loadError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          {loadError ? (
            <>
              <Text style={styles.stateTitle}>{t(`errors.${loadError}`)}</Text>
              <Button label={t("programs.retry")} onPress={() => { setLoadError(null); load(); }} />
            </>
          ) : (
            <ActivityIndicator color={colors.textMuted} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Claude reads both PDFs: 15 to 30 seconds (flows.md §6a).
  if (running) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateTitle}>{t("feedback.loading.title")}</Text>
          <Text style={styles.stateText}>{t("feedback.loading.body")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const results = round && !showStart;
  const missing = [
    !program && t("feedback.missing.program"),
    !selected.cv && t("feedback.missing.cv"),
    !selected.statement && t("feedback.missing.statement"),
    !consent && t("feedback.missing.consent"),
  ].filter(Boolean) as string[];

  const errorText =
    error === null
      ? null
      : error === "consent"
        ? t("feedback.errors.consent")
        : error === "offline" || error === "unknown"
          ? t(`errors.${error}`)
          : t(`feedback.errors.${error}`);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><Logo withName /></View>
        <Text style={styles.title} accessibilityRole="header">{t("feedback.title")}</Text>

        {results ? (
          <FeedbackResults
            round={round}
            onNewVersion={() => {
              setError(null);
              setShowStart(true);
            }}
          />
        ) : (
          <>
            <Text style={styles.subtitle}>{t("feedback.subtitle")}</Text>

            <StepTitle n={1} text={t("feedback.step1.title")} />
            {program ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityHint={t("feedback.step1.choose")}
                  onPress={() => setChoosingProgram(true)}
                  style={({ pressed }) => [styles.select, pressed && styles.pressed]}
                >
                  <Text style={styles.selectText} numberOfLines={1}>{`${program.university} · ${program.program}`}</Text>
                  <SymbolView name="chevron.down" tintColor={colors.textSecondary} size={16} />
                </Pressable>
                <Text style={styles.meta}>{t(notSaved ? "feedback.step1.fromDetail" : "feedback.step1.hint")}</Text>
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.meta}>{t("feedback.step1.empty")}</Text>
                <Pressable accessibilityRole="button" onPress={() => router.push("/add-university")} hitSlop={spacing.sm}>
                  <Text style={styles.link}>{t("feedback.step1.add")}</Text>
                </Pressable>
              </View>
            )}

            <StepTitle n={2} text={t("feedback.step2.title")} />
            {(["cv", "statement"] as const).map((slot) => {
              const file = fileOf(slot);
              return (
                <View key={slot} style={styles.docCard}>
                  {file ? (
                    <View style={styles.check}>
                      <SymbolView name="checkmark" tintColor={colors.successText} size={18} />
                    </View>
                  ) : (
                    <View style={styles.dashed} />
                  )}
                  <View style={styles.flex}>
                    <Text style={styles.docTitle}>{t(`feedback.documents.${slot}`)}</Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {file ? t("feedback.step2.fromProfile", { name: file.file_name }) : t("feedback.step2.missing")}
                    </Text>
                  </View>
                  {file ? (
                    <Pressable accessibilityRole="button" onPress={() => setPicking(slot)} hitSlop={spacing.md}>
                      <Text style={styles.change}>{t("common.change")}</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setPicking(slot)}
                      style={({ pressed }) => [styles.uploadPill, pressed && styles.pressed]}
                    >
                      <SymbolView name="arrow.up.to.line" tintColor={colors.link} size={16} />
                      <Text style={styles.uploadText}>{t("profile.my.documents.upload")}</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
            <Text style={styles.meta}>{t("feedback.step2.hint")}</Text>

            <View style={styles.consentCard}>
              <StepTitle n={3} text={t("feedback.step3.title")} />
              <Text style={styles.body}>{t("feedback.step3.body")}</Text>
              <Pressable accessibilityRole="link" onPress={() => void openLegalPage("privacy")} hitSlop={spacing.sm}>
                <Text style={styles.link}>{t("feedback.step3.link")}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: consent, busy: savingConsent }}
                disabled={savingConsent}
                onPress={() => void toggleConsent()}
                style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}
              >
                <View style={[styles.checkbox, consent && styles.checkboxOn]}>
                  {savingConsent ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    consent && <SymbolView name="checkmark" tintColor={colors.white} size={16} />
                  )}
                </View>
                <Text style={styles.checkboxText}>{t("feedback.step3.agree")}</Text>
              </Pressable>
              <Text style={styles.meta}>{t("feedback.step3.once")}</Text>
            </View>

            {errorText && <FormError text={errorText} />}

            <View style={styles.footer}>
              <Button label={t("feedback.get")} onPress={() => void run()} disabled={missing.length > 0} />
              {missing.length > 0 && <Text style={styles.footerHint}>{t("feedback.missing.prefix", { items: missing.join(", ") })}</Text>}
            </View>
          </>
        )}
      </ScrollView>

      <FilePickerSheet
        kind={picking ? slotKind[picking] : null}
        subtitle={program ? t("checklist.picker.for", { university: program.university, program: program.program }) : t("feedback.title")}
        documents={documents.filter((d) => picking && d.kind === slotKind[picking])}
        onUploaded={(document) => setDocuments((current) => [document, ...current])}
        onUse={async (document) => {
          if (picking) setSelected((current) => ({ ...current, [picking]: document.id }));
          setPicking(null);
          return true;
        }}
        onClose={() => setPicking(null)}
      />

      <Modal visible={choosingProgram} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setChoosingProgram(false)}>
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={1}>{t("feedback.step1.title")}</Text>
            <Pressable accessibilityRole="button" onPress={() => setChoosingProgram(false)} hitSlop={spacing.md}>
              <Text style={styles.change}>{t("countryPicker.done")}</Text>
            </Pressable>
          </View>
          <ScrollView>
            {choices.map((a) => {
              const isSelected = a.programId === programId;
              return (
                <Pressable
                  key={a.programId}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setProgramId(a.programId);
                    setChoosingProgram(false);
                  }}
                  style={({ pressed }) => [styles.sheetRow, pressed && styles.pressed]}
                >
                  <View style={styles.flex}>
                    <Text style={[styles.docTitle, isSelected && styles.selectedText]}>{a.program}</Text>
                    <Text style={styles.meta}>{a.university}</Text>
                  </View>
                  {isSelected && <SymbolView name="checkmark" tintColor={colors.link} size={sizes.icon} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function StepTitle({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{n}</Text>
      </View>
      <Text style={styles.stepTitle} accessibilityRole="header">{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: layout.screenPaddingX, paddingBottom: layout.screenPaddingBottom, gap: spacing.md },
  topBar: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  body: { ...typography.body, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  link: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  change: { ...typography.bodyStrong, color: colors.link },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
  stateText: { ...typography.bodySmall, color: colors.textMuted, textAlign: "center" },
  pressed: { opacity: 0.8 },
  step: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  stepNumberText: { ...typography.chip, color: colors.white },
  stepTitle: { ...typography.cardTitle, color: colors.text, flex: 1 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: sizes.input,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectText: { ...typography.bodyStrong, color: colors.text, flex: 1 },
  emptyCard: {
    gap: spacing.sm,
    padding: layout.cardPadding,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderStyle: "dashed",
    borderColor: colors.borderDashed,
  },
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
  check: {
    width: sizes.iconTile,
    height: sizes.iconTile,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.successTint,
  },
  dashed: { width: sizes.iconTile, height: sizes.iconTile, borderRadius: radius.sm, borderWidth: 2, borderStyle: "dashed", borderColor: colors.control },
  docTitle: { ...typography.bodyStrong, color: colors.text },
  selectedText: { color: colors.link },
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
  consentCard: {
    gap: spacing.md,
    marginTop: spacing.sm,
    padding: layout.cardPadding,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.infoBannerBorder,
    backgroundColor: colors.surface,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.control,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkboxText: { ...typography.bodyStrong, color: colors.text, flex: 1 },
  footer: { gap: spacing.sm, marginTop: spacing.md },
  footerHint: { ...typography.bodySmall, color: colors.textMuted, textAlign: "center" },
  sheet: { flex: 1, backgroundColor: colors.bg },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  sheetTitle: { ...typography.sheetTitle, color: colors.text, flex: 1 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    minHeight: sizes.touchTarget,
    borderBottomWidth: layout.borderWidth,
    borderBottomColor: colors.border,
  },
});
