import { useColorScheme } from 'react-native';

export const Tints = {
  light: {
    primaryBackground: '#F8F9FA',
    primaryText: '#1A1A1A',
    accent: '#007AFF',
    accentText: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceText: '#1A1A1A',
    secondaryText: '#6B7280',
    disabled: '#D1D5DB',
    disabledText: '#9CA3AF',
    error: '#DC2626',
    borderColor: '#E5E7EB',
    cardBackground: '#FFFFFF',
    icon: '#6B7280',
    selectedItem: '#E0EFFF',
    ripple: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primaryBackground: '#121212',
    primaryText: '#E0E0E0',
    accent: '#0A84FF',
    accentText: '#FFFFFF',
    surface: '#1E1E1E',
    surfaceText: '#E0E0E0',
    secondaryText: '#9CA3AF',
    disabled: '#4B5563',
    disabledText: '#717171',
    error: '#F87171',
    borderColor: '#3A3A3C',
    cardBackground: '#1E1E1E',
    icon: '#9CA3AF',
    selectedItem: '#003C6E',
    ripple: 'rgba(255, 255, 255, 0.1)',
  },
};

export type ThemeColors = typeof Tints.light;

export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? Tints.dark : Tints.light;
}

export const Colors = {
  light: Tints.light,
  dark: Tints.dark,
};