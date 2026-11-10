// AI-assisted (Claude Code): University's master's 10: university header, filter chips (All, Fits you, by area), one row per program with fit label; tapping a row adds it to Applications and returns to 11. Programs already added show a check and do nothing.
import { SymbolView } from "expo-symbols";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { FitChip } from "@/components/FitChip";
import { InitialsBadge } from "@/components/InitialsBadge";
import { FormError } from "@/components/Message";
import { lengthText } from "@/components/ProgramCard";
import { countryName } from "@/countries";
import {
  addApplication,
  getUniversityPrograms,
  savedPrograms,
  setJustAdded,
  type DataError,
  type SavedPrograms,
} from "@/data/applications";
import { getProfile, type Profile } from "@/data/profile";
import { fitOrder, studentScores, toRows, type ProgramRow, type ProgramWithUniversity } from "@/data/programs";
import type { FitLabel } from "@/lib/fit";
import { shortDate } from "@/format";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

// "Fits you" = the labels that say the student can apply: Safety, Match, Reach.
const fitsYou: FitLabel[] = ["safety", "match", "reach"];

type Filter = { kind: "all" } | { kind: "fits" } | { kind: "field"; field: string };

export default function UniversityPrograms() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [programs, setPrograms] = useState<ProgramWithUniversity[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState<SavedPrograms | null>(null);
  const [error, setError] = useState<DataError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [adding, setAdding] = useState<string | null>(null);
  const [addFailed, setAddFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([getUniversityPrograms(id), getProfile(), savedPrograms()]).then(([programsResult, profileResult, savedResult]) => {
      if (!active) return;
      if (!programsResult.ok) return setError(programsResult.error);
      if (!profileResult.ok) return setError(profileResult.error);
      if (!savedResult.ok) return setError(savedResult.error);
      setPrograms(programsResult.data);
      setProfile(profileResult.data);
      setSaved(savedResult.data);
    });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  const rows = useMemo(() => {
    if (!programs || !profile) return [];
    return toRows(programs, profile).sort(
      (a, b) => fitOrder.indexOf(a.fit.label) - fitOrder.indexOf(b.fit.label) || a.program.localeCompare(b.program),
    );
  }, [programs, profile]);

  const backButton = (
    <Pressable accessibilityRole="button" accessibilityLabel={t("common.back")} onPress={() => router.back()} style={styles.circle}>
      <SymbolView name="chevron.left" tintColor={colors.text} size={sizes.icon} />
    </Pressable>
  );

  if (error || !programs || !profile || !saved) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.bar}>{backButton}</View>
        <View style={styles.center}>
          {error ? (
            <>
              <Text style={styles.stateTitle}>{t(`errors.${error}`)}</Text>
              <Button
                label={t("programs.retry")}
                onPress={() => {
                  setError(null);
                  setAttempt((n) => n + 1);
                }}
              />
            </>
          ) : (
            <ActivityIndicator color={colors.textMuted} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const university = programs[0]?.universities;
  const canRate = studentScores(profile).gpa !== null;
  const fields = [...new Set(rows.map((row) => row.field))].sort((a, b) => a.localeCompare(b));
  const fitting = rows.filter((row) => fitsYou.includes(row.fit.label));
  const visible =
    filter.kind === "fits" ? fitting : filter.kind === "field" ? rows.filter((row) => row.field === filter.field) : rows;

  async function add(row: ProgramRow) {
    setAdding(row.id);
    setAddFailed(false);
    const result = await addApplication(row.id);
    setAdding(null);
    if (!result.ok) return setAddFailed(true);
    setJustAdded({ applicationId: result.data, programId: row.id });
    router.dismissTo("/applications");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.bar}>{backButton}</View>
      <ScrollView contentContainerStyle={styles.content}>
        {university ? (
          <View style={styles.identity}>
            <InitialsBadge initials={university.initials} color={university.brand_color} />
            <View style={styles.flex}>
              <Text style={styles.title} accessibilityRole="header">{university.name}</Text>
              <Text style={styles.meta}>
                {university.city}, {countryName(university.country)} · {t("applications.university.masters", { count: rows.length })}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.stateTitle}>{t("applications.university.empty")}</Text>
        )}

        {rows.length > 0 && (
          <>
            <Text style={styles.intro}>{t("applications.university.intro")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Chip label={t("applications.university.all", { count: rows.length })} active={filter.kind === "all"} onPress={() => setFilter({ kind: "all" })} />
              {canRate && fitting.length > 0 && (
                <Chip label={t("applications.university.fits", { count: fitting.length })} active={filter.kind === "fits"} onPress={() => setFilter({ kind: "fits" })} />
              )}
              {fields.length > 1 &&
                fields.map((field) => (
                  <Chip
                    key={field}
                    label={field}
                    active={filter.kind === "field" && filter.field === field}
                    onPress={() => setFilter({ kind: "field", field })}
                  />
                ))}
            </ScrollView>

            {addFailed && <FormError text={t("applications.university.addFailed")} />}

            <View style={styles.list}>
              {visible.map((row, index) => (
                <ProgramRowItem
                  key={row.id}
                  row={row}
                  showLabel={canRate}
                  saved={saved.has(row.id)}
                  busy={adding === row.id}
                  disabled={adding !== null}
                  first={index === 0}
                  onAdd={() => void add(row)}
                />
              ))}
            </View>

            {canRate && <Text style={styles.disclaimer}>{t("programs.disclaimer")}</Text>}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

type RowProps = {
  row: ProgramRow;
  showLabel: boolean;
  saved: boolean;
  busy: boolean;
  disabled: boolean;
  first: boolean;
  onAdd: () => void;
};

function ProgramRowItem({ row, showLabel, saved, busy, disabled, first, onAdd }: RowProps) {
  const meta = [
    row.field,
    lengthText(row.lengthMonths),
    row.deadline ? t("applications.university.deadline", { date: shortDate(row.deadline) }) : t("applications.university.noDeadline"),
  ].join(" · ");

  const content = (
    <>
      <View style={styles.flex}>
        {showLabel && <FitChip label={row.fit.label} />}
        <Text style={styles.program}>{row.program}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <View style={[styles.addCircle, saved && styles.addedCircle]}>
        {busy ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <SymbolView name={saved ? "checkmark" : "plus"} tintColor={saved ? colors.success : colors.link} size={sizes.icon} />
        )}
      </View>
    </>
  );

  // A program already in Applications is not tappable: adding it again would do nothing.
  if (saved) {
    return (
      <View style={[styles.row, !first && styles.rowDivider]} accessible accessibilityLabel={`${row.program}, ${t("applications.university.added")}`}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("applications.university.add", { program: row.program })}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onAdd}
      style={({ pressed }) => [styles.row, !first && styles.rowDivider, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: spacing.xs },
  bar: { flexDirection: "row", paddingHorizontal: layout.screenPaddingX, paddingVertical: spacing.sm },
  circle: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  content: { paddingHorizontal: layout.screenPaddingX, paddingBottom: layout.screenPaddingBottom * 2, gap: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingTop: spacing.sm },
  title: { ...typography.title, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  intro: { ...typography.body, color: colors.textSecondary },
  chips: { gap: spacing.sm },
  chip: {
    minHeight: sizes.chip,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { ...typography.chip, color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  list: {
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: layout.cardPadding },
  rowDivider: { borderTopWidth: layout.borderWidth, borderTopColor: colors.border },
  pressed: { opacity: 0.8 },
  program: { ...typography.cardTitle, color: colors.text },
  addCircle: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidthSelected,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addedCircle: { borderColor: colors.success, backgroundColor: colors.successTint },
  disclaimer: { ...typography.small, color: colors.textMuted },
});
