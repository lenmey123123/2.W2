// app/setup-step2.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';
import { useGame } from '../contexts/GameContext';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_PLAYERS_FOR_STEP = 3;
const DEFAULT_ROUND_TIME = 120;
const ROUND_TIME_STEP = 30;
const MAX_ROUND_TIME = 600;
const MIN_ROUND_TIME = 30;

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  screenContainer: { flex:1, justifyContent: 'space-between', alignItems: 'center' },
  headerContent: { width: '100%', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 30 : 20, paddingBottom: 10 },
  stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, height: 40 },
  stepDotBase: { marginHorizontal: 12, justifyContent: 'center', alignItems: 'center', width: 22, height: 22, borderRadius: 11 },
  stepDotInactive: { backgroundColor: Colors.disabled },
  stepDotActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 6 },
  stepTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.caption, color: Colors.primaryText }, // Theme-Farbe
  stepTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
  mainTitle: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 4, color: Colors.primaryText, textAlign: 'center' }, // Theme-Farbe
  mainInteractionAreaScroll: { flex: 1, width: '100%' },
  mainInteractionAreaContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  sectionTitle: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h2 - 2, color: Colors.primaryText, marginTop: 25, marginBottom: 15, textAlign: 'center' }, // Theme-Farbe
  listStyle: { width: '100%' },
  nameInputColumnWrapper: { justifyContent: 'space-between' },
  playerInputItemContainer: { width: '48%', marginBottom: 12 },
  textInput: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.body - 2, color: Colors.primaryText, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.borderColor, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 10, height: 46 }, // Theme-Farbe
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10, paddingVertical: 5 },
  stepperButton: { paddingHorizontal: 20, paddingVertical: 10 },
  stepperTimeText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 4, color: Colors.primaryText, textAlign: 'center', minWidth: 110 }, // Theme-Farbe
  roundTimeHintText: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.caption -1, fontStyle: 'italic', color: Colors.secondaryText, textAlign: 'center', marginTop: 8, marginBottom: 20 }, // Theme-Farbe
  footerContent: { height: 80, justifyContent: 'center', alignItems: 'center' }, // Platzhalter für Swipe-Indikator
  // footerBackButtonUnified, footerNextArrowButton ENTFERNT
});

interface StepIndicatorProps { currentStep: 1 | 2 | 3; theme: ThemeColors; }
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, theme }) => { /* ... (unverändert) ... */
  const styles = makeStyles(theme);
  return ( <View style={styles.stepIndicatorContainer}> {[1, 2, 3].map((step) => { const isActive = step === currentStep; return ( <View key={step} style={[styles.stepDotBase, isActive ? styles.stepDotActive : styles.stepDotInactive]}> <Text style={isActive ? styles.stepTextActive : styles.stepTextInactive}>{step}</Text> </View> ); })} </View> );
};
interface TimeStepperProps { currentTime: number; onIncrement: () => void; onDecrement: () => void; minTime: number; maxTime: number; theme: ThemeColors; }
const TimeStepper: React.FC<TimeStepperProps> = ({ currentTime, onIncrement, onDecrement, minTime, maxTime, theme }) => { /* ... (unverändert) ... */
  const styles = makeStyles(theme); const displayMinutes = Math.floor(currentTime / 60); const displaySeconds = currentTime % 60;
  return ( <View style={styles.stepperContainer}> <TouchableOpacity style={styles.stepperButton} onPress={onDecrement} disabled={currentTime <= minTime}> <Ionicons name="remove-circle-sharp" size={52} color={currentTime <= minTime ? theme.disabledText : theme.accent} /> </TouchableOpacity> <Text style={styles.stepperTimeText}>{`${displayMinutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`}</Text> <TouchableOpacity style={styles.stepperButton} onPress={onIncrement} disabled={currentTime >= maxTime}> <Ionicons name="add-circle-sharp" size={52} color={currentTime >= maxTime ? theme.disabledText : theme.accent} /> </TouchableOpacity> </View> );
};

