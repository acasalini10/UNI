// AI-assisted (Claude Code): country field that opens a searchable sheet with every country; single choice, or several up to `max`.
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { countryCodes, countryName, normalizeForSearch } from "@/countries";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

type Props = {
  label: string;
  value: string[];
  onChange: (codes: string[]) => void;
  // 1 = single choice: picking a country closes the sheet.
  max?: number;
};

export function CountryPicker({ label, value, onChange, max = 1 }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const multiple = max > 1;

  // Sorted by the translated name, so the order follows the app language.
  const sorted = useMemo(
    () =>
      countryCodes
        .map((code) => ({ code, name: countryName(code) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const results = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return sorted;
    return sorted.filter(({ code, name }) => normalizeForSearch(name).includes(q) || code.toLowerCase() === q);
  }, [query, sorted]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function onPick(code: string) {
    if (!multiple) {
      onChange([code]);
      close();
      return;
    }
    if (value.includes(code)) onChange(value.filter((item) => item !== code));
    else if (value.length < max) onChange([...value, code]);
  }

  const summary = value.map(countryName).join(", ");

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: summary }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !summary && styles.placeholder]} numberOfLines={1}>
          {summary || t("countryPicker.placeholder")}
        </Text>
        <SymbolView name="chevron.down" tintColor={colors.textMuted} size={sizes.icon} />
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{label}</Text>
            <Pressable accessibilityRole="button" onPress={close} hitSlop={spacing.md}>
              <Text style={styles.done}>{t("countryPicker.done")}</Text>
            </Pressable>
          </View>
          <View style={styles.search}>
            <SymbolView name="magnifyingglass" tintColor={colors.textMuted} size={sizes.icon} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("countryPicker.search")}
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.accent}
              accessibilityLabel={t("countryPicker.search")}
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={styles.searchInput}
            />
          </View>
          {multiple && <Text style={styles.count}>{t("countryPicker.selected", { selectedCount: value.length, max })}</Text>}
          <FlatList
            data={results}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={20}
            ListEmptyComponent={<Text style={styles.empty}>{t("countryPicker.noResults")}</Text>}
            renderItem={({ item }) => {
              const selected = value.includes(item.code);
              const disabled = multiple && !selected && value.length >= max;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => onPick(item.code)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.rowDisabled]}
                >
                  <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{item.name}</Text>
                  {selected && <SymbolView name="checkmark" tintColor={colors.link} size={sizes.icon} />}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
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
  placeholder: { color: colors.placeholder },
  pressed: { opacity: 0.7 },
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
  search: {
    height: sizes.input,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: layout.screenPaddingX,
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchInput: { ...typography.input, flex: 1, height: "100%", color: colors.text, paddingRight: spacing.md },
  count: { ...typography.small, color: colors.textMuted, paddingHorizontal: layout.screenPaddingX, paddingBottom: spacing.sm },
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
  rowDisabled: { opacity: 0.4 },
  rowText: { ...typography.body, color: colors.text },
  rowTextSelected: { ...typography.bodyStrong, color: colors.link },
  empty: { ...typography.body, color: colors.textMuted, textAlign: "center", padding: spacing.xxl },
});
