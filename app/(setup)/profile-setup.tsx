// AI-assisted (Claude Code): screen 2, academic profile setup with typed profile persistence.
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormError } from "@/components/Message";
import { ProfileSetupLayout } from "@/components/ProfileSetupLayout";
import { TextField } from "@/components/TextField";
import { getProfile, updateProfile } from "@/data/profile";
import { t } from "@/i18n";
import { colors, layout, radius, spacing, typography } from "@/theme";

const countries = ["US", "GB", "CH", "DE", "NL"] as const;
const scales = ["10", "4.0", "100", "30", "uk_class", "other"] as const;
const targets = countries;

function parseTest(value: string): { testType: "gmat" | "gre" | null; testScore: number | null } {
  const match = value.match(/(gmat|gre)[^\d]*(\d+)/i);
  if (!match) return { testType: null, testScore: null };
  return { testType: match[1].toLowerCase() as "gmat" | "gre", testScore: Number(match[2]) };
}

export default function ProfileSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [residence, setResidence] = useState("");
  const [university, setUniversity] = useState("");
  const [studies, setStudies] = useState("");
  const [fields, setFields] = useState("");
  const [grade, setGrade] = useState("");
  const [scale, setScale] = useState<(typeof scales)[number]>("10");
  const [gradeClass, setGradeClass] = useState("");
  const [ielts, setIelts] = useState("");
  const [test, setTest] = useState("");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [plannedStart, setPlannedStart] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"offline" | "unknown" | "invalid" | null>(null);

  useEffect(() => {
    void getProfile().then((result) => {
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFirstName(result.data.first_name ?? "");
      setLastName(result.data.last_name ?? "");
      setResidence(result.data.country_of_residence ?? "");
      setUniversity(result.data.current_university ?? "");
      setStudies(result.data.current_studies ?? "");
      setFields(result.data.fields.join(", "));
      setGrade(result.data.grade?.toString() ?? "");
      setScale((result.data.grade_scale as (typeof scales)[number]) ?? "10");
      setGradeClass(result.data.grade_class ?? "");
      setIelts(result.data.ielts?.toString() ?? "");
      setTest(result.data.test_type && result.data.test_score ? `${result.data.test_type.toUpperCase()} ${result.data.test_score}` : "");
      setSelectedTargets(result.data.target_countries);
      setPlannedStart(result.data.planned_start?.slice(0, 7) ?? "");
    });
  }, []);

  const canContinue = useMemo(
    () =>
      !loading &&
      [firstName, lastName, residence, university, studies, fields, plannedStart].every((value) => value.trim()) &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(plannedStart) &&
      selectedTargets.length > 0 &&
      ((scale === "uk_class" && gradeClass.length > 0) || (scale !== "uk_class" && grade.trim().length > 0)),
    [fields, firstName, grade, gradeClass, lastName, loading, plannedStart, residence, scale, selectedTargets, studies, university],
  );

  function toggleTarget(code: string) {
    setSelectedTargets((current) =>
      current.includes(code) ? current.filter((value) => value !== code) : current.length < 3 ? [...current, code] : current,
    );
  }

  async function onContinue() {
    if (!canContinue) {
      setError("invalid");
      return;
    }
    setError(null);
    setSaving(true);
    const parsedTest = parseTest(test);
    const result = await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      country_of_residence: residence,
      current_university: university.trim(),
      current_studies: studies.trim(),
      fields: fields.split(",").map((value) => value.trim()).filter(Boolean),
      grade: scale === "uk_class" ? null : Number(grade),
      grade_class: scale === "uk_class" ? gradeClass : null,
      grade_scale: scale,
      ielts: ielts.trim() ? Number(ielts) : null,
      test_type: parsedTest.testType,
      test_score: parsedTest.testScore,
      target_countries: selectedTargets,
      planned_start: `${plannedStart}-01`,
      setup_step: 1,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/profile-funding");
  }

  return (
    <ProfileSetupLayout
      step={1}
      footer={
        <>
          {error && <FormError text={error === "invalid" ? t("profile.setup.required") : t(`errors.${error}`)} />}
          <Button label={t("profile.setup.continue")} onPress={onContinue} disabled={!canContinue} loading={saving} />
        </>
      }
    >
      <View style={styles.intro}>
        <Text style={styles.title}>{t("profile.setup.title")}</Text>
        <Text style={styles.subtitle}>{t("profile.setup.subtitle")}</Text>
      </View>
      {loading ? (
        <Text style={styles.subtitle}>{t("profile.setup.loading")}</Text>
      ) : (
        <>
          <Text style={styles.section}>{t("profile.setup.aboutYou")}</Text>
          <View style={styles.row}>
            <TextField label={t("profile.setup.firstName")} value={firstName} onChangeText={setFirstName} />
            <TextField label={t("profile.setup.lastName")} value={lastName} onChangeText={setLastName} />
          </View>
          <Text style={styles.label}>{t("profile.setup.residence")}</Text>
          <View style={styles.chips}>{countries.map((code) => (
            <Choice key={code} label={t(`profile.countries.${code}`)} selected={residence === code} onPress={() => setResidence(code)} />
          ))}</View>
          <TextField label={t("profile.setup.university")} value={university} onChangeText={setUniversity} />
          <TextField label={t("profile.setup.studying")} value={studies} onChangeText={setStudies} />
          <Text style={styles.section}>{t("profile.setup.masters")}</Text>
          <TextField label={t("profile.setup.fields")} value={fields} onChangeText={setFields} placeholder={t("profile.setup.fieldsPlaceholder")} />
          <View style={styles.row}>
            <TextField label={t("profile.setup.grade")} value={grade} onChangeText={setGrade} keyboardType="decimal-pad" />
            <View style={styles.choiceColumn}>
              <Text style={styles.label}>{t("profile.setup.scale")}</Text>
              <View style={styles.chips}>{scales.map((value) => (
                <Choice key={value} label={value} selected={scale === value} onPress={() => setScale(value)} />
              ))}</View>
            </View>
          </View>
          {scale === "uk_class" && (
            <View style={styles.chips}>{["first", "2:1", "2:2", "third"].map((value) => (
              <Choice key={value} label={value} selected={gradeClass === value} onPress={() => setGradeClass(value)} />
            ))}</View>
          )}
          <Text style={styles.hint}>{t("profile.setup.gradeHint")}</Text>
          <TextField label={t("profile.setup.english")} value={ielts} onChangeText={setIelts} placeholder={t("profile.setup.englishPlaceholder")} keyboardType="decimal-pad" />
          <TextField label={t("profile.setup.test")} value={test} onChangeText={setTest} placeholder={t("profile.setup.testPlaceholder")} />
          <Text style={styles.hint}>{t("profile.setup.testHint")}</Text>
          <Text style={styles.label}>{t("profile.setup.targets")}</Text>
          <View style={styles.chips}>{targets.map((code) => (
            <Choice key={code} label={t(`profile.countries.${code}`)} selected={selectedTargets.includes(code)} onPress={() => toggleTarget(code)} />
          ))}</View>
          <TextField label={t("profile.setup.start")} value={plannedStart} onChangeText={setPlannedStart} placeholder={t("profile.setup.startPlaceholder")} />
          <View style={styles.deadline}><Text style={styles.deadlineText}>{t("profile.setup.deadline")}</Text></View>
        </>
      )}
    </ProfileSetupLayout>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: { gap: spacing.md },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  section: { ...typography.overline, color: colors.textSecondary, marginTop: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  label: { ...typography.label, color: colors.text },
  choiceColumn: { flex: 1, gap: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: { minHeight: 40, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: layout.borderWidth, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: "center" },
  choiceSelected: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  choiceText: { ...typography.bodySmall, color: colors.textSecondary },
  choiceTextSelected: { ...typography.bodyStrong, color: colors.link },
  hint: { ...typography.bodySmall, color: colors.textMuted },
  deadline: { padding: spacing.md, borderRadius: radius.md, borderWidth: layout.borderWidth, borderColor: colors.primaryBannerBorder, backgroundColor: colors.primaryBannerBg },
  deadlineText: { ...typography.bodySmall, color: colors.warningSoftText },
});