export default function SetupStep2Screen() {
  const router = useRouter(); // Bleibt für Swipe-Handler
  const params = useLocalSearchParams<{ playerCount: string; imposterCount: string }>();
  const parsedPlayerCount = parseInt(params.playerCount || String(MIN_PLAYERS_FOR_STEP), 10);
  const playerCount = isNaN(parsedPlayerCount) || parsedPlayerCount < MIN_PLAYERS_FOR_STEP ? MIN_PLAYERS_FOR_STEP : parsedPlayerCount;
  const imposterCount = parseInt(params.imposterCount || '1', 10);

  const Colors = useThemeColors();
  const dynamicStyles = makeStyles(Colors);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [selectedRoundTime, setSelectedRoundTime] = useState(DEFAULT_ROUND_TIME);

  useEffect(() => { if (playerNames.length !== playerCount || (playerCount > 0 && playerNames.length === 0)) { setPlayerNames(Array.from({ length: playerCount }, (_, i) => `Spieler ${i + 1}`)); } }, [playerCount]);
  const handlePlayerNameChangeInternal = (text: string, index: number) => { setPlayerNames((currentNames: string[]) => { const newPlayerNames = [...currentNames]; newPlayerNames[index] = text; return newPlayerNames; }); };
  const handlePlayerNameChange = useCallback(handlePlayerNameChangeInternal, []);
  const incrementTime = () => setSelectedRoundTime((prev: number) => Math.min(MAX_ROUND_TIME, prev + ROUND_TIME_STEP));
  const decrementTime = () => setSelectedRoundTime((prev: number) => Math.max(MIN_ROUND_TIME, prev - ROUND_TIME_STEP));

  // handleNext und handleBack werden für Swipe nicht direkt benötigt,
  // aber die Logik zur Parameterübergabe muss beim Swipen erfolgen.

  const renderPlayerInput = useCallback(({ item, index }: { item: string, index: number }) => ( <View style={dynamicStyles.playerInputItemContainer}> <TextInput style={dynamicStyles.textInput} value={item} onChangeText={(text) => handlePlayerNameChange(text, index)} placeholder={`Spieler ${index + 1}`} placeholderTextColor={Colors.disabledText} maxLength={15}/> </View> ), [dynamicStyles, Colors.disabledText, handlePlayerNameChange]);

  return (
    <ScreenWrapper style={dynamicStyles.screenContainer}>
      <Stack.Screen options={{ title: "Namen & Runde" }} />
      <View style={dynamicStyles.headerContent}>
        <StepIndicator currentStep={2} theme={Colors} />
        <Text style={dynamicStyles.mainTitle}>Spieler & Runde</Text>
      </View>
      <ScrollView style={dynamicStyles.mainInteractionAreaScroll} contentContainerStyle={dynamicStyles.mainInteractionAreaContent}>
        <Text style={dynamicStyles.sectionTitle}>Spielernamen</Text>
        {playerNames.length === playerCount ? ( <FlatList data={playerNames} renderItem={renderPlayerInput} keyExtractor={(_item, index) => `player-name-${index}`} numColumns={2} columnWrapperStyle={dynamicStyles.nameInputColumnWrapper} scrollEnabled={false} style={dynamicStyles.listStyle}/> ) : ( <View style={{alignItems: 'center', paddingVertical: 20}}><ActivityIndicator size="small" color={Colors.accent} /></View> )}
        <Text style={dynamicStyles.sectionTitle}>Rundenlänge</Text>
        <TimeStepper currentTime={selectedRoundTime} onIncrement={incrementTime} onDecrement={decrementTime} minTime={MIN_ROUND_TIME} maxTime={MAX_ROUND_TIME} theme={Colors}/>
        <Text style={dynamicStyles.roundTimeHintText}>Min: {MIN_ROUND_TIME} Sek, Max: {MAX_ROUND_TIME} Sek ({MAX_ROUND_TIME / 60} Min)</Text>
      </ScrollView>
      <View style={dynamicStyles.footerContent}>
        {/* Footer-Buttons entfernt, Platz für Swipe-Indikator */}
        <Text style={{color: Colors.secondaryText, fontStyle: 'italic'}}>Swipe für nächsten/vorherigen Schritt</Text>
      </View>
    </ScreenWrapper>
  );
}