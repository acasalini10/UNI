// AI-assisted (Claude Code): screen 2, academic profile setup with typed profile persistence; country pickers with search, translated scale labels, GMAT/GRE choice and start-date chips.
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { CountryPicker } from "@/components/CountryPicker";
import { FormError } from "@/components/Message";
import { ProfileSetupLayout } from "@/components/ProfileSetupLayout";
import { TextField } from "@/components/TextField";
import { getProfile, updateProfile } from "@/data/profile";
import { t } from "@/i18n";
import { colors, layout, radius, spacing, typography } from "@/theme";

const scales = ["10", "4.0", "100", "30", "uk_class", "other"] as const;
const ukClasses = ["first", "2:1", "2:2", "third"] as const;
const tests = ["none", "gmat", "gre"] as const;
type Scale = (typeof scales)[number];
type Test = (typeof tests)[number];

// Master's programs start in September or January. Offer the next four intakes that are at least
// six months away, so there is still time to apply. Values are "YYYY-MM".
function upcomingIntakes(today = new Date()): string[] {
  const earliest = new Date(today.getFullYear(), today.getMonth() + 6, 1);
  const intakes: string[] = [];
  for (let year = earliest.getFullYear(); intakes.length < 4; year++) {
    for (const month of [1, 9]) {
      if (new Date(year, month - 1, 1) >= earliest && intakes.length < 4) {
        intakes.push(`${year}-${String(month).padStart(2, "0")}`);
      }
    }
  }
  return intakes;
}

function intakeLabel(value: string): string {
  const [year, month] = value.split("-");
  return t("profile.setup.intake", { month: t(`months.${Number(month)}`), year });
}

