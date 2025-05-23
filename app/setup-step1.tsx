// app/setup-step1.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';
import { useGame } from '../contexts/GameContext';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;
const DEFAULT_PLAYERS = 4;
const DEFAULT_IMPOSTERS = 1;
const MIN_PLAYERS_FOR_TWO_IMPOSTERS = 6;

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  screenContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  headerContent: { width: '100%', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 30 : 20, paddingBottom: 10 },
  stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, height: 40 },
  stepDotBase: { marginHorizontal: 12, justifyContent: 'center', alignItems: 'center', width: 22, height: 22, borderRadius: 11 },
  stepDotInactive: { backgroundColor: Colors.disabled },
  stepDotActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 6 },
  stepTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.caption, color: Colors.primaryText }, // Theme-Farbe
  stepTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
  mainTitle: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 4, color: Colors.primaryText, textAlign: 'center' }, // Theme-Farbe
  mainInteractionAreaScroll: { flex: 1, width: '100%' },
  mainInteractionAreaContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 20 },
  playerCounterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 20, width: '90%', maxWidth: 320 },
  counterButton: { padding: 12 },
  playerCountText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 36, color: Colors.primaryText, textAlign: 'center', minWidth: 80 }, // Theme-Farbe
  playerCountInfo: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.caption, color: Colors.secondaryText, textAlign: 'center', marginBottom: 30 }, // Theme-Farbe
  imposterSelectorWrapper: { alignItems: 'center', marginVertical: 15, width: '100%' },
  imposterSelectorContainer: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 30, padding: 6, shadowColor: Colors.primaryText, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3, minHeight: 54 },
  imposterSegment: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  imposterSegmentActive: { backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 4 },
  imposterSegmentTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.body, color: Colors.primaryText }, // Theme-Farbe
  imposterSegmentTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
  imposterSegmentDisabled: { opacity: 0.4 },
  imposterSegmentTextDisabled: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.body, color: Colors.disabledText }, // Theme-Farbe
  imposterHintText: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.caption, fontStyle: 'italic', color: Colors.secondaryText, textAlign: 'center', marginTop: 12, paddingHorizontal: 20 }, // Theme-Farbe
  footerContent: { height: 80, justifyContent: 'center', alignItems: 'center' }, // Platzhalter für Swipe-Indikator später
  // footerButtonLarge, footerButtonDisabled ENTFERNT
});

interface StepIndicatorProps { currentStep: 1 | 2 | 3; theme: ThemeColors; }
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, theme }) => { /* ... (unverändert) ... */
  const styles = makeStyles(theme);
  return ( <View style={styles.stepIndicatorContainer}> {[1, 2, 3].map((step) => { const isActive = step === currentStep; return ( <View key={step} style={[styles.stepDotBase, isActive ? styles.stepDotActive : styles.stepDotInactive]}> <Text style={isActive ? styles.stepTextActive : styles.stepTextInactive}>{step}</Text> </View> ); })} </View> );
};
interface PlayerCounterProps { count: number; onIncrement: () => void; onDecrement: () => void; min: number; max: number; theme: ThemeColors; }
const PlayerCounter: React.FC<PlayerCounterProps> = ({ count, onIncrement, onDecrement, min, max, theme }) => { /* ... (unverändert) ... */
  const styles = makeStyles(theme);
  return ( <View style={styles.playerCounterContainer}> <TouchableOpacity style={styles.counterButton} onPress={onDecrement} disabled={count <= min} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}> <Ionicons name="remove-circle-sharp" size={60} color={count <= min ? theme.disabledText : theme.accent} /> </TouchableOpacity> <Text style={styles.playerCountText}>{count}</Text> <TouchableOpacity style={styles.counterButton} onPress={onIncrement} disabled={count >= max} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}> <Ionicons name="add-circle-sharp" size={60} color={count >= max ? theme.disabledText : theme.accent} /> </TouchableOpacity> </View> );
};
interface ImposterSelectorProps { selectedImposters: number; onSelect: (count: number) => void; playerCount: number; minPlayersForTwo: number; theme: ThemeColors; }
const ImposterSelector: React.FC<ImposterSelectorProps> = ({ selectedImposters, onSelect, playerCount, minPlayersForTwo, theme }) => { /* ... (unverändert) ... */
  const styles = makeStyles(theme); const canSelectTwo = playerCount >= minPlayersForTwo;
  return ( <View style={styles.imposterSelectorWrapper}> <View style={styles.imposterSelectorContainer}> <Pressable style={[styles.imposterSegment, selectedImposters === 1 && styles.imposterSegmentActive]} onPress={() => onSelect(1)}> <Text style={selectedImposters === 1 ? styles.imposterSegmentTextActive : styles.imposterSegmentTextInactive}>1 Imposter</Text> </Pressable> <Pressable style={[styles.imposterSegment, selectedImposters === 2 && canSelectTwo && styles.imposterSegmentActive, !canSelectTwo && styles.imposterSegmentDisabled]} onPress={() => { if (canSelectTwo) onSelect(2); }} disabled={!canSelectTwo}> <Text style={selectedImposters === 2 && canSelectTwo ? styles.imposterSegmentTextActive : (!canSelectTwo ? styles.imposterSegmentTextDisabled : styles.imposterSegmentTextInactive)}>2 Imposters</Text> </Pressable> </View> <Text style={styles.imposterHintText}>{canSelectTwo ? "Wähle die Anzahl der Imposter." : `Mindestens ${minPlayersForTwo} Spieler für 2 Imposters.`}</Text> </View> );
};

