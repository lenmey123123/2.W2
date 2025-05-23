// app/results.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router'; // useLocalSearchParams für reasonKey
import ScreenWrapper from '../components/ScreenWrapper'; // Pfad anpassen
import PrimaryButton from '../components/PrimaryButton'; // Pfad anpassen
import { useThemeColors, ThemeColors } from '../constants/Colors'; // Pfad anpassen
import { Fonts, FontSizes, LineHeights } from '../constants/Typography'; // Pfad anpassen
import { useGame } from '../contexts/GameContext'; // Pfad anpassen
import { Player } from '../types/game'; // Pfad anpassen
import { t } from '../constants/TempTranslations'; // Pfad anpassen

export default function ResultsScreen() {
  const router = useRouter();
  const Colors = useThemeColors();
  const { gameState, getImposter, endGame } = useGame();
  const dynamicStyles = makeStyles(Colors);
  const [imposter, setImposter] = useState<Player | undefined>(undefined);

  // Der GameScreen könnte einen Grund für das Rundenende übergeben
  // const params = useLocalSearchParams<{ reasonKey?: string }>();
  // const reasonKey = params.reasonKey;

  useEffect(() => {
    const foundImposter = getImposter();
    setImposter(foundImposter);
    console.log('[ResultsScreen] Imposter was:', foundImposter?.name);
    // console.log('[ResultsScreen] Round ended because of:', reasonKey ? t(reasonKey, {defaultValue: "Unbekannter Grund"}) : "Timer abgelaufen");
  }, [getImposter, gameState.players]); // Abhängigkeit von gameState.players, falls sich diese ändern könnten

  const handleNextAction = () => {
    endGame(); // Setzt Phase auf GameOver
    router.replace('/game-over');
  };
  
  const getEndReasonText = () => {
    // Hier könntest du den reasonKey verwenden, falls er übergeben wird,
    // um spezifischere Nachrichten anzuzeigen. Vorerst eine generische Nachricht.
    if (gameState.timerValue <= 0) {
        return t('resolutionScreen.timerEnded', {defaultValue: "Die Zeit ist um!"});
    }
    // Wenn ein `reasonKey` von `goToResolutionPhase` übergeben würde, könnte man ihn hier nutzen:
    // if (reasonKey) return t(reasonKey);
    return t('resolutionScreen.roundOver', {defaultValue: "Die Runde ist vorbei!"});
  }

  return (
    <ScreenWrapper style={dynamicStyles.container}>
      <Stack.Screen options={{ title: t('resultsScreen.title', {defaultValue: "Rundenende"}) }} />
      <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
        <Text style={dynamicStyles.title} allowFontScaling={true}>
          {getEndReasonText()}
        </Text>
        
        {imposter ? (
          <View style={dynamicStyles.imposterRevealBox}>
            <Text style={dynamicStyles.imposterLabel} allowFontScaling={true}>
              {t('resultsScreen.imposterWas', {defaultValue: "Der Erzfeind war:"})}
            </Text>
            <Text style={dynamicStyles.imposterName} allowFontScaling={true}>{imposter.name}</Text>
          </View>
        ) : (
          <Text style={dynamicStyles.outcomeText}>
            {t('resultsScreen.noImposterFound', {defaultValue: "Es gab keinen Erzfeind in dieser Runde."})}
          </Text>
        )}
         <View style={dynamicStyles.wordRevealBox}>
            <Text style={dynamicStyles.wordRevealLabel} allowFontScaling={true}>
                {t('resultsScreen.theWordWas', {defaultValue: "Das geheime Wort war:"})}
            </Text>
            <Text style={dynamicStyles.revealedWord} allowFontScaling={true}>{gameState.currentWord}</Text>
        </View>
        {/* Da kein Voting stattfindet, gibt es kein "gewonnen/verloren" Urteil hier */}

      </ScrollView>
      
      <View style={dynamicStyles.buttonContainer}>
        <PrimaryButton
          title={t('resultsScreen.continueToGameOver', {defaultValue: "Spiel beenden"})}
          onPress={handleNextAction}
        />
      </View>
    </ScreenWrapper>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.OpenSans.Bold,
    fontSize: FontSizes.h1,
    color: Colors.primaryText,
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  imposterRevealBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    width: '90%',
    maxWidth: 380,
    shadowColor: Colors.primaryText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imposterLabel: {
    fontFamily: Fonts.OpenSans.Regular,
    fontSize: FontSizes.body,
    color: Colors.secondaryText,
  },
  imposterName: {
    fontFamily: Fonts.OpenSans.Bold,
    fontSize: FontSizes.h1 - 2,
    color: Colors.accent,
    marginTop: 5,
  },
  wordRevealBox: {
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
  },
  wordRevealLabel: {
    fontFamily: Fonts.OpenSans.Regular,
    fontSize: FontSizes.caption,
    color: Colors.secondaryText,
  },
  revealedWord: {
    fontFamily: Fonts.OpenSans.SemiBold,
    fontSize: FontSizes.h2,
    color: Colors.primaryText,
    marginTop: 4,
  },
  outcomeText: {
    fontFamily: Fonts.OpenSans.SemiBold,
    fontSize: FontSizes.h2 - 2,
    color: Colors.primaryText,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    backgroundColor: Colors.primaryBackground,
  },
});