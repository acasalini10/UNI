// AI-assisted (Copilot): added the title-only Profile tab.
// AI-assisted (Claude Code): replaced the dev-only sign out with a gear that opens Settings 13; added the display currency row, saved on change.
import { SymbolView } from "expo-symbols";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrencyPicker } from "@/components/CurrencyPicker";
import { FormError } from "@/components/Message";
import { displayCurrency, getProfile, updateProfile } from "@/data/profile";
import { t } from "@/i18n";
import { colors, layout, sizes, spacing, typography } from "@/theme";

export default function Profile() {
  const [currency, setCurrency] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"offline" | "unknown" | null>(null);

  // Read again on focus: 2b or another device may have changed the currency.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getProfile().then((result) => {
        if (!active) return;
        if (result.ok) setCurrency(displayCurrency(result.data));
        else setError(result.error);
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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("tabs.profile")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("settings.title")}
          onPress={() => router.push("/settings")}
          style={styles.gear}
        >
          <SymbolView name="gearshape" tintColor={colors.text} size={sizes.icon} />
        </Pressable>
      </View>
      <View style={styles.container}>
        {currency && (
          <CurrencyPicker
            label={t("profile.currency.label")}
            hint={t("profile.currency.hint")}
            value={currency}
            onChange={(code) => void changeCurrency(code)}
            disabled={saving}
          />
        )}
        {error && <FormError text={t(`errors.${error}`)} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
  container: {
    flex: 1,
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
});
