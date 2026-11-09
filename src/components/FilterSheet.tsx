// AI-assisted (Claude Code): filter chip that opens a bottom sheet with options; single choice closes on pick, multiple choice toggles.
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

export type FilterOption = { value: string; label: string };

type Props = {
  title: string;
  chipText: string; // what the chip shows, e.g. "Country: Spain, Italy"
  active: boolean;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
};

export function FilterSheet({ title, chipText, active, options, selected, onChange, multiple = false }: Props) {
  const [open, setOpen] = useState(false);

  function onPick(value: string) {
    if (!multiple) {
      onChange([value]);
      setOpen(false);
      return;
    }
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={chipText}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>{chipText}</Text>
        <SymbolView name="chevron.down" tintColor={active ? colors.link : colors.textSecondary} size={14} />
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {multiple && selected.length > 0 && (
              <Pressable accessibilityRole="button" onPress={() => onChange([])} hitSlop={spacing.md}>
                <Text style={styles.clear}>{t("programs.filters.clear")}</Text>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={spacing.md}>
              <Text style={styles.done}>{t("countryPicker.done")}</Text>
            </Pressable>
          </View>
          <ScrollView>
            {options.map(({ value, label }) => {
              const isSelected = selected.includes(value);
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onPick(value)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>{label}</Text>
                  {isSelected && <SymbolView name="checkmark" tintColor={colors.link} size={sizes.icon} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: sizes.chip,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
    borderColor: colors.borderStrong,
  },
  chipActive: { borderColor: colors.accent, borderWidth: layout.borderWidthSelected, backgroundColor: colors.accentTint },
  chipText: { ...typography.bodySmall, color: colors.textSecondary, flexShrink: 1 },
  chipTextActive: { ...typography.chip, color: colors.link },
  pressed: { opacity: 0.7 },
  sheet: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.sheetTitle, flex: 1, color: colors.text },
  clear: { ...typography.bodyStrong, color: colors.textMuted },
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
