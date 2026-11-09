// AI-assisted (Claude Code): currency field that opens a sheet with the currencies in rates.json; single choice.
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { currencyOptions } from "@/data/profile";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export function CurrencyPicker({ label, hint, value, onChange, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const summary = `${value} · ${t(`currencies.${value}`, { defaultValue: value })}`;

  function onPick(code: string) {
    setOpen(false);
    if (code !== value) onChange(code);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: summary }}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.field, pressed && styles.pressed, disabled && styles.disabled]}
      >
        <Text style={styles.value} numberOfLines={1}>{summary}</Text>
        <SymbolView name="chevron.down" tintColor={colors.textMuted} size={sizes.icon} />
      </Pressable>
      {hint && <Text style={styles.hint}>{hint}</Text>}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{label}</Text>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={spacing.md}>
              <Text style={styles.done}>{t("countryPicker.done")}</Text>
            </Pressable>
          </View>
          <ScrollView>
            {currencyOptions.map((code) => {
              const selected = code === value;
              return (
                <Pressable
                  key={code}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onPick(code)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <Text style={[styles.rowText, selected && styles.rowTextSelected]}>
                    {code} · {t(`currencies.${code}`, { defaultValue: code })}
                  </Text>
                  {selected && <SymbolView name="checkmark" tintColor={colors.link} size={sizes.icon} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  hint: { ...typography.bodySmall, color: colors.textMuted },
  field: {
    height: sizes.input,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  value: { ...typography.input, flex: 1, color: colors.text },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  sheet: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.sheetTitle, flex: 1, color: colors.text },
  done: { ...typography.bodyStrong, color: colors.link },
  row: {
    minHeight: sizes.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    borderBottomWidth: layout.borderWidth,
    borderBottomColor: colors.border,
  },
  rowText: { ...typography.body, color: colors.text },
  rowTextSelected: { ...typography.bodyStrong, color: colors.link },
});
