// AI-assisted (Claude Code): sheet 12d over Checklist 12: pick one of the student's PDFs of a kind from My Profile, or upload a new one (also saved to My Profile), then attach it with "Use selected file".
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { FormError } from "@/components/Message";
import { pickAndUploadDocument, type DocumentError, type DocumentKind, type UserDocument } from "@/data/documents";
import { shortDate } from "@/format";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

type Props = {
  kind: DocumentKind | null; // null = closed
  subtitle: string; // "For MIT · Master of Business Analytics"
  documents: UserDocument[]; // the student's files of this kind not yet attached to this application
  onUploaded: (document: UserDocument) => void;
  onUse: (document: UserDocument) => Promise<boolean>; // true when attached; the sheet then closes
  onClose: () => void;
};

// created_at is a timestamp: show the student's own calendar day.
function uploadedOn(createdAt: string): string {
  const d = new Date(createdAt);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return shortDate(iso);
}

export function FilePickerSheet({ kind, subtitle, documents, onUploaded, onUse, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [error, setError] = useState<DocumentError | "attach" | null>(null);

  // Each opening starts clean, with the newest file preselected. Reset during render when the kind changes
  // (React's pattern for state derived from a prop), so the sheet never shows the previous selection first.
  const [openedFor, setOpenedFor] = useState<DocumentKind | null>(null);
  if (kind !== openedFor) {
    setOpenedFor(kind);
    if (kind) {
      setSelected(documents[0]?.id ?? null);
      setError(null);
    }
  }

  async function upload() {
    if (!kind) return;
    setError(null);
    setUploading(true);
    const result = await pickAndUploadDocument(kind);
    setUploading(false);
    if (!result.ok) return setError(result.error);
    if (!result.data) return;
    onUploaded(result.data);
    setSelected(result.data.id);
  }

  async function use() {
    const document = documents.find((d) => d.id === selected);
    if (!document) return;
    setError(null);
    setAttaching(true);
    const attached = await onUse(document);
    setAttaching(false);
    if (!attached) setError("attach");
  }

  const busy = uploading || attaching;

  return (
    <Modal visible={kind !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.sheet} edges={["bottom"]}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.title} accessibilityRole="header">{kind ? t(`checklist.picker.title.${kind}`) : ""}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t("checklist.picker.close")} onPress={onClose} style={styles.close}>
            <SymbolView name="xmark" tintColor={colors.text} size={18} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {documents.length > 0 && (
            <>
              <Text style={styles.overline}>{t("checklist.picker.fromProfile")}</Text>
              <View style={styles.list}>
                {documents.map((document, index) => {
                  const isSelected = document.id === selected;
                  return (
                    <Pressable
                      key={document.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={document.file_name}
                      onPress={() => setSelected(document.id)}
                      style={({ pressed }) => [styles.row, index > 0 && styles.rowDivider, isSelected && styles.rowSelected, pressed && styles.pressed]}
                    >
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <SymbolView name="doc" tintColor={colors.errorText} size={sizes.icon} />
                      <View style={styles.flex}>
                        <Text style={styles.fileName} numberOfLines={1}>{document.file_name}</Text>
                        <Text style={styles.meta}>{t("checklist.picker.uploaded", { date: uploadedOn(document.created_at) })}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.or}>
                <View style={styles.line} />
                <Text style={styles.meta}>{t("checklist.picker.or")}</Text>
                <View style={styles.line} />
              </View>
            </>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy, busy: uploading }}
            disabled={busy}
            onPress={() => void upload()}
            style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}
          >
            {uploading ? (
              <ActivityIndicator color={colors.link} />
            ) : (
              <>
                <SymbolView name="arrow.up.to.line" tintColor={colors.link} size={18} />
                <Text style={styles.uploadText}>{t("checklist.picker.upload")}</Text>
              </>
            )}
          </Pressable>
          <Text style={[styles.meta, styles.center]}>{t("checklist.picker.hint")}</Text>

          {error && (
            <FormError text={error === "attach" ? t("checklist.picker.attachFailed") : t(`profile.my.documents.errors.${error}`)} />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button label={t("checklist.picker.use")} onPress={() => void use()} disabled={!selected || uploading} loading={attaching} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.sheetTitle, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
  close: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  content: { paddingHorizontal: layout.screenPaddingX, paddingBottom: spacing.lg, gap: spacing.md },
  overline: { ...typography.overline, color: colors.textMuted, marginTop: spacing.sm },
  list: {
    borderRadius: radius.xl,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, minHeight: sizes.touchTarget },
  rowDivider: { borderTopWidth: layout.borderWidth, borderTopColor: colors.border },
  rowSelected: { backgroundColor: colors.surfaceRaised },
  pressed: { opacity: 0.8 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.control,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: colors.accent },
  fileName: { ...typography.bodyStrong, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  center: { textAlign: "center" },
  or: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  line: { flex: 1, height: layout.borderWidth, backgroundColor: colors.border },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: sizes.button,
    borderRadius: radius.lg,
    borderWidth: layout.borderWidth,
    borderColor: colors.accent,
  },
  uploadText: { ...typography.button, color: colors.link },
  footer: { paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.sm, paddingBottom: spacing.md },
});
