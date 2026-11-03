// AI-assisted (Claude Code): tappable inline link text ("Change", "Forgot password?") with a 44 pt touch area.
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, spacing, typography } from "@/theme";

type Props = {
  label: string;
  onPress: () => void;
  underline?: boolean;
  disabled?: boolean;
};

export function TextLink({ label, onPress, underline = false, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: spacing.md, bottom: spacing.md, left: spacing.sm, right: spacing.sm }}
    >
      {({ pressed }) => (
        <Text style={[styles.text, underline && styles.underline, pressed && styles.pressed]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.label,
    color: colors.link,
  },
  underline: {
    ...typography.body,
    textDecorationLine: "underline",
  },
  pressed: {
    color: colors.linkPressed,
  },
});
