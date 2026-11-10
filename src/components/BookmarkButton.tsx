// AI-assisted (Claude Code): bookmark that adds a program to Applications or removes it; asks first when the application is past Saved.
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

import { addApplication, removeApplication, type ApplicationStatus } from "@/data/applications";
import { t } from "@/i18n";
import { colors, radius, sizes } from "@/theme";

type Props = {
  programId: string;
  status: ApplicationStatus | undefined; // undefined = not in Applications
  onChange: (status: ApplicationStatus | undefined) => void;
};

export function BookmarkButton({ programId, status, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const saved = status !== undefined;

  async function run(action: () => Promise<{ ok: boolean }>, next: ApplicationStatus | undefined) {
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (result.ok) onChange(next);
    else Alert.alert(t("applications.bookmark.failed"));
  }

  function press() {
    if (!saved) return void run(() => addApplication(programId), "saved");
    if (status === "saved") return void run(() => removeApplication(programId), undefined);
    Alert.alert(t("applications.bookmark.confirmTitle"), t("applications.bookmark.confirmBody", { status: t(`applications.status.${status}`) }), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("applications.bookmark.confirmRemove"), style: "destructive", onPress: () => void run(() => removeApplication(programId), undefined) },
    ]);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(saved ? "applications.bookmark.remove" : "applications.bookmark.add")}
      accessibilityState={{ selected: saved, busy }}
      disabled={busy}
      onPress={press}
      hitSlop={4}
      style={styles.circle}
    >
      {busy ? (
        <ActivityIndicator color={colors.textMuted} />
      ) : (
        <SymbolView name={saved ? "bookmark.fill" : "bookmark"} tintColor={saved ? colors.primary : colors.text} size={sizes.icon} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
