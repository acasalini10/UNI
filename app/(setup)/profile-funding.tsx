// AI-assisted (Claude Code): screen 2b, optional budget and funding profile setup; citizenship and origin with the searchable country picker; display currency (also used for the budget), default from the country of residence.
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { CountryPicker } from "@/components/CountryPicker";
import { CurrencyPicker } from "@/components/CurrencyPicker";
import { FormError } from "@/components/Message";
import { ProfileSetupLayout } from "@/components/ProfileSetupLayout";
import { displayCurrency, getProfile, updateProfile } from "@/data/profile";
import { t } from "@/i18n";
import { colors, layout, radius, spacing, typography } from "@/theme";

const budgets = ["under_10k", "10k_25k", "25k_50k", "over_50k", "not_sure"] as const;
const payers = ["me", "family", "scholarship", "loan", "not_sure"] as const;

export default function ProfileFunding() {
  const [citizenship, setCitizenship] = useState<string[]>([]);
  const [secondCitizenship, setSecondCitizenship] = useState<string[]>([]);
  const [showSecond, setShowSecond] = useState(false);
  const [origin, setOrigin] = useState<string[]>([]);
  const [budget, setBudget] = useState<(typeof budgets)[number] | null>(null);
  const [currency, setCurrency] = useState("USD");
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
      // Older saves could hold an empty second citizenship: drop it.
      const [first, second] = result.data.citizenships.filter(Boolean);
      setCitizenship(first ? [first] : []);
      setSecondCitizenship(second ? [second] : []);
      setShowSecond(Boolean(second));
      setOrigin(result.data.country_of_origin ? [result.data.country_of_origin] : []);
      setBudget(result.data.budget_band as (typeof budgets)[number] | null);
      setCurrency(displayCurrency(result.data));
      setSelectedPayers(result.data.payers);
    });
  }, []);

  function togglePayer(value: string) {
    setSelectedPayers((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function removeSecond() {
    setSecondCitizenship([]);
    setShowSecond(false);
  }

  async function finish(skip = false) {
    setError(null);
    if (skip) {
      router.replace("/(tabs)/programs");
      return;
    }
    setSaving(true);
    // Only real picks are saved; the same country twice counts once.
    const citizenships = [...new Set([...citizenship, ...secondCitizenship])];
    const result = await updateProfile({
      citizenships,
      country_of_origin: origin[0] ?? null,
      budget_band: budget,
      currency,
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
          <CountryPicker label={t("profile.funding.citizenship")} value={citizenship} onChange={setCitizenship} />
          {showSecond ? (
            <>
              <CountryPicker label={t("profile.funding.secondCitizenship")} value={secondCitizenship} onChange={setSecondCitizenship} />
              <Pressable accessibilityRole="button" onPress={removeSecond} style={styles.add}>
                <Text style={styles.addText}>{t("profile.funding.removeCitizenship")}</Text>
              </Pressable>
            </>
          ) : (
            citizenship.length > 0 && (
              <Pressable accessibilityRole="button" onPress={() => setShowSecond(true)} style={styles.add}>
                <Text style={styles.addText}>{t("profile.funding.addCitizenship")}</Text>
              </Pressable>
            )
          )}
          <CountryPicker label={t("profile.funding.origin")} value={origin} onChange={setOrigin} />
          <View style={styles.info}><Text style={styles.infoText}>{t("profile.funding.euInfo")}</Text></View>
          <Text style={styles.section}>{t("profile.funding.budgetSection")}</Text>
          <CurrencyPicker label={t("profile.currency.label")} hint={t("profile.currency.hint")} value={currency} onChange={setCurrency} />
          <Text style={styles.label}>{t("profile.funding.budget", { currency })}</Text>
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
  add: { paddingVertical: spacing.sm, minHeight: 44, justifyContent: "center" },
  addText: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  info: { padding: spacing.lg, borderRadius: radius.md, borderWidth: layout.borderWidth, borderColor: colors.infoBannerBorder, backgroundColor: colors.infoBannerBg },
  infoText: { ...typography.body, color: colors.infoBannerText },
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
