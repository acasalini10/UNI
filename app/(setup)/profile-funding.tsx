// AI-assisted (Claude Code): screen 2b, optional budget and funding profile setup.
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormError } from "@/components/Message";
import { ProfileSetupLayout } from "@/components/ProfileSetupLayout";
import { getProfile, updateProfile } from "@/data/profile";
import { t } from "@/i18n";
import { colors, layout, radius, spacing, typography } from "@/theme";

const countries = ["IT", "US", "GB", "DE", "IN"] as const;
const budgets = ["under_10k", "10k_25k", "25k_50k", "over_50k", "not_sure"] as const;
const payers = ["me", "family", "scholarship", "loan", "not_sure"] as const;
const currencies = ["EUR", "USD", "GBP"] as const;

export default function ProfileFunding() {
  const [citizenships, setCitizenships] = useState<string[]>([]);
  const [origin, setOrigin] = useState("");
  const [budget, setBudget] = useState<(typeof budgets)[number] | null>(null);
  const [currency, setCurrency] = useState("EUR");
  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"offline" | "unknown" | null>(null);

  useEffect(() => {
    void getProfile().then((result) => {
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCitizenships(result.data.citizenships);
      setOrigin(result.data.country_of_origin ?? "");
      setBudget(result.data.budget_band as (typeof budgets)[number] | null);
      setCurrency(result.data.budget_currency ?? "EUR");
      setSelectedPayers(result.data.payers);
    });
  }, []);

  function togglePayer(value: string) {
    setSelectedPayers((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function finish(skip = false) {
    setError(null);
    if (skip) {
      router.replace("/(tabs)/programs");
      return;
    }
    setSaving(true);
    const result = await updateProfile({
      citizenships,
      country_of_origin: origin || null,
      budget_band: budget,
      budget_currency: budget ? currency : null,
      payers: selectedPayers,
      setup_step: 2,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/(tabs)/programs");
  }

  return (
    <ProfileSetupLayout
      step={2}
      footer={
        <>
          {error && <FormError text={t(`errors.${error}`)} />}
          <Button label={t("profile.funding.showPrograms")} onPress={() => void finish()} loading={saving} />
          <Pressable accessibilityRole="button" accessibilityLabel={t("profile.funding.skip")} onPress={() => void finish(true)} style={styles.skip}>
            <Text style={styles.skipText}>{t("profile.funding.skip")}</Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.intro}>
        <Text style={styles.title}>{t("profile.funding.title")}</Text>
        <Text style={styles.subtitle}>{t("profile.funding.subtitle")}</Text>
      </View>
      {loading ? <Text style={styles.subtitle}>{t("profile.funding.loading")}</Text> : (
        <>
          <Text style={styles.section}>{t("profile.funding.from")}</Text>
          <Text style={styles.label}>{t("profile.funding.citizenship")}</Text>
          <View style={styles.chips}>{countries.map((code) => (
            <Choice key={code} label={t(`profile.citizenships.${code}`)} selected={citizenships[0] === code} onPress={() => setCitizenships([code, ...citizenships.slice(1)])} />
          ))}</View>
          <Pressable accessibilityRole="button" onPress={() => setCitizenships((current) => current.length < 2 ? [...current, ""] : current)} style={styles.add}>
            <Text style={styles.addText}>{t("profile.funding.addCitizenship")}</Text>
          </Pressable>
          {citizenships.length > 1 && (
            <>
              <Text style={styles.label}>{t("profile.funding.secondCitizenship")}</Text>
              <View style={styles.chips}>{countries.map((code) => (
                <Choice key={code} label={t(`profile.citizenships.${code}`)} selected={citizenships[1] === code} onPress={() => setCitizenships([citizenships[0], code])} />
              ))}</View>
            </>
          )}
          <Text style={styles.label}>{t("profile.funding.origin")}</Text>
          <View style={styles.chips}>{countries.map((code) => (
            <Choice key={code} label={t(`profile.countries.${code}`)} selected={origin === code} onPress={() => setOrigin(code)} />
          ))}</View>
          <View style={styles.info}><Text style={styles.infoText}>{t("profile.funding.euInfo")}</Text></View>
          <Text style={styles.section}>{t("profile.funding.budgetSection")}</Text>
          <View style={styles.budgetHeader}><Text style={styles.label}>{t("profile.funding.budget")}</Text><View style={styles.currencyChips}>{currencies.map((value) => <Choice key={value} label={value} selected={currency === value} onPress={() => setCurrency(value)} />)}</View></View>
          <View style={styles.chips}>{budgets.map((value) => <Choice key={value} label={t(`profile.funding.budgets.${value}`)} selected={budget === value} onPress={() => setBudget(value)} />)}</View>
          <Text style={styles.hint}>{t("profile.funding.livingCosts")}</Text>
          <Text style={styles.label}>{t("profile.funding.payer")}</Text>
          <View style={styles.chips}>{payers.map((value) => <Choice key={value} label={t(`profile.funding.payers.${value}`)} selected={selectedPayers.includes(value)} onPress={() => togglePayer(value)} />)}</View>
          <View style={styles.scholarship}><Text style={styles.scholarshipText}>{t("profile.funding.scholarshipHint")}</Text></View>
        </>
      )}
    </ProfileSetupLayout>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  intro: { gap: spacing.md },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  section: { ...typography.overline, color: colors.textSecondary, marginTop: spacing.md },
  label: { ...typography.label, color: colors.text },
  add: { paddingVertical: spacing.sm },
  addText: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  info: { padding: spacing.lg, borderRadius: radius.md, borderWidth: layout.borderWidth, borderColor: colors.infoBannerBorder, backgroundColor: colors.infoBannerBg },
  infoText: { ...typography.body, color: colors.infoBannerText },
  budgetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  currencyChips: { flexDirection: "row", gap: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: { minHeight: 40, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: layout.borderWidth, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: "center" },
  choiceSelected: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  choiceText: { ...typography.bodySmall, color: colors.textSecondary },
  choiceTextSelected: { ...typography.bodyStrong, color: colors.link },
  hint: { ...typography.bodySmall, color: colors.textMuted },
  scholarship: { padding: spacing.lg, borderRadius: radius.md, borderWidth: layout.borderWidth, borderColor: colors.primaryBannerBorder, backgroundColor: colors.primaryBannerBg },
  scholarshipText: { ...typography.body, color: colors.warningSoftText },
  skip: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  skipText: { ...typography.bodyStrong, color: colors.link },
});
