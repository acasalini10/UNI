// AI-assisted (Claude Code): Program detail 4/4b: university scene hero tinted with the university's brand color (decisions 2026-11-12) under a floating header that pins on scroll, with bookmark to Applications, key facts, requirements vs you, application deadline and requirements, careers preview with "See all" to Careers 8 (hidden without career data), published cost with "≈", official page, "Get feedback on my application" to Feedback 6a. Sections without data (rankings, scholarships) are left out. Brand color also accents the key facts strip.
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BookmarkButton } from "@/components/BookmarkButton";
import { Button } from "@/components/Button";
import { employmentText, percent } from "@/components/careerText";
import { FitChip } from "@/components/FitChip";
import { InitialsBadge } from "@/components/InitialsBadge";
import { ProgramHero, sceneAccent } from "@/components/scenes";
import { fitReason, lengthText } from "@/components/ProgramCard";
import { countryName } from "@/countries";
import { savedPrograms, type ApplicationStatus } from "@/data/applications";
import { hasCareerData, type CareerBlocks } from "@/data/careerBlocks";
import { getCareers } from "@/data/careers";
import { getProfile, type Profile } from "@/data/profile";
import { detailCosts, getProgram, studentScores, toRows, type ProgramWithUniversity } from "@/data/programs";
import { formatMoney, type CostValues } from "@/lib/cost";
import type { CheckStatus } from "@/lib/fit";
import { daysUntil, locale, shortDate } from "@/format";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

// Scene height under the status bar. Once it has scrolled away, the title moves into the pinned header (4b).
const HERO_HEIGHT = 200;
const PIN_AFTER = HERO_HEIGHT;

function domainOf(url: string): string {
  return url.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
}

function money(value: CostValues["original"]): string {
  return formatMoney(value.amount, value.currency, locale());
}

// Program minimum as the university publishes it, e.g. "3.0 / 4.0" or "Upper second (2:1)".
function publishedMinimum(program: ProgramWithUniversity): string | null {
  const scale = program.min_gpa_scale;
  if (!scale) return null;
  if (scale === "uk_class") return program.min_gpa_class ? t(`profile.ukClasses.${program.min_gpa_class}`) : null;
  if (program.min_gpa === null) return null;
  if (scale === "100") return `${program.min_gpa}%`;
  return `${program.min_gpa} / ${scale}`;
}

const statusIcon: Record<CheckStatus, { name: SymbolViewProps["name"]; color: string }> = {
  met: { name: "checkmark.circle.fill", color: colors.success },
  below: { name: "exclamationmark.circle.fill", color: colors.warningText },
  no_minimum: { name: "questionmark.circle", color: colors.textMuted },
  missing_score: { name: "plus.circle", color: colors.link },
};

