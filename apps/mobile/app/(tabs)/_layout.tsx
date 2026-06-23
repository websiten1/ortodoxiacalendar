import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Descoperă" }} />
      <Tabs.Screen name="calendarul-meu" options={{ title: "Calendarul meu" }} />
      <Tabs.Screen name="setari" options={{ title: "Setări" }} />
    </Tabs>
  );
}
