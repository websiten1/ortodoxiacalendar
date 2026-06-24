export const colors = {
  parchment: "#f4f1ea",
  screenBg: "#ffffff",
  ink: "#2c2620",
  inkMuted: "#5a5046",
  inkFaint: "#9a8268",
  inkFaintAlt: "#8a7458",
  crimson: "#7a1f2b",
  crimsonHover: "#6a1a24",
  crimsonTextOn: "#f6ecd6",
  crimsonTint: "#f6e8e6",
  gold: "#c9a24b",
  goldBright: "#e8c66a",
  surface: "#fdfcf8",
  surfaceAlt: "#fafaf7",
  border: "#e0d8c6",
  borderAlt: "#efece4",
  borderStrong: "#d8cfbb",
  sundayRed: "#b9322f",
  ordinaryBlue: "#2c4a8a",
  fastBg: "#ece6f5",
  fastText: "#6a4ea0",
  upcomingText: "#b9892f",
  upcomingBg: "#faf2df",
  upcomingBorder: "#f0e6cf",
  placeholder: "#b3a892",
  priestBg: "#2c2620"
} as const;

export const fonts = {
  display: "Marcellus_400Regular",
  reading: "Spectral_500Medium",
  readingSemiBold: "Spectral_600SemiBold",
  body: "HankenGrotesk_400Regular",
  bodyMedium: "HankenGrotesk_500Medium",
  bodySemiBold: "HankenGrotesk_600SemiBold",
  bodyBold: "HankenGrotesk_700Bold",
  bodyExtraBold: "HankenGrotesk_800ExtraBold"
} as const;

export const radii = {
  sm: 6,
  md: 11,
  lg: 16,
  pill: 999
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 40
} as const;

export const shadows = {
  actionGlow: {
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4
  }
} as const;