export default function ProfileSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [residence, setResidence] = useState<string[]>([]);
  const [university, setUniversity] = useState("");
  const [studies, setStudies] = useState("");
  const [fields, setFields] = useState("");
  const [grade, setGrade] = useState("");
  const [scale, setScale] = useState<Scale>("10");
  const [gradeClass, setGradeClass] = useState("");
  const [ielts, setIelts] = useState("");
  const [testType, setTestType] = useState<Test>("none");
  const [testScore, setTestScore] = useState("");
  const [targets, setTargets] = useState<string[]>([]);
  const [plannedStart, setPlannedStart] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"offline" | "unknown" | "invalid" | null>(null);

  // A start saved earlier stays selectable even when it is no longer among the next intakes.
  const intakes = useMemo(() => {
    const next = upcomingIntakes();
    return plannedStart && !next.includes(plannedStart) ? [plannedStart, ...next] : next;
  }, [plannedStart]);

  useEffect(() => {
    void getProfile().then((result) => {
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const profile = result.data;
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setResidence(profile.country_of_residence ? [profile.country_of_residence] : []);
      setUniversity(profile.current_university ?? "");
      setStudies(profile.current_studies ?? "");
      setFields(profile.fields.join(", "));
      setGrade(profile.grade?.toString() ?? "");
      setScale((profile.grade_scale as Scale | null) ?? "10");
      setGradeClass(profile.grade_class ?? "");
      setIelts(profile.ielts?.toString() ?? "");
      setTestType((profile.test_type as Test | null) ?? "none");
      setTestScore(profile.test_score?.toString() ?? "");
      setTargets(profile.target_countries);
      setPlannedStart(profile.planned_start?.slice(0, 7) ?? "");
    });
  }, []);

  const canContinue =
    !loading &&
    [firstName, lastName, university, studies, fields].every((value) => value.trim()) &&
    residence.length === 1 &&
    targets.length > 0 &&
    plannedStart.length > 0 &&
    (scale === "uk_class" ? gradeClass.length > 0 : grade.trim().length > 0) &&
    (testType === "none" || testScore.trim().length > 0);

  async function onContinue() {
    if (!canContinue) {
      setError("invalid");
      return;
    }
    setError(null);
    setSaving(true);
    const result = await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      country_of_residence: residence[0],
      current_university: university.trim(),
      current_studies: studies.trim(),
      fields: fields.split(",").map((value) => value.trim()).filter(Boolean),
      grade: scale === "uk_class" ? null : Number(grade.replace(",", ".")),
      grade_class: scale === "uk_class" ? gradeClass : null,
      grade_scale: scale,
      ielts: ielts.trim() ? Number(ielts.replace(",", ".")) : null,
      test_type: testType === "none" ? null : testType,
      test_score: testType === "none" ? null : Number(testScore),
      target_countries: targets,
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
            <View style={styles.half}>
              <TextField label={t("profile.setup.firstName")} value={firstName} onChangeText={setFirstName} textContentType="givenName" />
            </View>
            <View style={styles.half}>
              <TextField label={t("profile.setup.lastName")} value={lastName} onChangeText={setLastName} textContentType="familyName" />
            </View>
          </View>
          <CountryPicker label={t("profile.setup.residence")} value={residence} onChange={setResidence} />
          <TextField label={t("profile.setup.university")} value={university} onChangeText={setUniversity} />
          <TextField label={t("profile.setup.studying")} value={studies} onChangeText={setStudies} />

          <Text style={styles.section}>{t("profile.setup.masters")}</Text>
          <TextField label={t("profile.setup.fields")} value={fields} onChangeText={setFields} placeholder={t("profile.setup.fieldsPlaceholder")} />

          <Text style={styles.label}>{t("profile.setup.scale")}</Text>
          <View style={styles.chips}>
            {scales.map((value) => (
              <Choice key={value} label={t(`profile.scales.${value}`)} selected={scale === value} onPress={() => setScale(value)} />
            ))}
          </View>
          {scale === "uk_class" ? (
            <>
              <Text style={styles.label}>{t("profile.setup.grade")}</Text>
              <View style={styles.chips}>
                {ukClasses.map((value) => (
                  <Choice key={value} label={t(`profile.ukClasses.${value}`)} selected={gradeClass === value} onPress={() => setGradeClass(value)} />
                ))}
              </View>
            </>
          ) : (
            <TextField
              label={t("profile.setup.grade")}
              value={grade}
              onChangeText={setGrade}
              placeholder={t(`profile.gradePlaceholders.${scale}`)}
              keyboardType="decimal-pad"
            />
          )}
          <Text style={styles.hint}>{t("profile.setup.gradeHint")}</Text>

          <TextField label={t("profile.setup.english")} value={ielts} onChangeText={setIelts} placeholder={t("profile.setup.englishPlaceholder")} keyboardType="decimal-pad" />
          <Text style={styles.hint}>{t("profile.setup.englishHint")}</Text>

          <Text style={styles.label}>{t("profile.setup.test")}</Text>
          <View style={styles.chips}>
            {tests.map((value) => (
              <Choice
                key={value}
                label={t(`profile.tests.${value}`)}
                selected={testType === value}
                onPress={() => {
                  setTestType(value);
                  if (value === "none") setTestScore("");
                }}
              />
            ))}
          </View>
          {testType !== "none" && (
            <TextField
              label={t(`profile.setup.testScore.${testType}`)}
              value={testScore}
              onChangeText={setTestScore}
              placeholder={t(`profile.setup.testScorePlaceholder.${testType}`)}
              keyboardType="number-pad"
            />
          )}
          <Text style={styles.hint}>{t("profile.setup.testHint")}</Text>

          <CountryPicker label={t("profile.setup.targets")} value={targets} onChange={setTargets} max={3} />

          <Text style={styles.label}>{t("profile.setup.start")}</Text>
          <View style={styles.chips}>
            {intakes.map((value) => (
              <Choice key={value} label={intakeLabel(value)} selected={plannedStart === value} onPress={() => setPlannedStart(value)} />
            ))}
          </View>
          {plannedStart.length > 0 && (
            <View style={styles.deadline}>
              <Text style={styles.deadlineText}>
                {t(plannedStart.endsWith("-01") ? "profile.setup.deadlineJanuary" : "profile.setup.deadlineSeptember")}
              </Text>
            </View>
          )}
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
  half: { flex: 1 },
  label: { ...typography.label, color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: { minHeight: 40, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: layout.borderWidth, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: "center" },
  choiceSelected: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  choiceText: { ...typography.bodySmall, color: colors.textSecondary },
  choiceTextSelected: { ...typography.bodyStrong, color: colors.link },
  hint: { ...typography.bodySmall, color: colors.textMuted },
  deadline: { padding: spacing.md, borderRadius: radius.md, borderWidth: layout.borderWidth, borderColor: colors.primaryBannerBorder, backgroundColor: colors.primaryBannerBg },
  deadlineText: { ...typography.bodySmall, color: colors.warningSoftText },
});
