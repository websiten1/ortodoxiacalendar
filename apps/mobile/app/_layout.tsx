import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="parohie/[id]" options={{ title: "Profil parohie" }} />
    </Stack>
  );
}
