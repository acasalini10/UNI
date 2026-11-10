// AI-assisted (Copilot): added the title-only Profile tab.
// AI-assisted (Claude Code): replaced the dev-only sign out with a gear that opens Settings 13; added the display currency row, saved on change. My Profile 5: identity, academic and funding summaries with Edit (2 and 2b in edit mode), per-kind PDF upload with status.
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrencyPicker } from "@/components/CurrencyPicker";
import { Logo } from "@/components/Logo";
import { FormError } from "@/components/Message";
import { countryName } from "@/countries";
import {
  documentKinds,
  listDocuments,
  pickAndUploadDocument,
  type DocumentError,
  type DocumentKind,
  type UserDocument,
} from "@/data/documents";
import { displayCurrency, getProfile, updateProfile, type Profile } from "@/data/profile";
import { monthYear, shortDate } from "@/format";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

const kindIcon: Record<DocumentKind, SymbolViewProps["name"]> = {
  cv: "doc.text",
  motivation_letter: "pencil.line",
  reference_letter: "envelope",
};

// The grade as the student entered it, on its own scale: "8.6 / 10", "87%", "Upper second (2:1)".
function gradeText(profile: Profile): string | null {
  const scale = profile.grade_scale;
  if (scale === "uk_class") return profile.grade_class ? t(`profile.ukClasses.${profile.grade_class}`) : null;
  if (profile.grade === null) return null;
  if (scale === "100") return `${profile.grade}%`;
  if (scale === "other" || !scale) return String(profile.grade);
  return `${profile.grade} / ${scale}`;
}

function initialsOf(profile: Profile): string {
  return [profile.first_name, profile.last_name].map((name) => name?.trim().charAt(0) ?? "").join("").toUpperCase();
}

function countries(codes: string[]): string | null {
  return codes.length ? codes.map(countryName).join(", ") : null;
}

