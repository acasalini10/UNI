// AI-assisted (Copilot): added the title-only Applications tab screen.
// AI-assisted (Claude Code): Applications 5a/5b/11: counters, one card per saved program with status (opens its Checklist 12), empty state, "Added" banner with Undo and the new card highlighted; loading and offline states.
import { SymbolView } from "expo-symbols";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { InitialsBadge } from "@/components/InitialsBadge";
import { Logo } from "@/components/Logo";
import { FormError } from "@/components/Message";
import {
  counters,
  listApplications,
  removeApplication,
  takeJustAdded,
  type Application,
  type ApplicationStatus,
  type DataError,
} from "@/data/applications";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

const statusColor: Record<ApplicationStatus, string> = {
  saved: colors.textMuted,
  in_progress: colors.warningText,
  submitted: colors.successText,
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<DataError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [added, setAdded] = useState<Application | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [undoFailed, setUndoFailed] = useState(false);
  const loaded = useRef(false);

  const load = useCallback(async () => {
    const result = await listApplications();
    if (!result.ok) {
      // Keep what is on screen if a later reload fails; show the error only when there is nothing yet.
      if (!loaded.current) setError(result.error);
      return result;
    }
    loaded.current = true;
    setError(null);
    setApplications(result.data);
    return result;
  }, []);

  // Reload on focus: programs may have been added from Programs, 4 or 10.
  useFocusEffect(
    useCallback(() => {
      const just = takeJustAdded();
      void load().then((result) => {
        if (just && result.ok) setAdded(result.data.find((a) => a.id === just.applicationId) ?? null);
      });
      return () => {
        // The banner belongs to this visit only (11).
        setAdded(null);
        setUndoFailed(false);
      };
    }, [load]),
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function undo() {
    if (!added) return;
    setUndoing(true);
    setUndoFailed(false);
    const result = await removeApplication(added.programId);
    setUndoing(false);
    if (!result.ok) return setUndoFailed(true);
    setApplications((list) => list?.filter((a) => a.id !== added.id) ?? null);
    setAdded(null);
  }

  if (error || !applications) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          {error ? (
            <>
              <SymbolView name={error === "offline" ? "wifi.slash" : "exclamationmark.triangle"} tintColor={colors.textMuted} size={36} />
              <Text style={styles.stateTitle}>{t(`errors.${error}`)}</Text>
              <Button
                label={t("programs.retry")}
                onPress={() => {
                  setError(null);
                  void load();
                }}
              />
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.textMuted} />
              <Text style={styles.subtitle}>{t("applications.loading")}</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const count = counters(applications);
  const empty = applications.length === 0;
  const openAdd = () => router.push("/add-university");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.textMuted} />}
      >
        <View style={styles.topBar}><Logo withName /></View>

        {added && (
          <View style={styles.addedBanner} accessibilityLiveRegion="polite">
            <SymbolView name="checkmark" tintColor={colors.success} size={sizes.icon} />
            <Text style={styles.addedText}>
              <Text style={styles.addedStrong}>{t("applications.added.title")}</Text> {added.university} · {added.program}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => void undo()} disabled={undoing} hitSlop={spacing.md}>
              {undoing ? <ActivityIndicator color={colors.link} /> : <Text style={styles.link}>{t("applications.added.undo")}</Text>}
            </Pressable>
          </View>
        )}
        {undoFailed && <FormError text={t("applications.added.undoFailed")} />}

        <Text style={styles.title} accessibilityRole="header">{t("tabs.applications")}</Text>
        <Text style={styles.subtitle}>{t("applications.subtitle")}</Text>

        <View style={styles.counters}>
          <Counter value={String(count.universities)} label={t("applications.counters.universities")} muted={empty} />
          <Counter value={String(count.applied)} label={t("applications.counters.applied")} muted={empty} />
          <Counter
            value={count.nextDeadlineDays === null ? "–" : String(count.nextDeadlineDays)}
            label={t("applications.counters.nextDeadline")}
            muted={count.nextDeadlineDays === null}
          />
        </View>

        {empty ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <SymbolView name="doc.badge.plus" tintColor={colors.link} size={30} />
            </View>
            <Text style={styles.emptyTitle}>{t("applications.empty.title")}</Text>
            <Text style={styles.emptyBody}>{t("applications.empty.body")}</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.overline}>{t("applications.myUniversities")}</Text>
              <Pressable accessibilityRole="button" onPress={openAdd} hitSlop={spacing.md}>
                <Text style={styles.link}>{t("applications.add")}</Text>
              </Pressable>
            </View>
            <View style={styles.list}>
              {applications.map((application, index) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  highlighted={application.id === added?.id}
                  first={index === 0}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <Button label={`+  ${t("applications.addUniversity")}`} onPress={openAdd} />
          {empty && (
            <Pressable accessibilityRole="link" onPress={() => router.navigate("/programs")} style={styles.browse} hitSlop={spacing.sm}>
              <Text style={[styles.link, styles.browseText]}>{t("applications.empty.browse")}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Counter({ value, label, muted }: { value: string; label: string; muted: boolean }) {
  return (
    <View style={styles.counter}>
      <Text style={[styles.counterValue, muted && styles.counterMuted]}>{value}</Text>
      <Text style={styles.counterLabel}>{label}</Text>
    </View>
  );
}

function ApplicationCard({ application, highlighted, first }: { application: Application; highlighted: boolean; first: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${application.university}, ${application.program}, ${t(`applications.status.${application.status}`)}`}
      onPress={() => router.push({ pathname: "/checklist/[id]", params: { id: application.id } })}
      style={({ pressed }) => [styles.card, !first && styles.cardDivider, highlighted && styles.cardHighlighted, pressed && styles.pressed]}
    >
      <InitialsBadge initials={application.initials} color={application.brandColor} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardUniversity} numberOfLines={1}>{application.university}</Text>
          <Text style={[styles.status, { color: statusColor[application.status] }]}>{t(`applications.status.${application.status}`)}</Text>
        </View>
        <Text style={styles.cardProgram}>{application.program}</Text>
      </View>
      <SymbolView name="chevron.right" tintColor={colors.textMuted} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: layout.screenPaddingX, paddingBottom: layout.screenPaddingBottom, gap: spacing.md },
  topBar: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  link: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
  addedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: layout.borderWidth,
    borderColor: colors.success,
    backgroundColor: colors.successTint,
  },
  addedText: { ...typography.bodySmall, flex: 1, color: colors.text },
  addedStrong: { ...typography.bodyStrong, fontSize: typography.bodySmall.fontSize },
  counters: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  counter: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  counterValue: { ...typography.stat, color: colors.primary },
  counterMuted: { color: colors.textMuted },
  counterLabel: { ...typography.bodySmall, color: colors.textMuted },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg },
  overline: { ...typography.overline, color: colors.textMuted },
  list: {
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: layout.cardPadding },
  cardDivider: { borderTopWidth: layout.borderWidth, borderTopColor: colors.border },
  cardHighlighted: { backgroundColor: colors.surfaceRaised, borderLeftWidth: 3, borderLeftColor: colors.success },
  pressed: { opacity: 0.8 },
  cardBody: { flex: 1, gap: spacing.xxs },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardUniversity: { ...typography.cardTitle, color: colors.text, flexShrink: 1 },
  cardProgram: { ...typography.bodySmall, color: colors.textMuted },
  status: { ...typography.caption },
  emptyCard: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xxl,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderStyle: "dashed",
    borderColor: colors.borderDashed,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentTint,
  },
  emptyTitle: { ...typography.cardTitle, fontSize: 18, color: colors.text, textAlign: "center" },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  actions: { gap: spacing.lg, marginTop: spacing.lg },
  browse: { alignItems: "center", minHeight: sizes.touchTarget, justifyContent: "center" },
  browseText: { textAlign: "center" },
});
