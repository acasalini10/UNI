// AI-assisted (Claude Code): Add a university 9: live search by name or city (accent insensitive), result rows open University's master's 10; no match, loading and offline states.
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { InitialsBadge } from "@/components/InitialsBadge";
import { countryName } from "@/countries";
import { listUniversities, searchUniversities, type DataError, type University } from "@/data/applications";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

export default function AddUniversity() {
  const [universities, setUniversities] = useState<University[] | null>(null);
  const [error, setError] = useState<DataError | null>(null);
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);

  // 24 universities in v1: load them once and filter on the phone, so results update on every key.
  useEffect(() => {
    let active = true;
    void listUniversities().then((result) => {
      if (!active) return;
      if (result.ok) setUniversities(result.data);
      else setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [attempt]);

  const results = useMemo(() => (universities ? searchUniversities(universities, query) : []), [universities, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">{t("applications.search.title")}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={spacing.md}>
          <Text style={styles.link}>{t("applications.search.cancel")}</Text>
        </Pressable>
      </View>

      <View style={styles.searchBlock}>
        <Text style={styles.overline}>{t("applications.search.label")}</Text>
        <View style={styles.field}>
          <SymbolView name="magnifyingglass" tintColor={colors.link} size={sizes.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel={t("applications.search.label")}
            placeholder={t("applications.search.placeholder")}
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.accent}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel={t("applications.search.clear")} onPress={() => setQuery("")} style={styles.clear}>
              <SymbolView name="xmark" tintColor={colors.textMuted} size={18} />
            </Pressable>
          )}
        </View>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>{t(`errors.${error}`)}</Text>
          <Button
            label={t("programs.retry")}
            onPress={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          />
        </View>
      ) : !universities ? (
        <View style={styles.center}><ActivityIndicator color={colors.textMuted} /></View>
      ) : (
        <FlatList<University>
          data={results}
          keyExtractor={(u) => u.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            results.length > 0 ? <Text style={styles.count}>{t("applications.search.results", { count: results.length })}</Text> : undefined
          }
          ListEmptyComponent={<Text style={styles.noMatch}>{t("applications.search.noMatch")}</Text>}
          renderItem={({ item, index }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.city}`}
              onPress={() => router.push({ pathname: "/university/[id]", params: { id: item.id } })}
              style={({ pressed }) => [
                styles.row,
                index === 0 && styles.rowFirst,
                index === results.length - 1 && styles.rowLast,
                index > 0 && styles.rowDivider,
                pressed && styles.pressed,
              ]}
            >
              <InitialsBadge initials={item.initials} color={item.brand_color} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.city}, {countryName(item.country)}</Text>
              </View>
              <SymbolView name="chevron.right" tintColor={colors.textMuted} size={16} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.lg,
  },
  title: { ...typography.sheetTitle, color: colors.text },
  link: { ...typography.bodyStrong, color: colors.link, textDecorationLine: "underline" },
  searchBlock: { gap: spacing.sm, paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.xl },
  overline: { ...typography.overline, color: colors.textMuted },
  field: {
    height: sizes.input,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: spacing.lg,
    borderRadius: radius.md,
    borderWidth: layout.borderWidthSelected,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  input: { ...typography.input, flex: 1, height: "100%", color: colors.text },
  clear: { width: sizes.touchTarget, height: sizes.touchTarget, alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.lg, paddingBottom: layout.screenPaddingBottom },
  count: { ...typography.bodySmall, color: colors.textMuted, paddingBottom: spacing.md },
  noMatch: { ...typography.body, color: colors.textMuted, textAlign: "center", paddingTop: spacing.xxl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: layout.cardPadding,
    backgroundColor: colors.surface,
    borderLeftWidth: layout.borderWidth,
    borderRightWidth: layout.borderWidth,
    borderColor: colors.border,
  },
  rowFirst: { borderTopWidth: layout.borderWidth, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  rowLast: { borderBottomWidth: layout.borderWidth, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  rowDivider: { borderTopWidth: layout.borderWidth },
  pressed: { opacity: 0.8 },
  rowText: { flex: 1, gap: spacing.xxs },
  name: { ...typography.cardTitle, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textMuted },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: layout.screenPaddingX },
  stateTitle: { ...typography.bodyStrong, color: colors.text, textAlign: "center" },
});
