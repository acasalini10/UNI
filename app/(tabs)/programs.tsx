// AI-assisted (Copilot): added the title-only Programs tab screen.
// AI-assisted (Claude Code): Programs 3: profile summary, filters and sort in bottom sheets, count per label, program cards; loading, empty, "Other" scale and offline states.
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import { Button } from "@/components/Button";
import { FilterSheet } from "@/components/FilterSheet";
import { FitChip } from "@/components/FitChip";
import { Logo } from "@/components/Logo";
import { ProgramCard } from "@/components/ProgramCard";
import { countryName } from "@/countries";
import { getProfile, type Profile } from "@/data/profile";
import {
  applyFilters,
  emptyFilters,
  filterOptions,
  fitOrder,
  getPrograms,
  initialFilters,
  studentScores,
  toRows,
  type DeadlineFilter,
  type Filters,
  type ProgramRow,
  type ProgramWithUniversity,
  type SortKey,
} from "@/data/programs";
import type { FitLabel } from "@/lib/fit";
import { t } from "@/i18n";
import { colors, layout, radius, spacing, typography } from "@/theme";

const deadlineOptions: DeadlineFilter[] = ["any", "open", "3m", "6m"];
const sortOptions: SortKey[] = ["fit", "cost", "deadline"];

function joined(values: string[], max = 2): string {
  return values.length > max ? `${values.slice(0, max).join(", ")} +${values.length - max}` : values.join(", ");
}

