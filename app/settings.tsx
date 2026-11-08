// AI-assisted (Claude Code): minimal Settings 13 with the account email, Terms and Privacy links, a real Log out and Delete account with a confirm alert; other rows wait for their features.
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authErrorMessage } from "@/components/authErrorMessage";
import { FormError } from "@/components/Message";
import { deleteAccount } from "@/data/account";
import { signOut } from "@/data/auth";
import { useSession } from "@/data/session";
import { t } from "@/i18n";
import { openLegalPage } from "@/legal";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

export default function Settings() {
  const { session } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = signingOut || deleting;

  async function onLogOut() {
    setSigningOut(true);
    setError(null);
    const result = await signOut();
    // On success the session guard in app/_layout.tsx sends the user to screen 1.
    if (!result.ok) {
      setSigningOut(false);
      setError(authErrorMessage(result.error));
    }
  }

  function confirmDelete() {
    Alert.alert(t("settings.deleteConfirmTitle"), t("settings.deleteConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("settings.deleteConfirmButton"), style: "destructive", onPress: () => void onDelete() },
    ]);
  }

  async function onDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteAccount();
    // On success the session is gone and the guard opens screen 1.
    if (!result.ok) {
      setDeleting(false);
      setError(authErrorMessage(result.error));
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <SymbolView name="chevron.left" tintColor={colors.text} size={sizes.icon} />
          </Pressable>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {t("settings.title")}
        </Text>

        <Text style={styles.groupLabel}>{t("settings.account")}</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t("settings.email")}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {session?.user.email ?? ""}
            </Text>
          </View>
        </View>

        <Text style={[styles.groupLabel, styles.groupSpacing]}>{t("settings.support")}</Text>
        <View style={styles.group}>
          <LinkRow label={t("settings.terms")} onPress={() => void openLegalPage("terms")} />
          <View style={styles.divider} />
          <LinkRow label={t("settings.privacy")} onPress={() => void openLegalPage("privacy")} />
        </View>

        <View style={styles.bottom}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("settings.logOut")}
            accessibilityState={{ disabled: busy, busy: signingOut }}
            disabled={busy}
            onPress={() => void onLogOut()}
            style={({ pressed }) => [styles.group, styles.logOut, pressed && styles.pressed]}
          >
            {signingOut ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.logOutText}>{t("settings.logOut")}</Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("settings.deleteAccount")}
            accessibilityState={{ disabled: busy, busy: deleting }}
            disabled={busy}
            onPress={confirmDelete}
            style={({ pressed }) => [styles.logOut, pressed && styles.pressed]}
          >
            {deleting ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={styles.deleteText}>{t("settings.deleteAccount")}</Text>
            )}
          </Pressable>
          {error && <FormError text={error} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <SymbolView name="chevron.right" tintColor={colors.textMuted} size={sizes.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
    paddingBottom: layout.screenPaddingBottom,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  back: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    justifyContent: "center",
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  groupLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  group: {
    borderRadius: radius.md,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: {
    minHeight: sizes.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  groupSpacing: {
    marginTop: spacing.xxl,
  },
  divider: {
    height: layout.borderWidth,
    backgroundColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  rowValue: {
    ...typography.body,
    flexShrink: 1,
    color: colors.textMuted,
  },
  bottom: {
    marginTop: spacing.xxxl,
    gap: spacing.md,
  },
  logOut: {
    minHeight: sizes.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  logOutText: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  deleteText: {
    ...typography.bodyStrong,
    color: colors.error,
  },
  pressed: {
    opacity: 0.7,
  },
});
