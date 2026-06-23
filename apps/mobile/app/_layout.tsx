import { Stack } from "expo-router";
import { AuthProvider } from "../lib/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="parohie/[id]" options={{ title: "Profil parohie" }} />
      </Stack>
    </AuthProvider>
  );
}
