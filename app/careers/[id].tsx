// AI-assisted (Claude Code): Careers 8: employment, salary with "≈", regions as a segmented bar with "Not broken down", recruiters and roles. Each block is hidden without data and shows its scope, report year and report link (business-rules.md §7).
import { SymbolView } from "expo-symbols";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { employmentText, percent } from "@/components/careerText";
import { hasCareerData, type CareerBlocks, type CareerSource } from "@/data/careerBlocks";
import { getCareers } from "@/data/careers";
import { getProfile } from "@/data/profile";
import { getProgram, type ProgramWithUniversity } from "@/data/programs";
import { formatMoney } from "@/lib/cost";
import { locale, shortDate } from "@/format";
import { t } from "@/i18n";
import { chartColors, chartRest, colors, layout, radius, sizes, spacing, typography } from "@/theme";

export default function Careers() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<ProgramWithUniversity | null>(null);
  const [blocks, setBlocks] = useState<CareerBlocks | null>(null);
  const [error, setError] = useState<"offline" | "unknown" | "not_found" | null>(null);
  // Bumped by "Try again" to run the load effect again.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all([getProgram(id), getProfile()]).then(async ([programResult, profileResult]) => {
      if (!active) return;
      if (!programResult.ok) return setError(programResult.error);
      if (!profileResult.ok) return setError(profileResult.error);
      const careersResult = await getCareers(id, profileResult.data);
      if (!active) return;
      if (!careersResult.ok) return setError(careersResult.error);
      setProgram(programResult.data);
      setBlocks(careersResult.data);
    });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  const header = (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel={t("common.back")} onPress={() => router.back()} style={styles.circle}>
        <SymbolView name="chevron.left" tintColor={colors.text} size={sizes.icon} />
      </Pressable>
      <View style={styles.flex}>
        <Text style={styles.barTitle} accessibilityRole="header">{t("careers.title")}</Text>
        {program && (
          <Text style={styles.small} numberOfLines={1}>
            {program.program} · {program.universities.name}
          </Text>
        )}
      </View>
    </View>
  );

  if (error || !program || !blocks) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {header}
        <View style={styles.center}>
          {error ? (
            <>
              <Text style={styles.stateTitle}>{error === "not_found" ? t("programDetail.notFound") : t(`errors.${error}`)}</Text>
              {error !== "not_found" && (
                <Button
                  label={t("programs.retry")}
                  onPress={() => {
                    setError(null);
                    setAttempt((n) => n + 1);
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

  if (!hasCareerData(blocks)) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {header}
        <View style={styles.center}>
          <Text style={styles.stateTitle}>{t("careers.empty")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { employment, salary, regions, recruiters, roles } = blocks;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        {employment && (
          <Block title={t("careers.employment.title")} source={employment.source}>
            <View style={styles.bigRow}>
              <Text style={styles.big}>{percent(employment.pct)}</Text>
              <Text style={styles.body}>{employmentText(employment)}</Text>
            </View>
          </Block>
        )}

        {salary && (
          <Block title={t(`careers.salary.${salary.stat}`)} source={salary.source}>
            <Text style={styles.big}>{formatMoney(salary.amount, salary.currency, locale())}</Text>
            {salary.converted && (
              <Text style={styles.small}>
                {t("programs.card.approx", {
                  amount: formatMoney(salary.converted.amount, salary.converted.currency, locale()),
                  date: shortDate(salary.converted.rateDate),
                })}
              </Text>
            )}
          </Block>
        )}

        {regions && (
          <Block title={t("careers.regions.title")} source={regions.source}>
            {/* Segmented bar: one flex share per region, the rest in grey. Read out by the legend below. */}
            <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {regions.segments.map((segment, i) => (
                <View key={segment.region} style={{ flex: segment.share, backgroundColor: chartColors[i % chartColors.length] }} />
              ))}
              {regions.notBrokenDown > 0 && <View style={{ flex: regions.notBrokenDown, backgroundColor: chartRest }} />}
            </View>
            <View style={styles.legend}>
              {regions.segments.map((segment, i) => (
                <LegendRow key={segment.region} color={chartColors[i % chartColors.length]} label={segment.region} share={segment.share} />
              ))}
              {regions.notBrokenDown > 0 && <LegendRow color={chartRest} label={t("careers.regions.notBrokenDown")} share={regions.notBrokenDown} muted />}
            </View>
          </Block>
        )}

        {recruiters && (
          <Block title={t("careers.recruiters.title")} source={recruiters.source}>
            <Chips items={recruiters.items} />
          </Block>
        )}

        {roles && (
          <Block title={t("careers.roles.title")} source={roles.source}>
            <Chips items={roles.items} />
          </Block>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Block({ title, source, children }: { title: string; source: CareerSource; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
      <SourceLine source={source} />
    </View>
  );
}

// Scope (when not the program's own), report year, and the report link.
function SourceLine({ source }: { source: CareerSource }) {
  const parts = [source.scopeLabel && t("careers.source.dataFor", { label: source.scopeLabel }), source.year && t("careers.source.report", { year: source.year })].filter(
    (part): part is string => Boolean(part),
  );
  function open() {
    void WebBrowser.openBrowserAsync(source.url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
  }
  return (
    <View style={styles.source}>
      {parts.length > 0 && <Text style={styles.small}>{parts.join(" · ")}</Text>}
      <Pressable accessibilityRole="link" onPress={open} style={styles.sourceLink} hitSlop={spacing.sm}>
        <Text style={styles.link}>{t("careers.source.open")}</Text>
        <SymbolView name="arrow.up.right.square" tintColor={colors.link} size={16} />
      </Pressable>
    </View>
  );
}

function LegendRow({ color, label, share, muted = false }: { color: string; label: string; share: number; muted?: boolean }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, muted && styles.muted]}>{label}</Text>
      <Text style={[styles.legendShare, muted && styles.muted]}>{percent(share)}</Text>
    </View>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <View style={styles.chips}>
      {items.map((item) => (
        <View key={item} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: layout.screenPaddingX, paddingVertical: spacing.sm },
  barTitle: { ...typography.bodyStrong, color: colors.text },
  circle: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  content: { paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.sm, paddingBottom: layout.screenPaddingBottom * 2, gap: spacing.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
  card: {
    padding: layout.cardPadding,
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { ...typography.cardTitle, color: colors.text },
  bigRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: spacing.sm },
  big: { ...typography.title, color: colors.text },
  body: { ...typography.bodySmall, color: colors.textSecondary },
  small: { ...typography.small, color: colors.textMuted },
  muted: { color: colors.textMuted },
  track: { flexDirection: "row", height: 14, gap: 2, borderRadius: radius.pill, overflow: "hidden" },
  legend: { gap: spacing.sm },
  legendRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  swatch: { width: 10, height: 10, borderRadius: radius.pill },
  legendLabel: { ...typography.bodySmall, color: colors.text, flex: 1 },
  legendShare: { ...typography.bodySmall, color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised },
  chipText: { ...typography.small, color: colors.textSecondary },
  source: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: layout.borderWidth, borderTopColor: colors.border },
  sourceLink: { flexDirection: "row", alignItems: "center", gap: spacing.xs, alignSelf: "flex-start", minHeight: sizes.touchTarget },
  link: { ...typography.bodySmall, color: colors.link, textDecorationLine: "underline" },
});