export default function Programs() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [programs, setPrograms] = useState<ProgramWithUniversity[] | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [error, setError] = useState<"offline" | "unknown" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loaded = useRef(false);

  const load = useCallback(async () => {
    const [profileResult, programsResult] = await Promise.all([getProfile(), getPrograms()]);
    if (!profileResult.ok || !programsResult.ok) {
      // Keep what is on screen if a later reload fails; show the error only when there is nothing yet.
      if (!loaded.current) setError(!profileResult.ok ? profileResult.error : programsResult.ok ? "unknown" : programsResult.error);
      return;
    }
    setError(null);
    setProfile(profileResult.data);
    setPrograms(programsResult.data);
    if (!loaded.current) {
      setFilters(initialFilters(profileResult.data, toRows(programsResult.data, profileResult.data)));
      loaded.current = true;
    }
  }, []);

  // Reload on focus: the profile (grade, currency) may have changed in another tab.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function retry() {
    setError(null);
    void load();
  }

  const rows = useMemo(() => (profile && programs ? toRows(programs, profile) : []), [profile, programs]);
  const visible = useMemo(() => (filters ? applyFilters(rows, filters) : []), [rows, filters]);
  const options = useMemo(() => filterOptions(rows), [rows]);

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <SymbolView name={error === "offline" ? "wifi.slash" : "exclamationmark.triangle"} tintColor={colors.textMuted} size={36} />
          <Text style={styles.stateTitle}>{t(`errors.${error}`)}</Text>
          <Button label={t("programs.retry")} onPress={retry} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile || !filters) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.textMuted} />
          <Text style={styles.subtitle}>{t("programs.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const scores = studentScores(profile);
  const canRate = scores.gpa !== null;
  const counts = fitOrder
    .map((label) => ({ label, count: visible.filter((row) => row.fit.label === label).length }))
    .filter(({ count }) => count > 0);
  const filtersActive =
    filters.countries.length > 0 || filters.fields.length > 0 || filters.fits.length > 0 || filters.deadline !== "any" || filters.sort !== "fit";

  const summary = [
    scores.gpa !== null ? t("programs.summary.gpa", { gpa: scores.gpa.toFixed(1) }) : null,
    scores.ielts !== null ? t("programs.summary.ielts", { ielts: scores.ielts.toFixed(1) }) : t("programs.summary.noIelts"),
    profile.target_countries.length > 0 ? profile.target_countries.map(countryName).join(", ") : null,
  ].filter(Boolean).join(" · ");

  const update = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}><Logo withName /></View>
      <Text style={styles.title}>{t("tabs.programs")}</Text>
      <Text style={styles.subtitle}>
        {summary} ·{" "}
        <Text accessibilityRole="link" style={styles.link} onPress={() => router.push("/profile-setup")}>{t("programs.summary.edit")}</Text>
      </Text>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={styles.panelTitleRow}>
            <SymbolView name="line.3.horizontal.decrease" tintColor={colors.link} size={18} />
            <Text style={styles.panelTitle}>{t("programs.filters.title")}</Text>
          </View>
          {filtersActive && (
            <Pressable accessibilityRole="button" onPress={() => setFilters(emptyFilters)} hitSlop={spacing.md}>
              <Text style={styles.link}>{t("programs.filters.reset")}</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.chips}>
          <FilterSheet
            title={t("programs.filters.country")}
            chipText={filters.countries.length ? `${t("programs.filters.country")}: ${joined(filters.countries.map(countryName))}` : t("programs.filters.country")}
            active={filters.countries.length > 0}
            multiple
            options={options.countries.map((code) => ({ value: code, label: countryName(code) })).sort((a, b) => a.label.localeCompare(b.label))}
            selected={filters.countries}
            onChange={(countries) => update({ countries })}
          />
          <FilterSheet
            title={t("programs.filters.field")}
            chipText={filters.fields.length ? `${t("programs.filters.field")}: ${joined(filters.fields, 1)}` : t("programs.filters.field")}
            active={filters.fields.length > 0}
            multiple
            options={options.fields.map((field) => ({ value: field, label: field }))}
            selected={filters.fields}
            onChange={(fields) => update({ fields })}
          />
          {canRate && (
            <FilterSheet
              title={t("programs.filters.fit")}
              chipText={filters.fits.length ? `${t("programs.filters.fit")}: ${joined(filters.fits.map((label) => t(`fit.labels.${label}`)), 1)}` : `${t("programs.filters.fit")}: ${t("programs.filters.all")}`}
              active={filters.fits.length > 0}
              multiple
              options={fitOrder.map((label) => ({ value: label, label: t(`fit.labels.${label}`) }))}
              selected={filters.fits}
              onChange={(fits) => update({ fits: fits as FitLabel[] })}
            />
          )}
          <FilterSheet
            title={t("programs.filters.deadline")}
            chipText={filters.deadline === "any" ? t("programs.filters.deadline") : t(`programs.filters.deadlines.${filters.deadline}`)}
            active={filters.deadline !== "any"}
            options={deadlineOptions.map((value) => ({ value, label: t(`programs.filters.deadlines.${value}`) }))}
            selected={[filters.deadline]}
            onChange={([deadline]) => update({ deadline: deadline as DeadlineFilter })}
          />
          <FilterSheet
            title={t("programs.filters.sort")}
            chipText={`${t("programs.filters.sort")}: ${t(`programs.filters.sorts.${filters.sort}`)}`}
            active={filters.sort !== "fit"}
            options={sortOptions.filter((value) => canRate || value !== "fit").map((value) => ({ value, label: t(`programs.filters.sorts.${value}`) }))}
            selected={[filters.sort]}
            onChange={([sort]) => update({ sort: sort as SortKey })}
          />
        </View>
      </View>

      {!canRate && (
        <View style={styles.banner}><Text style={styles.bannerText}>{t("programs.otherScale")}</Text></View>
      )}
      {canRate && counts.length > 0 && (
        <View style={styles.counts}>
          {counts.map(({ label, count }) => <FitChip key={label} label={label} count={count} />)}
        </View>
      )}
      {canRate && visible.length > 0 && <Text style={styles.disclaimer}>{t("programs.disclaimer")}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList<ProgramRow>
        data={visible}
        keyExtractor={(row) => row.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ProgramCard row={item} showLabel={canRate} onPress={() => router.push({ pathname: "/program/[id]", params: { id: item.id } })} />
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.textMuted} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.stateTitle}>{t("programs.empty.title")}</Text>
            {filtersActive && <Button label={t("programs.empty.clear")} onPress={() => setFilters(emptyFilters)} />}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: layout.screenPaddingX, paddingBottom: layout.screenPaddingBottom },
  headerBlock: { gap: spacing.md, paddingBottom: spacing.lg },
  topBar: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  link: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  panel: {
    marginTop: spacing.sm,
    padding: layout.cardPadding,
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  panelTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  panelTitle: { ...typography.bodyStrong, color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  counts: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  disclaimer: { ...typography.small, color: colors.textMuted },
  banner: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: layout.borderWidth,
    borderColor: colors.infoBannerBorder,
    backgroundColor: colors.infoBannerBg,
  },
  bannerText: { ...typography.body, color: colors.infoBannerText },
  gap: { height: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
  empty: { alignItems: "stretch", gap: spacing.lg, paddingTop: spacing.xxl },
});
