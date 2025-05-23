import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView,
    Dimensions, Platform, Animated, ActivityIndicator, FlatList, TextInput
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import PagerView from 'react-native-pager-view';
import ScreenWrapper from '../components/ScreenWrapper';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';
import { useGame } from '../contexts/GameContext';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, RANDOM_CATEGORY_NAME } from '../constants/Words';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;
const DEFAULT_PLAYERS = 4;
const DEFAULT_IMPOSTERS = 1;
const MIN_PLAYERS_FOR_TWO_IMPOSTERS = 6;
const MIN_ROUND_TIME = 30;
const MAX_ROUND_TIME = 600;
const DEFAULT_ROUND_TIME = 120;
const ROUND_TIME_STEP = 30;

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
    pagerScreenContainer: { flex: 1, backgroundColor: Colors.primaryBackground },
    pageStyle: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingBottom: 0 },
    headerContent: { width: '100%', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 20 : 15, paddingBottom: 5 },
    stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, height: 40 },
    stepDotBase: { marginHorizontal: 12, justifyContent: 'center', alignItems: 'center', width: 22, height: 22, borderRadius: 11 },
    stepDotInactive: { backgroundColor: Colors.disabled },
    stepDotActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 6 },
    stepTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.caption, color: Colors.primaryText },
    stepTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
    pageTitle: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 2, color: Colors.primaryText, textAlign: 'center', marginBottom: 25 },
    sectionTitle: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h2 - 1, color: Colors.primaryText, marginTop: 20, marginBottom: 15, textAlign: 'center' },
    optionalSubtitleText: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.caption, color: Colors.secondaryText, textAlign: 'center', marginTop: -15, marginBottom: 20 },
    mainInteractionAreaScroll: { flex: 1, width: '100%' },
    mainInteractionAreaContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
    footerContent: { width: '100%', height: 90, justifyContent: 'center', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 20 : 10, paddingTop: 10 },
    swipeHintText: { color: Colors.secondaryText, fontStyle: 'italic', fontSize: FontSizes.caption -1 },
    playerCounterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, width: '90%', maxWidth: 350 },
    counterButton: { padding: 15, borderRadius: 50 },
    playerCountText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 38, color: Colors.primaryText, textAlign: 'center', minWidth: 90, marginHorizontal: 10 },
    playerCountInfo: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.caption, color: Colors.secondaryText, textAlign: 'center', marginBottom: 30 },
    imposterSelectorWrapper: { alignItems: 'center', marginVertical: 20, width: '100%' },
    imposterSelectorContainer: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 30, padding: 6, shadowColor: Colors.primaryText, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3, minHeight: 56 },
    imposterSegment: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    imposterSegmentActive: { backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.45, shadowRadius: 5, elevation: 6 },
    imposterSegmentTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.body, color: Colors.primaryText },
    imposterSegmentTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
    imposterSegmentDisabled: { opacity: 0.5 },
    imposterSegmentTextDisabled: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.body, color: Colors.disabledText },
    imposterHintText: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.caption, fontStyle: 'italic', color: Colors.secondaryText, textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
    nameInputListStyle: { width: '100%' },
    nameInputColumnWrapper: { justifyContent: 'space-between' },
    playerInputItemContainer: { width: '48%', marginBottom: 15 },
    textInput: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.body - 1, color: Colors.primaryText, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.borderColor, borderRadius: 10, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 14 : 10, height: 50 },
    textInputFocused: { borderColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15, paddingVertical: 5 },
    stepperButton: { paddingHorizontal: 20, paddingVertical: 10 },
    stepperTimeText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 10, color: Colors.primaryText, textAlign: 'center', minWidth: 120 },
    roundTimeHintText: { fontFamily: Fonts.OpenSans.Regular, fontSize: FontSizes.caption, fontStyle: 'italic', color: Colors.secondaryText, textAlign: 'center', marginTop: 8, marginBottom: 20 },
    categoryListStyle: { width: '100%', marginTop: 5 },
    categoryListColumnWrapper: { justifyContent: 'space-between', marginBottom: 15 },
    fullWidthGridItemWrapper: { width: '100%', marginBottom: 15, alignItems: 'center' },
    gridItemWrapper: { width: '48.5%' },
    categoryGridCard: { backgroundColor: Colors.surface, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', minHeight: 130, borderWidth: 2, borderColor: Colors.borderColor, shadowColor: Colors.primaryText, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
    categoryGridCardSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
    randomCategoryCardFullWidth: { borderColor: Colors.borderColor, width: '100%', paddingVertical: 20, minHeight: 90 },
    categoryGridIcon: { marginBottom: 10 },
    categoryGridText: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.caption + 2, color: Colors.primaryText, textAlign: 'center' },
    categoryGridTextSelected: { color: Colors.accentText, fontFamily: Fonts.OpenSans.Bold },
    randomCategoryText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.primaryText },
    hintToggleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 28, marginTop: 20, marginBottom: 25, minWidth: SCREEN_WIDTH * 0.55, borderWidth: 2, shadowColor: Colors.primaryText, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    hintToggleButtonActive: { backgroundColor: Colors.accent, borderColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.45, shadowRadius: 5, elevation: 6 },
    hintToggleButtonInactive: { backgroundColor: Colors.surface, borderColor: Colors.disabled },
    hintToggleButtonTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
    hintToggleButtonTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.body, color: Colors.secondaryText },
    startButtonPressableWrapper: { width: SCREEN_WIDTH * 0.85, maxWidth: 450 },
    startButton: { height: 95, backgroundColor: Colors.accent, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 9, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.6, shadowRadius: 9 },
    startButtonDisabled: { backgroundColor: Colors.disabled, shadowColor: Colors.disabledText },
    startButtonText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 8, color: Colors.accentText, letterSpacing: 2 },
});

