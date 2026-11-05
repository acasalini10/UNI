// AI-assisted (Claude Code): shared shell for the two profile setup screens; Back hidden when there is no previous screen.
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/Logo";
import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

type Props = {
  step: 1 | 2;
  children: ReactNode;
  footer: ReactNode;
};

export function ProfileSetupLayout({ step, children, footer }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {/* First setup starts here with nothing behind it: no Back, an empty slot keeps the logo centered. */}
            {router.canGoBack() ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.back")}
                onPress={() => router.back()}
                style={styles.back}
              >
                <SymbolView name="chevron.left" tintColor={colors.text} size={sizes.icon} />
              </Pressable>
            ) : (
              <View style={styles.back} />
            )}
            <Logo />
            <Text style={styles.step}>{step}/2</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progress, { width: step === 1 ? "50%" : "100%" }]} />
          </View>
          <View style={styles.body}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
    paddingBottom: layout.screenPaddingBottom,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    justifyContent: "center",
  },
  step: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 5,
    marginTop: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  body: {
    paddingTop: spacing.xxxl,
    gap: layout.sectionGap,
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
});
