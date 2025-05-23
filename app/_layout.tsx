// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { GameProvider } from '../contexts/GameContext'; // Pfad ggf. anpassen
import { useFonts, OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold });
  useEffect(() => { if (fontsLoaded || fontError) SplashScreen.hideAsync(); }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;

  return (
    <GameProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="setup" /> {/* NEUE HAUPT-SETUP-ROUTE */}
        {/* Alte Setup-Routen können entfernt oder auskommentiert werden, wenn setup.tsx alles handhabt */}
        {/* <Stack.Screen name="setup-step1" /> */}
        {/* <Stack.Screen name="setup-step2" /> */}
        {/* <Stack.Screen name="setup-step3" /> */}
        <Stack.Screen name="role-reveal-github" />
        <Stack.Screen name="game-play" />
        <Stack.Screen name="results" />
        <Stack.Screen name="game-over" />
      </Stack>
    </GameProvider>
  );
}