// --- Prop Interfaces für interne Komponenten ---
interface StepIndicatorProps { currentStep: 1 | 2 | 3; theme: ThemeColors; }
interface PlayerCounterProps { count: number; onIncrement: () => void; onDecrement: () => void; min: number; max: number; theme: ThemeColors; }
interface ImposterSelectorProps { selectedImposters: number; onSelect: (count: number) => void; playerCount: number; minPlayersForTwo: number; theme: ThemeColors; }
interface PlayerInputItemProps { item: string; index: number; onPlayerNameChange: (text: string, index: number) => void; themeColors: ThemeColors; stylesObject: ReturnType<typeof makeStyles>;}
interface TimeStepperProps { currentTime: number; onIncrement: () => void; onDecrement: () => void; minTime: number; maxTime: number; theme: ThemeColors; }
interface HintToggleButtonProps { hintEnabled: boolean; onToggle: () => void; theme: ThemeColors; }

// KORRIGIERTE Basis-Prop für StepContent Komponenten
interface StepContentProps {
  themeColors: ThemeColors;
  // stylesObject: ReturnType<typeof makeStyles>; // Diese Zeile wird entfernt
}
interface Step1ContentProps extends StepContentProps { playerCount: number; imposterCount: number; onPlayerCountChange: (count: number) => void; onImposterCountChange: (count: number) => void; }
interface Step2ContentProps extends StepContentProps { playerCount: number; playerNames: string[]; selectedRoundTime: number; onPlayerNamesChange: (names: string[]) => void; onIncrementTime: () => void; onDecrementTime: () => void; }
interface Step3ContentProps extends StepContentProps { selectedCategoryName: string; hintEnabled: boolean; onSelectCategory: (name: string) => void; onToggleHint: () => void; }


// --- Interne UI-Komponenten ---
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, theme }) => {
  const styles = makeStyles(theme);
  return ( <View style={styles.stepIndicatorContainer}> {[1, 2, 3].map((step) => { const isActive = step === currentStep; return ( <View key={step} style={[styles.stepDotBase, isActive ? styles.stepDotActive : styles.stepDotInactive]}> <Text style={isActive ? styles.stepTextActive : styles.stepTextInactive}>{step}</Text> </View> ); })} </View> );
};

const PlayerInputItem: React.FC<PlayerInputItemProps> = ({ item, index, onPlayerNameChange, themeColors, stylesObject }) => {
    const [isFocused, setIsFocused] = useState(false);
    return ( <View style={stylesObject.playerInputItemContainer}> <TextInput style={[stylesObject.textInput, isFocused && stylesObject.textInputFocused]} value={item} onChangeText={(text) => onPlayerNameChange(text, index)} placeholder={`Spieler ${index + 1}`} placeholderTextColor={themeColors.disabledText} maxLength={15} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}/> </View> );
};