export default function ProgramDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [program, setProgram] = useState<ProgramWithUniversity | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<"offline" | "unknown" | "not_found" | null>(null);
  const [pinned, setPinned] = useState(false);
  const [saved, setSaved] = useState<{ status: ApplicationStatus | undefined } | null>(null);
  // Careers preview; stays null (section hidden) while loading, on error or without data.
  const [careers, setCareers] = useState<CareerBlocks | null>(null);
  // Bumped by "Try again" to run the load effect again.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all([getProgram(id), getProfile(), savedPrograms()]).then(([programResult, profileResult, savedResult]) => {
      if (!active) return;
      // Without the saved list the bookmark is hidden, not shown empty.
      setSaved(savedResult.ok ? { status: savedResult.data.get(id) } : null);
      if (!programResult.ok) return setError(programResult.error);
      if (!profileResult.ok) return setError(profileResult.error);
      setProgram(programResult.data);
      setProfile(profileResult.data);
      void getCareers(id, profileResult.data).then((careersResult) => {
        if (active && careersResult.ok && hasCareerData(careersResult.data)) setCareers(careersResult.data);
      });
    });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = event.nativeEvent.contentOffset.y > PIN_AFTER;
    if (next !== pinned) setPinned(next);
  }

  const backButton = (
    <Pressable accessibilityRole="button" accessibilityLabel={t("common.back")} onPress={() => router.back()} style={styles.circle}>
      <SymbolView name="chevron.left" tintColor={colors.text} size={sizes.icon} />
    </Pressable>
  );

  if (error || !program || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.bar}>{backButton}</View>
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

  const row = toRows([program], profile)[0];
  const costs = detailCosts(program, profile);
  const canRate = studentScores(profile).gpa !== null;
  const { gpa, english } = row.fit;
  const unitText = t(`cost.units.${program.cost_unit}`);
  const minimum = publishedMinimum(program);
  const days = program.deadline ? daysUntil(program.deadline) : null;
  const accent = sceneAccent(row.university, row.brandColor);

  function share() {
    void Share.share({ message: `${program!.program} · ${program!.universities.name}\n${program!.official_url}`, url: program!.official_url });
  }

  function openOfficial() {
    void WebBrowser.openBrowserAsync(program!.official_url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} onScroll={onScroll} scrollEventThrottle={32}>
        <ProgramHero university={row.university} brandColor={row.brandColor} height={HERO_HEIGHT + insets.top} />
        <View style={styles.content}>
          <View style={styles.identity}>
            <InitialsBadge initials={row.initials} color={row.brandColor} />
            <View style={styles.flex}>
              <Text style={styles.university}>{row.university}</Text>
              <Text style={styles.meta}>{program.universities.city} · {countryName(row.country)}</Text>
            </View>
          </View>
          {canRate && <FitChip label={row.fit.label} />}
          <Text style={styles.title} accessibilityRole="header">{row.program}</Text>
          <Text style={styles.meta}>
            {[program.field, lengthText(program.length_months), t("programDetail.taughtIn", { language: program.language })].join(" · ")}
          </Text>

          {/* Key facts */}
          <View style={styles.facts}>
            <View style={[styles.fact, { borderTopColor: accent }]}>
              <Text style={styles.factLabel}>{t("programDetail.facts.deadline")}</Text>
              <Text style={[styles.factValue, styles.factHighlight]}>{program.deadline ? shortDate(program.deadline) : t("programDetail.notPublished")}</Text>
            </View>
            <View style={[styles.fact, { borderTopColor: accent }]}>
              <Text style={styles.factLabel}>{t("programDetail.facts.tuition")}</Text>
              <Text style={styles.factValue}>{money(costs.tuition.original)}</Text>
              <Text style={styles.factSub}>{unitText}</Text>
            </View>
            <View style={[styles.fact, { borderTopColor: accent }]}>
              <Text style={styles.factLabel}>{t("programDetail.facts.applicationFee")}</Text>
              <Text style={styles.factValue}>
                {program.application_fee === null ? t("programDetail.notPublished") : formatMoney(program.application_fee, program.currency, locale())}
              </Text>
            </View>
          </View>

          {/* Requirements vs you */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("programDetail.vsYou.title")}</Text>
            <RequirementRow
              status={gpa.status}
              title={t("programDetail.vsYou.gpa")}
              detail={gpa.minimum !== null ? t("programDetail.vsYou.gpaMinimum", { min: gpa.minimum.toFixed(1) }) : t("fit.noMinimum")}
              hint={gpa.status === "no_minimum" ? t("fit.checkWithUniversity") : undefined}
              value={
                gpa.student === null
                  ? t("programDetail.vsYou.notConverted")
                  : gpa.difference !== null
                    ? `${gpa.student.toFixed(1)} (${gpa.difference >= 0 ? "+" : ""}${gpa.difference.toFixed(1)})`
                    : gpa.student.toFixed(1)
              }
            />
            <RequirementRow
              status={english.status}
              title={t("programDetail.vsYou.english")}
              detail={english.minimum !== null ? t("programDetail.vsYou.ieltsMinimum", { min: english.minimum.toFixed(1) }) : t("fit.noMinimum")}
              hint={english.status === "no_minimum" ? t("fit.checkWithUniversity") : undefined}
              value={english.student === null ? t("fit.missingIelts") : english.student.toFixed(1)}
            />
            <View style={styles.reasonBox}>
              {canRate && (
                <Text style={styles.reasonText}>
                  {t("programDetail.vsYou.why", { label: t(`fit.labels.${row.fit.label}`), reason: fitReason(row) })}
                </Text>
              )}
              <Text style={styles.reasonText}>{t("programDetail.vsYou.disclaimer")}</Text>
            </View>
          </View>

          {/* Application */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("programDetail.application.title")}</Text>
            <Text style={styles.overline}>{t("programDetail.application.deadline")}</Text>
            {program.deadline ? (
              <View style={styles.timelineRow}>
                <View style={styles.dot} />
                <View style={styles.flex}>
                  <Text style={styles.deadlineTitle}>{t("programDetail.application.applicationDeadline")}</Text>
                  <Text style={styles.meta}>
                    {shortDate(program.deadline)}
                    {days !== null && ` · ${days >= 0 ? t("programDetail.application.daysLeft", { count: days }) : t("programDetail.application.closed")}`}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.meta}>{t("programDetail.notPublished")}</Text>
            )}

            <Text style={[styles.overline, styles.sectionGap]}>{t("programDetail.application.requirements")}</Text>
            <Requirement
              icon="graduationcap"
              title={minimum ? t("programDetail.application.minGrade", { min: minimum }) : t("programDetail.application.noMinGrade")}
              sub={gpa.minimum !== null ? t("programDetail.application.converted", { min: gpa.minimum.toFixed(1) }) : t("fit.checkWithUniversity")}
            />
            <Requirement
              icon="text.bubble"
              title={program.min_ielts !== null ? t("programDetail.application.ielts", { min: program.min_ielts.toFixed(1) }) : t("programDetail.application.noIelts")}
              sub={program.min_ielts === null ? t("fit.checkWithUniversity") : undefined}
            />
            <Requirement icon="chart.bar" title={t(`programDetail.application.test.${program.test_required}`)} />
            {program.letters_required > 0 && (
              <Requirement icon="envelope" title={t("programDetail.application.letters", { count: program.letters_required })} />
            )}
          </View>

          {/* Careers preview: employment and the first 3 recruiters; salary only when neither is published */}
          {careers && <CareersPreview blocks={careers} programId={program.id} />}

          {/* What it costs */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("programDetail.costs.title")}</Text>
            <CostLine label={t(`programs.card.cost.tuitionOnly.${program.cost_unit}`)} value={costs.tuition} />
            {costs.fees ? (
              <CostLine label={t(`programDetail.costs.fees.${program.cost_unit}`)} value={costs.fees} />
            ) : (
              <View style={styles.costLine}>
                <Text style={styles.costLabel}>{t("programDetail.costs.feesLabel")}</Text>
                <Text style={styles.costValue}>{t("programDetail.notPublished")}</Text>
              </View>
            )}
            {costs.total && (
              <View style={styles.totalBox}>
                <CostLine label={t(`programs.card.cost.withFees.${program.cost_unit}`)} value={costs.total} strong />
              </View>
            )}
            <Text style={styles.small}>{t("programDetail.costs.note")}</Text>
          </View>

          {/* Official page */}
          <View style={styles.official}>
            <Pressable accessibilityRole="link" onPress={openOfficial} style={styles.officialLink} hitSlop={spacing.sm}>
              <Text style={styles.link}>{t("programDetail.official")}</Text>
              <SymbolView name="arrow.up.right.square" tintColor={colors.link} size={18} />
            </Pressable>
            <Text style={styles.small}>{t("programDetail.opensInBrowser", { domain: domainOf(program.official_url) })}</Text>
            <Text style={styles.small}>{t("programDetail.checkedOn", { date: shortDate(program.checked_on) })}</Text>
          </View>

          {/* Feedback 6a with this program preselected (flows.md §4) */}
          <Button label={t("programDetail.getFeedback")} onPress={() => router.push({ pathname: "/feedback", params: { programId: program.id } })} />
        </View>
      </ScrollView>

      {/* Over the scene; gets the page background once pinned (4b). */}
      <View style={[styles.bar, styles.barFloating, { paddingTop: insets.top + spacing.sm }, pinned && styles.barPinned]}>
        {backButton}
        {pinned ? (
          <View style={styles.barTitle}>
            <InitialsBadge initials={row.initials} color={row.brandColor} />
            <View style={styles.flex}>
              <Text style={styles.barProgram} numberOfLines={1}>{row.program}</Text>
              <Text style={styles.barUniversity} numberOfLines={1}>{row.university}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.flex} />
        )}
        {saved && <BookmarkButton programId={program.id} status={saved.status} onChange={(status) => setSaved({ status })} />}
        <Pressable accessibilityRole="button" accessibilityLabel={t("programDetail.share")} onPress={share} style={styles.circle}>
          <SymbolView name="square.and.arrow.up" tintColor={colors.text} size={sizes.icon} />
        </Pressable>
      </View>
    </View>
  );
}

