// AI-assisted (Claude Code): shared layout for the sign-in screens: optional back + logo header, scrolling content, footer pinned above the keyboard.
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/Logo";
import { t } from "@/i18n";
import { colors, layout, sizes, spacing } from "@/theme";

type Props = {
  // Screens 1b, 1c and 1d show a back arrow with the logo centred; screen 1 shows the logo with its name.
  showBack?: boolean;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({ showBack = false, children, footer }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showBack ? (
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.back")}
                onPress={() => router.back()}
                style={styles.back}
              >
                <SymbolView name="chevron.left" tintColor={colors.text} size={sizes.icon} />
              </Pressable>
              <Logo />
              <View style={styles.back} />
            </View>
          ) : (
            <View style={styles.brand}>
              <Logo withName />
            </View>
          )}
          <View style={styles.body}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
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
  brand: {
    paddingTop: layout.screenPaddingTop,
  },
  body: {
    flex: 1,
    paddingTop: spacing.xxxl,
    gap: layout.sectionGap,
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
});