export default function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<UserDocument[] | null>(null);
  const [documentsFailed, setDocumentsFailed] = useState(false);
  const [currency, setCurrency] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"offline" | "unknown" | null>(null);
  const [uploading, setUploading] = useState<DocumentKind | null>(null);
  const [uploadError, setUploadError] = useState<{ kind: DocumentKind; error: DocumentError } | null>(null);

  // Read again on focus: 2, 2b or another device may have changed the profile.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([getProfile(), listDocuments()]).then(([profileResult, documentsResult]) => {
        if (!active) return;
        if (profileResult.ok) {
          setProfile(profileResult.data);
          setCurrency(displayCurrency(profileResult.data));
          setError(null);
        } else {
          setError(profileResult.error);
        }
        setDocumentsFailed(!documentsResult.ok);
        if (documentsResult.ok) setDocuments(documentsResult.data);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  async function changeCurrency(code: string) {
    const previous = currency;
    setCurrency(code);
    setError(null);
    setSaving(true);
    const result = await updateProfile({ currency: code });
    setSaving(false);
    if (!result.ok) {
      setCurrency(previous);
      setError(result.error);
    }
  }

  async function upload(kind: DocumentKind) {
    setUploadError(null);
    setUploading(kind);
    const result = await pickAndUploadDocument(kind);
    setUploading(null);
    if (!result.ok) {
      setUploadError({ kind, error: result.error });
      return;
    }
    const added = result.data;
    if (added) setDocuments((current) => [added, ...(current ?? [])]);
  }

  const notAdded = t("profile.my.notAdded");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Logo withName />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("settings.title")}
          onPress={() => router.push("/settings")}
          style={styles.gear}
        >
          <SymbolView name="gearshape" tintColor={colors.text} size={sizes.icon} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && <FormError text={t(`errors.${error}`)} />}
        {!profile && !error && <ActivityIndicator color={colors.textMuted} style={styles.loading} />}

        {profile && (
          <>
            <View style={styles.identity}>
              {initialsOf(profile) !== "" && (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initialsOf(profile)}</Text>
                </View>
              )}
              <View style={styles.flex}>
                <Text style={styles.name}>{[profile.first_name, profile.last_name].filter(Boolean).join(" ")}</Text>
                <Text style={styles.meta}>{[profile.current_university, profile.current_studies].filter(Boolean).join(" · ")}</Text>
              </View>
            </View>

            <Section title={t("profile.my.academic")} onEdit={() => router.push("/profile-setup?edit=1")}>
              <Row label={t("profile.my.rows.grade")} value={gradeText(profile) ?? notAdded} first />
              <Row label={t("profile.my.rows.english")} value={profile.ielts !== null ? t("profile.my.ielts", { score: profile.ielts.toFixed(1) }) : notAdded} />
              {profile.test_type && profile.test_score !== null && (
                <Row
                  label={t("profile.my.rows.test")}
                  value={t("profile.my.testScore", { test: t(`profile.tests.${profile.test_type}`), score: profile.test_score })}
                />
              )}
              <Row label={t("profile.my.rows.fields")} value={profile.fields.join(", ") || notAdded} />
              <Row label={t("profile.my.rows.targets")} value={countries(profile.target_countries) ?? notAdded} />
              <Row label={t("profile.my.rows.start")} value={profile.planned_start ? monthYear(profile.planned_start) : notAdded} />
            </Section>

            <Section title={t("profile.my.funding")} onEdit={() => router.push("/profile-funding?edit=1")}>
              <Row label={t("profile.my.rows.citizenship")} value={countries(profile.citizenships) ?? notAdded} first />
              <Row label={t("profile.my.rows.origin")} value={profile.country_of_origin ? countryName(profile.country_of_origin) : notAdded} />
              <Row
                label={t("profile.my.rows.budget")}
                value={
                  !profile.budget_band
                    ? notAdded
                    : profile.budget_band === "not_sure"
                      ? t("profile.funding.budgets.not_sure")
                      : `${currency ?? ""} ${t(`profile.funding.budgets.${profile.budget_band}`)}`.trim()
                }
              />
              <Row
                label={t("profile.my.rows.payers")}
                value={profile.payers.map((payer) => t(`profile.funding.payers.${payer}`)).join(", ") || notAdded}
              />
            </Section>

            {currency && (
              <CurrencyPicker
                label={t("profile.currency.label")}
                hint={t("profile.currency.hint")}
                value={currency}
                onChange={(code) => void changeCurrency(code)}
                disabled={saving}
              />
            )}
          </>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.flex}>
            <Text style={styles.overline}>{t("profile.my.documents.title")}</Text>
            <Text style={styles.meta}>{t("profile.my.documents.hint")}</Text>
          </View>
        </View>
        {documentsFailed && <FormError text={t("profile.my.documents.loadFailed")} />}
        {documents &&
          documentKinds.map((kind) => (
            <DocumentRow
              key={kind}
              kind={kind}
              files={documents.filter((doc) => doc.kind === kind)}
              uploading={uploading === kind}
              disabled={uploading !== null}
              error={uploadError?.kind === kind ? uploadError.error : null}
              onUpload={() => void upload(kind)}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.overline, styles.flex]}>{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profile.my.editSection", { section: title })}
          onPress={onEdit}
          hitSlop={spacing.md}
        >
          <Text style={styles.link}>{t("profile.my.edit")}</Text>
        </Pressable>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  return (
    <View style={[styles.row, !first && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

type DocumentRowProps = {
  kind: DocumentKind;
  files: UserDocument[];
  uploading: boolean;
  disabled: boolean;
  error: DocumentError | null;
  onUpload: () => void;
};

function DocumentRow({ kind, files, uploading, disabled, error, onUpload }: DocumentRowProps) {
  const latest = files[0];
  const title = t(`profile.my.documents.kinds.${kind}`);
  // One CV is enough; letters are counted because programs ask for several.
  const status = !latest ? null : kind === "cv" ? t("profile.my.documents.ready") : t("profile.my.documents.count", { count: files.length });

  return (
    <View style={styles.docCard}>
      <View style={styles.docRow}>
        <View style={styles.iconTile}>
          <SymbolView name={kindIcon[kind]} tintColor={colors.link} size={sizes.icon} />
        </View>
        <View style={styles.flex}>
          <View style={styles.docTitleRow}>
            <Text style={styles.docTitle}>{title}</Text>
            {status && <Text style={kind === "cv" ? styles.statusReady : styles.statusCount}>{status}</Text>}
          </View>
          <Text style={styles.meta} numberOfLines={2}>
            {latest ? t("profile.my.documents.latest", { name: latest.file_name, date: shortDate(latest.created_at.slice(0, 10)) }) : t("profile.my.documents.none")}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profile.my.documents.uploadKind", { kind: title })}
          accessibilityState={{ disabled, busy: uploading }}
          onPress={onUpload}
          disabled={disabled}
          style={({ pressed }) => [styles.uploadButton, (pressed || disabled) && styles.uploadPressed]}
        >
          {uploading ? (
            <ActivityIndicator color={colors.link} />
          ) : (
            <>
              <SymbolView name="arrow.up.to.line" tintColor={colors.link} size={16} />
              <Text style={styles.uploadText}>{t("profile.my.documents.upload")}</Text>
            </>
          )}
        </Pressable>
      </View>
      {error && <FormError text={t(`profile.my.documents.errors.${error}`)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
  },
  gear: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: layout.screenPaddingBottom * 2,
  },
  loading: { paddingVertical: spacing.xxl },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...typography.price, color: colors.white },
  name: { ...typography.title, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  section: { gap: spacing.md, marginTop: spacing.sm },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  overline: { ...typography.overline, color: colors.textMuted },
  link: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  card: {
    paddingHorizontal: layout.cardPadding,
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.md },
  rowDivider: { borderTopWidth: layout.borderWidth, borderTopColor: colors.border },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.bodyStrong, color: colors.text, flexShrink: 1, textAlign: "right" },
  docCard: {
    padding: layout.cardPadding,
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  docRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconTile: {
    width: sizes.iconTile,
    height: sizes.iconTile,
    borderRadius: radius.sm,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  docTitleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: spacing.sm },
  docTitle: { ...typography.cardTitle, color: colors.text },
  statusReady: { ...typography.chip, color: colors.successText },
  statusCount: { ...typography.chip, color: colors.warningText },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
    minWidth: 96,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidthSelected,
    borderColor: colors.accent,
  },
  uploadPressed: { opacity: 0.6 },
  uploadText: { ...typography.chip, color: colors.link },
});