function RequirementRow({ status, title, detail, hint, value }: { status: CheckStatus; title: string; detail: string; hint?: string; value: string }) {
  const icon = statusIcon[status];
  return (
    <View style={styles.reqRow}>
      <SymbolView name={icon.name} tintColor={icon.color} size={sizes.icon} />
      <View style={styles.flex}>
        <Text style={styles.reqTitle}>{title}</Text>
        <Text style={styles.meta}>{detail}</Text>
        {hint && <Text style={styles.small}>{hint}</Text>}
      </View>
      <Text style={[styles.reqValue, { color: status === "missing_score" ? colors.link : icon.color === colors.textMuted ? colors.text : icon.color }]}>{value}</Text>
    </View>
  );
}

function Requirement({ icon, title, sub }: { icon: SymbolViewProps["name"]; title: string; sub?: string }) {
  return (
    <View style={styles.reqItem}>
      <SymbolView name={icon} tintColor={colors.link} size={18} />
      <View style={styles.flex}>
        <Text style={styles.reqTitle}>{title}</Text>
        {sub && <Text style={styles.meta}>{sub}</Text>}
      </View>
    </View>
  );
}

function CareersPreview({ blocks, programId }: { blocks: CareerBlocks; programId: string }) {
  const { employment, salary, recruiters } = blocks;
  const showSalary = salary && !employment && !recruiters;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{t("programDetail.careers.title")}</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/careers/[id]", params: { id: programId } })} hitSlop={spacing.sm}>
          <Text style={styles.seeAll}>{t("programDetail.careers.seeAll")}</Text>
        </Pressable>
      </View>
      {employment && (
        <View>
          <Text style={styles.costValue}>
            <Text style={styles.costStrong}>{percent(employment.pct)}</Text> {employmentText(employment)}
          </Text>
          {employment.source.scopeLabel && <Text style={styles.small}>{t("careers.source.dataFor", { label: employment.source.scopeLabel })}</Text>}
        </View>
      )}
      {recruiters && (
        <View>
          <Text style={styles.overline}>{t("careers.recruiters.title")}</Text>
          <Text style={styles.costValue}>{recruiters.items.slice(0, 3).join(" · ")}</Text>
          {recruiters.source.scopeLabel && <Text style={styles.small}>{t("careers.source.dataFor", { label: recruiters.source.scopeLabel })}</Text>}
        </View>
      )}
      {showSalary && (
        <View>
          <Text style={styles.overline}>{t(`careers.salary.${salary.stat}`)}</Text>
          <Text style={styles.costValue}>{formatMoney(salary.amount, salary.currency, locale())}</Text>
          {salary.source.scopeLabel && <Text style={styles.small}>{t("careers.source.dataFor", { label: salary.source.scopeLabel })}</Text>}
        </View>
      )}
    </View>
  );
}

