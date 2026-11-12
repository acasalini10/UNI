// AI-assisted (Claude Code): field that opens a searchable sheet (extracted from CountryPicker). Single choice, or several up to `max`. Options are filtered on the phone (`options`) or fetched as the student types (`search`, debounced). Optional last row always visible (e.g. "Other").
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { normalizeForSearch } from "@/countries";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

export type PickerOption = {
  value: string;
  label: string;
  detail?: string; // small second line, e.g. the field's area or the university's country
  searchText?: string; // normalized text matched by the search; defaults to the label
  key?: string; // list key when two options share a value
};

export type SearchResult = { ok: true; options: PickerOption[] } | { ok: false };

type Props = {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  summary: string; // text shown in the closed field
  placeholder: string;
  searchPlaceholder: string;
  noResults: string;
  // 1 = single choice: picking an option closes the sheet.
  max?: number;
  options?: PickerOption[];
  // Remote search, called after a pause in typing once the query has `minQueryLength` characters.
  search?: (query: string) => Promise<SearchResult>;
  minQueryLength?: number;
  typeToSearch?: string; // shown before the query is long enough
  // Last row, always visible; tapping it closes the sheet.
  footer?: { label: string; onPress: () => void };
};

const DEBOUNCE_MS = 300;

export function SearchPicker({
  label,
  value,
  onChange,
  summary,
  placeholder,
  searchPlaceholder,
  noResults,
  max = 1,
  options,
  search,
  minQueryLength = 2,
  typeToSearch,
  footer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<{ query: string; result: SearchResult } | null>(null);
  const multiple = max > 1;
  const trimmed = query.trim();
  const remoteReady = Boolean(search) && trimmed.length >= minQueryLength;

  const localResults = useMemo(() => {
    if (!options) return [];
    const words = normalizeForSearch(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return options;
    return options.filter((option) => {
      const text = option.searchText ?? normalizeForSearch(option.label);
      return words.every((word) => text.includes(word));
    });
  }, [options, query]);

  // Remote search: wait for a pause in typing; a late answer for an older query is ignored.
  useEffect(() => {
    if (!search || !remoteReady) return;
    let active = true;
    const timer = setTimeout(() => {
      void search(trimmed).then((result) => {
        if (active) setRemote({ query: trimmed, result });
      });
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, remoteReady, trimmed]);

  const remoteCurrent = remote && remote.query === trimmed ? remote.result : null;
  const loading = remoteReady && !remoteCurrent;
  const results = search ? (remoteReady && remoteCurrent?.ok ? remoteCurrent.options : []) : localResults;

  let message: string | null = null;
  if (search && !remoteReady) message = typeToSearch ?? null;
  else if (remoteCurrent && !remoteCurrent.ok) message = t("errors.offline");
  else if (!loading && results.length === 0) message = noResults;

  function close() {
    setOpen(false);
    setQuery("");
  }

  function onPick(picked: string) {
    if (!multiple) {
      onChange([picked]);
      close();
      return;
    }
    if (value.includes(picked)) onChange(value.filter((item) => item !== picked));
    else if (value.length < max) onChange([...value, picked]);
  }

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
          {summary || placeholder}
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
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.accent}
              accessibilityLabel={searchPlaceholder}
              autoCorrect={false}
              autoFocus={Boolean(search)}
              clearButtonMode="while-editing"
              style={styles.searchInput}
            />
            {loading && <ActivityIndicator color={colors.textMuted} style={styles.spinner} />}
          </View>
          {multiple && <Text style={styles.count}>{t("countryPicker.selected", { selectedCount: value.length, max })}</Text>}
          <FlatList
            data={results}
            keyExtractor={(item) => item.key ?? item.value}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={20}
            ListHeaderComponent={message ? <Text style={styles.empty}>{message}</Text> : undefined}
            ListFooterComponent={
              footer ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    close();
                    footer.onPress();
                  }}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <Text style={styles.footerText}>{footer.label}</Text>
                  <SymbolView name="square.and.pencil" tintColor={colors.link} size={sizes.icon} />
                </Pressable>
              ) : undefined
            }
            renderItem={({ item }) => {
              const selected = value.includes(item.value);
              const disabled = multiple && !selected && value.length >= max;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => onPick(item.value)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.rowDisabled]}
                >
                  <View style={styles.rowTexts}>
                    <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{item.label}</Text>
                    {item.detail && <Text style={styles.rowDetail}>{item.detail}</Text>}
                  </View>
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
  spinner: { marginRight: spacing.md },
  count: { ...typography.small, color: colors.textMuted, paddingHorizontal: layout.screenPaddingX, paddingBottom: spacing.sm },
  row: {
    minHeight: sizes.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    borderBottomWidth: layout.borderWidth,
    borderBottomColor: colors.border,
  },
  rowDisabled: { opacity: 0.4 },
  rowTexts: { flex: 1, gap: spacing.xxs },
  rowText: { ...typography.body, color: colors.text },
  rowTextSelected: { ...typography.bodyStrong, color: colors.link },
  rowDetail: { ...typography.small, color: colors.textMuted },
  footerText: { ...typography.bodyStrong, color: colors.link, flex: 1 },
  empty: { ...typography.body, color: colors.textMuted, textAlign: "center", padding: spacing.xxl },
});
