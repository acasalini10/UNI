// AI-assisted (Copilot): added the four-tab navigation layout with themed SF Symbol icons.
import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { t } from "@/i18n";
import { colors, layout, sizes, typography } from "@/theme";

type TabName = "programs" | "applications" | "feedback" | "profile";

const icons = {
  programs: { active: "square.grid.2x2.fill", inactive: "square.grid.2x2" },
  applications: { active: "doc.text.fill", inactive: "doc.text" },
  feedback: { active: "sparkles", inactive: "sparkles" },
  profile: { active: "person.fill", inactive: "person" },
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const tabName = route.name as TabName;
        const icon = icons[tabName];

        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarIcon: ({ focused }) => (
            <SymbolView
              name={focused ? icon.active : icon.inactive}
              tintColor={focused ? colors.primary : colors.textMuted}
              size={sizes.icon}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.tabActive : styles.tab}>
              {t(`tabs.${tabName}`)}
            </Text>
          ),
        };
      }}
    >
      <Tabs.Screen name="programs" />
      <Tabs.Screen name="applications" />
      <Tabs.Screen name="feedback" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.border,
    borderTopWidth: layout.borderWidth,
  },
  tabBarItem: {
    height: sizes.tabBarItem,
  },
  tab: {
    ...typography.tab,
    color: colors.textMuted,
  },
  tabActive: {
    ...typography.tabActive,
    color: colors.primary,
  },
});