function CostLine({ label, value, strong = false }: { label: string; value: CostValues; strong?: boolean }) {
  return (
    <View style={styles.costLine}>
      <Text style={[styles.costLabel, strong && styles.costStrong]}>{label}</Text>
      <View style={styles.costRight}>
        <Text style={[styles.costValue, strong && styles.costStrong]}>{money(value.original)}</Text>
        {value.converted && (
          <Text style={styles.small}>
            {t("programs.card.approx", { amount: formatMoney(value.converted.amount, value.converted.currency, locale()), date: shortDate(value.converted.rateDate) })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.sm,
  },
  barFloating: { position: "absolute", top: 0, left: 0, right: 0 },
  barPinned: { borderBottomWidth: layout.borderWidth, borderBottomColor: colors.border, backgroundColor: colors.bg },
  barTitle: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  barProgram: { ...typography.bodyStrong, color: colors.text },
  barUniversity: { ...typography.small, color: colors.textMuted },
  circle: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  scroll: { paddingBottom: layout.screenPaddingBottom * 2 },
  content: { paddingHorizontal: layout.screenPaddingX, gap: spacing.md, marginTop: -spacing.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingTop: spacing.sm },
  university: { ...typography.bodyStrong, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  small: { ...typography.small, color: colors.textMuted },
  title: { ...typography.display, color: colors.text },
  facts: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  fact: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xxs,
    borderRadius: radius.lg,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    borderTopWidth: 3,
    backgroundColor: colors.surface,
  },
  factLabel: { ...typography.small, color: colors.textMuted },
  factValue: { ...typography.bodyStrong, color: colors.text },
  factHighlight: { color: colors.warningText },
  factSub: { ...typography.small, color: colors.textMuted },
  card: {
    padding: layout.cardPadding,
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { ...typography.cardTitle, color: colors.text },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  seeAll: { ...typography.bodySmall, color: colors.link },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: layout.borderWidth,
    borderTopColor: colors.border,
  },
  reqTitle: { ...typography.bodyStrong, color: colors.text },
  reqValue: { ...typography.bodyStrong, textAlign: "right", maxWidth: "40%" },
  reasonBox: { padding: spacing.md, gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceSunken },
  reasonText: { ...typography.bodySmall, color: colors.textSecondary },
  overline: { ...typography.overline, color: colors.textMuted },
  sectionGap: { marginTop: spacing.sm },
  timelineRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  dot: { width: 12, height: 12, marginTop: 5, borderRadius: radius.pill, backgroundColor: colors.primary },
  deadlineTitle: { ...typography.bodyStrong, color: colors.warningText },
  reqItem: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  costLine: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  costLabel: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  costRight: { alignItems: "flex-end", gap: spacing.xxs },
  costValue: { ...typography.bodySmall, color: colors.text },
  costStrong: { ...typography.bodyStrong, color: colors.text },
  totalBox: { paddingTop: spacing.md, borderTopWidth: layout.borderWidth, borderTopColor: colors.border },
  official: { alignItems: "center", gap: spacing.xs, paddingTop: spacing.lg },
  officialLink: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: sizes.touchTarget },
  link: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
});