const PlayerCounter: React.FC<PlayerCounterProps> = ({ count, onIncrement, onDecrement, min, max, theme }) => {
  const styles = makeStyles(theme);
  return ( <View style={styles.playerCounterContainer}> <TouchableOpacity style={styles.counterButton} onPress={onDecrement} disabled={count <= min} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}> <Ionicons name="remove-circle-sharp" size={60} color={count <= min ? theme.disabledText : theme.accent} /> </TouchableOpacity> <Text style={styles.playerCountText}>{count}</Text> <TouchableOpacity style={styles.counterButton} onPress={onIncrement} disabled={count >= max} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}> <Ionicons name="add-circle-sharp" size={60} color={count >= max ? theme.disabledText : theme.accent} /> </TouchableOpacity> </View> );
};
const ImposterSelector: React.FC<ImposterSelectorProps> = ({ selectedImposters, onSelect, playerCount, minPlayersForTwo, theme }) => {
  const styles = makeStyles(theme); const canSelectTwo = playerCount >= minPlayersForTwo;
  return ( <View style={styles.imposterSelectorWrapper}> <View style={styles.imposterSelectorContainer}> <Pressable style={[styles.imposterSegment, selectedImposters === 1 && styles.imposterSegmentActive]} onPress={() => onSelect(1)}> <Text style={selectedImposters === 1 ? styles.imposterSegmentTextActive : styles.imposterSegmentTextInactive}>1 Imposter</Text> </Pressable> <Pressable style={[styles.imposterSegment, selectedImposters === 2 && canSelectTwo && styles.imposterSegmentActive, !canSelectTwo && styles.imposterSegmentDisabled]} onPress={() => { if (canSelectTwo) onSelect(2); }} disabled={!canSelectTwo}> <Text style={selectedImposters === 2 && canSelectTwo ? styles.imposterSegmentTextActive : (!canSelectTwo ? styles.imposterSegmentTextDisabled : styles.imposterSegmentTextInactive)}>2 Imposters</Text> </Pressable> </View> <Text style={styles.imposterHintText}>{canSelectTwo ? "Wähle die Anzahl der Imposter." : `Mindestens ${minPlayersForTwo} Spieler für 2 Imposters.`}</Text> </View> );
};
const TimeStepper: React.FC<TimeStepperProps> = ({ currentTime, onIncrement, onDecrement, minTime, maxTime, theme }) => {
  const styles = makeStyles(theme); const displayMinutes = Math.floor(currentTime / 60); const displaySeconds = currentTime % 60;
  return ( <View style={styles.stepperContainer}> <TouchableOpacity style={styles.stepperButton} onPress={onDecrement} disabled={currentTime <= minTime}> <Ionicons name="remove-circle-sharp" size={52} color={currentTime <= minTime ? theme.disabledText : theme.accent} /> </TouchableOpacity> <Text style={styles.stepperTimeText}>{`${displayMinutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`}</Text> <TouchableOpacity style={styles.stepperButton} onPress={onIncrement} disabled={currentTime >= maxTime}> <Ionicons name="add-circle-sharp" size={52} color={currentTime >= maxTime ? theme.disabledText : theme.accent} /> </TouchableOpacity> </View> );
};
const HintToggleButton: React.FC<HintToggleButtonProps> = ({ hintEnabled, onToggle, theme }) => {
    const styles = makeStyles(theme); const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => { Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start(); };
    const handlePressOut = () => { Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start(); onToggle(); };
    return ( <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} > <Animated.View style={[ styles.hintToggleButton, hintEnabled ? styles.hintToggleButtonActive : styles.hintToggleButtonInactive, { transform: [{ scale: scaleAnim }] } ]}> <Text style={hintEnabled ? styles.hintToggleButtonTextActive : styles.hintToggleButtonTextInactive}>Hinweise</Text> <Ionicons name={hintEnabled ? "bulb-sharp" : "bulb-outline"} size={20} color={hintEnabled ? theme.accentText : theme.secondaryText} style={{ marginLeft: 10 }} /> </Animated.View> </Pressable> );
};

