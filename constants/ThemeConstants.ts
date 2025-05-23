// constants/ThemeConstants.ts
import { ThemeColors as AppThemeColorsFromColorsFile, useThemeColors } from './Colors'; // Umbenannt zur Klarheit in diesem Kontext
import { Fonts as AppFonts, FontSizes as AppFontSizes } from './Typography';

export interface AppTheme {
  fonts: {
    primary: string;
    primaryMedium: string;
    secondary: string;
    secondaryMedium: string;
  };
  fontSizes: {
    hero: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    button: number;
  };
  colors: AppThemeColorsFromColorsFile & { // Erweitert unsere Standard ThemeColors
    // Spezifische Aliase oder zusätzliche Farbdefinitionen, die von portiertem Code erwartet werden
    background: string; // <<-- HIER HINZUFÜGEN (wird auf primaryBackground gemappt)
    cardBackground: string;
    floatingElementBackground: string;
    primaryAccent: string;
    secondaryAccent: string;
    tertiaryAccent: string;
    destructiveAction: string;
    positiveAction: string;
    modalBackground: string;
    iconColor: string;
    titleText: string;
    highlightText: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl?: number; // Optional, falls von deinem alten Theme verwendet
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill?: number; // Optional, falls von deinem alten Theme verwendet
  };
}

export function useAppTheme(): AppTheme {
  const currentColors = useThemeColors(); // Holt Light/Dark Mode Farben aus Colors.ts

  return {
    fonts: {
      primary: AppFonts.OpenSans.Bold,
      primaryMedium: AppFonts.OpenSans.SemiBold,
      secondary: AppFonts.OpenSans.Regular,
      secondaryMedium: AppFonts.OpenSans.SemiBold,
    },
    fontSizes: {
      hero: AppFontSizes.h1 + 6,
      h1: AppFontSizes.h1,
      h2: AppFontSizes.h2,
      h3: AppFontSizes.body + 2,
      body: AppFontSizes.body,
      caption: AppFontSizes.caption,
      button: AppFontSizes.button,
    },
    colors: {
      ...currentColors, // Übernimmt alle Farben aus unserem Colors.ts (primaryBackground, primaryText, accent etc.)
      
      // Explizites Mapping für 'background', das von deinem alten Code erwartet wird
      background: currentColors.primaryBackground, // <<-- HIER MAPPEN

      // Spezifische Farbnamen, die dein alter Screen verwendet oder Aliase
      cardBackground: currentColors.surface,
      floatingElementBackground: currentColors.surface, // Ggf. anpassen, falls es eine andere Farbe sein soll
      primaryAccent: currentColors.accent,
      secondaryAccent: currentColors.accent, // Kann auch eine andere Farbe aus Tints sein, z.B. ein helleres Blau
      tertiaryAccent: currentColors.borderColor,
      destructiveAction: currentColors.error,
      positiveAction: '#34C759', // Beispiel Grün - idealerweise in Colors.ts definieren und hier referenzieren
      modalBackground: currentColors.surface, // Für Modals, kann auch leicht anders sein als primaryBackground
      iconColor: currentColors.secondaryText, // Oder primaryText, je nach Kontrastbedarf
      titleText: currentColors.primaryText,
      highlightText: currentColors.accent,
    },
    spacing: { // Standardisierte Abstände, ggf. um xxl erweitern
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48, // Beispiel für xxl, falls dein altes Theme es hatte
    },
    borderRadius: { // Standardisierte Eckenradien, ggf. um pill erweitern
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      pill: 999, // Für komplett runde Buttons/Elemente
    },
  };
}