export default function SetupStep1Screen() {
  const router = useRouter(); // Bleibt für potenzielle spätere Navigation oder Swipe-Handler
  const Colors = useThemeColors();
  const { resetGame } = useGame();
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYERS);
  const [imposterCount, setImposterCount] = useState(DEFAULT_IMPOSTERS);
  const dynamicStyles = makeStyles(Colors);

  useEffect(() => { resetGame(); setPlayerCount(DEFAULT_PLAYERS); setImposterCount(DEFAULT_IMPOSTERS); }, []);

  // handleNext wird für Swipe nicht direkt benötigt, aber die Logik ist gut für den Context-Übergang
  // Die Parameter playerCount und imposterCount müssen im Context gespeichert werden, wenn geswiped wird.
  // Fürs Erste bleibt die Logik, aber der Button wird entfernt.

  const handlePlayerCountChange = (newCount: number) => { setPlayerCount(newCount); if (newCount < MIN_PLAYERS_FOR_TWO_IMPOSTERS && imposterCount === 2) setImposterCount(1); };
  // const isNextDisabled = playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS; // Nicht mehr für Button benötigt

  // TODO: Hier muss der Context aktualisiert werden, wenn sich playerCount oder imposterCount ändern,
  // damit der nächste Screen (beim Swipen) die korrekten Werte hat.
  // Alternativ werden die Werte erst beim Verlassen des Screens (onSwipeEnd) übergeben/gesetzt.

  return (
    <ScreenWrapper style={dynamicStyles.screenContainer}>
      <Stack.Screen options={{ title: "Spiel Setup: Spieler" }}/>
      <View style={dynamicStyles.headerContent}>
        <StepIndicator currentStep={1} theme={Colors} />
        <Text style={dynamicStyles.mainTitle}>Spieler & Imposter</Text>
      </View>
      <ScrollView style={dynamicStyles.mainInteractionAreaScroll} contentContainerStyle={dynamicStyles.mainInteractionAreaContent} showsVerticalScrollIndicator={false}>
        <PlayerCounter count={playerCount} onIncrement={() => handlePlayerCountChange(Math.min(MAX_PLAYERS, playerCount + 1))} onDecrement={() => handlePlayerCountChange(Math.max(MIN_PLAYERS, playerCount - 1))} min={MIN_PLAYERS} max={MAX_PLAYERS} theme={Colors}/>
        <Text style={dynamicStyles.playerCountInfo}>Min {MIN_PLAYERS} / Max {MAX_PLAYERS} Spieler</Text>
        <ImposterSelector selectedImposters={imposterCount} onSelect={setImposterCount} playerCount={playerCount} minPlayersForTwo={MIN_PLAYERS_FOR_TWO_IMPOSTERS} theme={Colors}/>
      </ScrollView>
      <View style={dynamicStyles.footerContent}>
        {/* Footer-Button entfernt, Platz für Swipe-Indikator oder leer lassen */}
        <Text style={{color: Colors.secondaryText, fontStyle: 'italic'}}>Swipe nach rechts für nächsten Schritt</Text>
      </View>
    </ScreenWrapper>
  );
}