// --- Step 1 Content ---
const Step1Content: React.FC<Step1ContentProps> = ({ playerCount, imposterCount, onPlayerCountChange, onImposterCountChange, themeColors }) => {
  const styles = makeStyles(themeColors);
  const handlePlayerCountInternalChange = (newCount: number) => { onPlayerCountChange(newCount); if (newCount < MIN_PLAYERS_FOR_TWO_IMPOSTERS && imposterCount === 2) { onImposterCountChange(1); } };
  return ( <ScreenWrapper style={styles.pageStyle}> <View style={styles.headerContent}><Text style={styles.pageTitle}>Spieler & Imposter</Text></View> <ScrollView style={styles.mainInteractionAreaScroll} contentContainerStyle={styles.mainInteractionAreaContent} showsVerticalScrollIndicator={false}><PlayerCounter count={playerCount} onIncrement={() => handlePlayerCountInternalChange(Math.min(MAX_PLAYERS, playerCount + 1))} onDecrement={() => handlePlayerCountInternalChange(Math.max(MIN_PLAYERS, playerCount - 1))} min={MIN_PLAYERS} max={MAX_PLAYERS} theme={themeColors}/><Text style={styles.playerCountInfo}>Min {MIN_PLAYERS} / Max {MAX_PLAYERS} Spieler</Text><ImposterSelector selectedImposters={imposterCount} onSelect={onImposterCountChange} playerCount={playerCount} minPlayersForTwo={MIN_PLAYERS_FOR_TWO_IMPOSTERS} theme={themeColors}/></ScrollView></ScreenWrapper> );
};

// --- Step 2 Content ---
const Step2Content: React.FC<Step2ContentProps> = ({ playerCount, playerNames, selectedRoundTime, onPlayerNamesChange, onIncrementTime, onDecrementTime, themeColors }) => {
    const styles = makeStyles(themeColors);
    const handleLocalPlayerNameChange = useCallback((text: string, index: number) => { const newPlayerNames = [...playerNames]; newPlayerNames[index] = text; onPlayerNamesChange(newPlayerNames); }, [playerNames, onPlayerNamesChange]);
    const renderPlayerInputItem = ({ item, index }: { item: string, index: number }) => ( <PlayerInputItem item={item} index={index} onPlayerNameChange={handleLocalPlayerNameChange} themeColors={themeColors} stylesObject={styles} /> );
    return ( <ScreenWrapper style={styles.pageStyle}> <View style={styles.headerContent}><Text style={styles.pageTitle}>Namen & Runde</Text></View> <ScrollView style={styles.mainInteractionAreaScroll} contentContainerStyle={styles.mainInteractionAreaContent}><Text style={styles.sectionTitle}>Spielernamen</Text>{playerNames.length === playerCount ? ( <FlatList data={playerNames} renderItem={renderPlayerInputItem} keyExtractor={(_item, index) => `s2-player-name-${index}`} numColumns={2} columnWrapperStyle={styles.nameInputColumnWrapper} scrollEnabled={false} style={styles.nameInputListStyle}/> ) : ( <View style={{alignItems: 'center', paddingVertical: 20}}><ActivityIndicator size="small" color={themeColors.accent} /></View> )}<Text style={styles.sectionTitle}>Rundenlänge</Text><TimeStepper currentTime={selectedRoundTime} onIncrement={onIncrementTime} onDecrement={onDecrementTime} minTime={MIN_ROUND_TIME} maxTime={MAX_ROUND_TIME} theme={themeColors}/><Text style={styles.roundTimeHintText}>Min: {MIN_ROUND_TIME} Sek, Max: {MAX_ROUND_TIME} Sek ({MAX_ROUND_TIME / 60} Min)</Text></ScrollView></ScreenWrapper> );
};

