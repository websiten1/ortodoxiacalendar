import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors, fonts } from "../../lib/theme";

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={{ fontSize: 18, color: focused ? colors.crimson : colors.inkFaint }}>{symbol}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontFamily: fonts.display, color: colors.ink, fontSize: 20 },
        tabBarActiveTintColor: colors.crimson,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderAlt
        },
        tabBarLabelStyle: { fontFamily: fonts.bodySemiBold, fontSize: 11 }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Descoperă", tabBarIcon: ({ focused }) => <TabIcon symbol="⌂" focused={focused} /> }}
      />
      <Tabs.Screen
        name="calendarul-meu"
        options={{ title: "Calendarul meu", tabBarIcon: ({ focused }) => <TabIcon symbol="▦" focused={focused} /> }}
      />
      <Tabs.Screen
        name="setari"
        options={{ title: "Setări", tabBarIcon: ({ focused }) => <TabIcon symbol="☰" focused={focused} /> }}
      />
    </Tabs>
  );
}
