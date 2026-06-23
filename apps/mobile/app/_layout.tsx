import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold } from "@expo-google-fonts/hanken-grotesk";
import { Marcellus_400Regular } from "@expo-google-fonts/marcellus";
import { Spectral_500Medium, Spectral_600SemiBold } from "@expo-google-fonts/spectral";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { View } from "react-native";
import { AuthProvider } from "../lib/auth-context";
import { colors, fonts } from "../lib/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Marcellus_400Regular,
    Spectral_500Medium,
    Spectral_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.parchment }} />;
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="parohie/[id]"
          options={{
            title: "Profil parohie",
            headerStyle: { backgroundColor: colors.surface },
            headerTitleStyle: { fontFamily: fonts.display, color: colors.ink },
            headerTintColor: colors.crimson
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