// --- Step 3 Content ---
const Step3Content: React.FC<Step3ContentProps> = ({ selectedCategoryName, hintEnabled, onSelectCategory, onToggleHint, themeColors }) => {
    const styles = makeStyles(themeColors);
    const getIconForCategory = (name: string): keyof typeof Ionicons.glyphMap => { if (name === RANDOM_CATEGORY_NAME) return "shuffle-outline"; if (name === "Tiere") return "paw-outline"; if (name === "Obst & Gemüse") return "nutrition-outline"; if (name === "Berufe") return "briefcase-outline"; if (name === "Sportarten") return "medal-outline"; return "pricetag-outline"; };
    const renderCategoryItem = useCallback(({ item }: { item: typeof CATEGORIES[0] }) => { const isSelected = selectedCategoryName === item.name; return ( <View style={styles.gridItemWrapper}> <TouchableOpacity style={[styles.categoryGridCard, isSelected && styles.categoryGridCardSelected]} onPress={() => onSelectCategory(item.name)} activeOpacity={0.7}> <Ionicons name={getIconForCategory(item.name)} size={28} color={isSelected ? themeColors.accentText : themeColors.primaryText} style={styles.categoryGridIcon}/> <Text style={[styles.categoryGridText, isSelected && styles.categoryGridTextSelected]} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text> </TouchableOpacity> </View> ); }, [styles, selectedCategoryName, themeColors.accentText, themeColors.primaryText, onSelectCategory, getIconForCategory]);
    const ListHeader = useCallback(() => ( <View style={styles.fullWidthGridItemWrapper}> <TouchableOpacity style={[styles.categoryGridCard, styles.randomCategoryCardFullWidth, selectedCategoryName === RANDOM_CATEGORY_NAME && styles.categoryGridCardSelected]} onPress={() => onSelectCategory(RANDOM_CATEGORY_NAME)} activeOpacity={0.7}> <Ionicons name={getIconForCategory(RANDOM_CATEGORY_NAME)} size={32} color={selectedCategoryName === RANDOM_CATEGORY_NAME ? themeColors.accentText : themeColors.primaryText } style={styles.categoryGridIcon}/> <Text style={[styles.categoryGridText, selectedCategoryName === RANDOM_CATEGORY_NAME && styles.categoryGridTextSelected, styles.randomCategoryText]} numberOfLines={1}>{RANDOM_CATEGORY_NAME}</Text> </TouchableOpacity> </View> ), [styles, selectedCategoryName, themeColors.accentText, themeColors.primaryText, onSelectCategory, getIconForCategory]); // themeColors.accent entfernt

    return (
        <ScreenWrapper style={styles.pageStyle}>
            <View style={styles.headerContent}>
                <Text style={styles.pageTitle}>Letzte Details</Text>
            </View>
            <ScrollView style={styles.mainInteractionAreaScroll} contentContainerStyle={styles.mainInteractionAreaContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Kategorie wählen</Text>
                <Text style={styles.optionalSubtitleText}>(Optional)</Text>
                <FlatList ListHeaderComponent={ListHeader} data={CATEGORIES} renderItem={renderCategoryItem} keyExtractor={(item) => item.name} numColumns={2} style={styles.categoryListStyle} columnWrapperStyle={styles.categoryListColumnWrapper} scrollEnabled={false} />
                <Text style={styles.sectionTitle}>Spielhinweise</Text>
                <HintToggleButton hintEnabled={hintEnabled} onToggle={onToggleHint} theme={themeColors}/>
            </ScrollView>
        </ScreenWrapper>
    );
};

// --- Haupt-Setup-Komponente mit PagerView ---
export default function SetupScreen() {
  const router = useRouter();
  const Colors = useThemeColors();
  const { resetGame, initializeGame } = useGame();
  const dynamicStyles = makeStyles(Colors);
  const pagerRef = useRef<PagerView>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYERS);
  const [imposterCount, setImposterCount] = useState(DEFAULT_IMPOSTERS);
  const [playerNames, setPlayerNames] = useState<string[]>(() => Array.from({ length: DEFAULT_PLAYERS }, (_, i) => `Spieler ${i + 1}`));
  const [selectedRoundTime, setSelectedRoundTime] = useState(DEFAULT_ROUND_TIME);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(RANDOM_CATEGORY_NAME);
  const [hintEnabled, setHintEnabled] = useState(true);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const startButtonScaleAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect( useCallback(() => { resetGame(); setPlayerCount(DEFAULT_PLAYERS); setImposterCount(DEFAULT_IMPOSTERS); setPlayerNames(Array.from({ length: DEFAULT_PLAYERS }, (_, i) => `Spieler ${i + 1}`)); setSelectedRoundTime(DEFAULT_ROUND_TIME); setSelectedCategoryName(RANDOM_CATEGORY_NAME); setHintEnabled(true); setIsStartingGame(false); if (pagerRef.current) { pagerRef.current.setPage(0); } setCurrentPage(0); return () => { console.log("[SetupScreen] Unfocused."); }; }, [resetGame]) );
  useEffect(() => { setPlayerNames(currentNames => { const newNames = Array.from({ length: playerCount }, (_, i) => (currentNames[i] && currentNames[i].trim() !== "" && i < currentNames.length) ? currentNames[i] : `Spieler ${i + 1}` ); return newNames; }); }, [playerCount]);
  const handlePageSelected = (event: { nativeEvent: { position: number } }) => { setCurrentPage(event.nativeEvent.position); };
  const animateButtonPress = (scaleValue: Animated.Value, toVal: number, onComplete?: () => void) => { Animated.spring(scaleValue, { toValue: toVal, friction: 5, tension: 80, useNativeDriver: true }).start(onComplete); };
  const handleFinalStartGame = () => { if (isStartingGame) return; setIsStartingGame(true); const finalPlayerNames = playerNames.map((name, index) => (name && name.trim() !== '') ? name.trim() : `Spieler ${index + 1}`); initializeGame(playerCount, imposterCount, selectedCategoryName, hintEnabled, selectedRoundTime, finalPlayerNames); setTimeout(() => router.push('/role-reveal-github'), 100); };

  return (
    <View style={dynamicStyles.pagerScreenContainer}>
      <Stack.Screen options={{ title: "Spiel einrichten" }} />
      <View style={{paddingTop: Platform.OS === 'ios' ? 50 : 20, alignItems: 'center', backgroundColor: Colors.primaryBackground}}>
        <StepIndicator currentStep={(currentPage + 1) as 1 | 2 | 3} theme={Colors} />
      </View>
      <PagerView style={{ flex: 1 }} initialPage={0} onPageSelected={handlePageSelected} ref={pagerRef} scrollEnabled={true} >
        <View key="1">
            <Step1Content playerCount={playerCount} imposterCount={imposterCount} onPlayerCountChange={setPlayerCount} onImposterCountChange={setImposterCount} themeColors={Colors}/>
        </View>
        <View key="2">
            <Step2Content playerCount={playerCount} playerNames={playerNames} selectedRoundTime={selectedRoundTime} onPlayerNamesChange={setPlayerNames} onIncrementTime={() => setSelectedRoundTime((prev: number) => Math.min(MAX_ROUND_TIME, prev + ROUND_TIME_STEP))} onDecrementTime={() => setSelectedRoundTime((prev: number) => Math.max(MIN_ROUND_TIME, prev - ROUND_TIME_STEP))} themeColors={Colors}/>
        </View>
        <View key="3">
            <Step3Content selectedCategoryName={selectedCategoryName} hintEnabled={hintEnabled} onSelectCategory={setSelectedCategoryName} onToggleHint={() => setHintEnabled((prev: boolean) => !prev)} themeColors={Colors} />
        </View>
      </PagerView>
      <View style={dynamicStyles.footerContent}>
        {currentPage < 2 ? (
            <Text style={dynamicStyles.swipeHintText}>Swipe für nächsten Schritt</Text>
        ) : (
            <Pressable onPressIn={() => !isStartingGame && animateButtonPress(startButtonScaleAnim, 0.95)} onPressOut={() => !isStartingGame && animateButtonPress(startButtonScaleAnim, 1, handleFinalStartGame)} disabled={isStartingGame} style={dynamicStyles.startButtonPressableWrapper}>
                <Animated.View style={[dynamicStyles.startButton, isStartingGame && dynamicStyles.startButtonDisabled, { transform: [{scale: startButtonScaleAnim}] }]}>
                    {isStartingGame ? (<ActivityIndicator size="large" color={Colors.accentText} />) : (<Text style={dynamicStyles.startButtonText}>Starten</Text>)}
                </Animated.View>
            </Pressable>
        )}
      </View>
    </View>
  );
}