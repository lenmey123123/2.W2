import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton'; // Optional for main menu later
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';
import { useGame } from '../contexts/GameContext';

export default function GameOverScreen() {
  const router = useRouter();
  const Colors = useThemeColors();
  const { resetGame } = useGame();
  const dynamicStyles = makeStyles(Colors);

  const handleNewGame = () => {
    resetGame();
    router.replace('/setup-step1');
  };

  return (
    <ScreenWrapper style={dynamicStyles.container}>
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title} allowFontScaling={true}>Spiel beendet</Text>
        <Text style={dynamicStyles.subtitle} allowFontScaling={true}>
            Danke fürs Spielen!
        </Text>
      </View>
      
      <View style={dynamicStyles.buttonContainer}>
        <PrimaryButton
          title="Neues Spiel"
          onPress={handleNewGame}
          accessibilityLabel="Ein komplett neues Spiel starten"
        />
        {/* Optional:
        <SecondaryButton
          title="Hauptmenü"
          onPress={() => router.replace('/')} // Assuming '/' is main menu
          style={{ marginTop: 15 }}
          accessibilityLabel="Zurück zum Hauptmenü"
        />
        */}
      </View>
    </ScreenWrapper>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: Fonts.OpenSans.Bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    color: Colors.primaryText,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontFamily: Fonts.OpenSans.Regular,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
});