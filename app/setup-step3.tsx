import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, Platform, Dimensions, Animated, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes } from '../constants/Typography';
import { CATEGORIES, RANDOM_CATEGORY_NAME } from '../constants/Words';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../contexts/GameContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_ROUND_TIME_SECONDS_FALLBACK = 120;

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  screenContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  headerContent: { width: '100%', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 30 : 20, paddingBottom: 10 },
  stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, height: 40 },
  stepDotBase: { marginHorizontal: 12, justifyContent: 'center', alignItems: 'center', width: 22, height: 22, borderRadius: 11 },
  stepDotInactive: { backgroundColor: Colors.disabled },
  stepDotActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 6 },
  stepTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.caption, color: Colors.primaryText },
  stepTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
  mainTitle: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 4, color: Colors.primaryText, textAlign: 'center' },
  sectionTitle: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h2 - 2, color: Colors.primaryText, marginTop: 20, marginBottom: 15, textAlign: 'center' },
  listStyle: { width: '100%', marginTop: 10 },
  listColumnWrapper: { justifyContent: 'space-between', marginBottom: 15 },
  fullWidthGridItemWrapper: { width: '100%', marginBottom: 15, alignItems: 'center' },
  gridItemWrapper: { width: '48.5%' },
  categoryGridCard: { backgroundColor: Colors.surface, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', minHeight: 125, borderWidth: 2, borderColor: Colors.borderColor, shadowColor: Colors.primaryText, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  categoryGridCardSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent, shadowColor: Colors.accent, shadowOpacity: 0.3, elevation: 4 },
  randomCategoryCardFullWidth: { borderColor: Colors.borderColor, width: '100%', paddingVertical: 20, minHeight: 90 },
  categoryGridIcon: { marginBottom: 10 },
  categoryGridText: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.caption + 2, color: Colors.primaryText, textAlign: 'center' },
  categoryGridTextSelected: { color: Colors.accentText, fontFamily: Fonts.OpenSans.Bold },
  randomCategoryText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.primaryText },
  hintToggleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 28, marginTop: 15, marginBottom: 20, minWidth: SCREEN_WIDTH * 0.5, borderWidth: 2, shadowColor: Colors.primaryText, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  hintToggleButtonActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  hintToggleButtonInactive: { backgroundColor: Colors.surface, borderColor: Colors.disabled },
  hintToggleButtonTextActive: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.body, color: Colors.accentText },
  hintToggleButtonTextInactive: { fontFamily: Fonts.OpenSans.SemiBold, fontSize: FontSizes.body, color: Colors.secondaryText },
  footerContent: { width: '100%', alignItems: 'center', paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  startButtonPressableWrapper: { width: SCREEN_WIDTH * 0.75, maxWidth: 400 },
  startButton: { height: 85, backgroundColor: Colors.accent, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 7, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.45, shadowRadius: 7 },
  startButtonDisabled: { backgroundColor: Colors.disabled, shadowColor: Colors.disabledText },
  startButtonText: { fontFamily: Fonts.OpenSans.Bold, fontSize: FontSizes.h1 + 4, color: Colors.accentText, letterSpacing: 1 },
  mainInteractionAreaScroll: { flex: 1, width: '100%' },
  mainInteractionAreaContent: { paddingHorizontal: 24, paddingBottom: 10 },
});

interface StepIndicatorProps { currentStep: 1 | 2 | 3; theme: ThemeColors; }
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, theme }) => {
  const styles = makeStyles(theme);
  return (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map(step => {
        const isActive = step === currentStep;
        return (
          <View key={step} style={[styles.stepDotBase, isActive ? styles.stepDotActive : styles.stepDotInactive]}>
            <Text style={isActive ? styles.stepTextActive : styles.stepTextInactive}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
};

interface HintToggleButtonProps { hintEnabled: boolean; onToggle: () => void; theme: ThemeColors; }
const HintToggleButton: React.FC<HintToggleButtonProps> = ({ hintEnabled, onToggle, theme }) => {
  const styles = makeStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    onToggle();
  };
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.hintToggleButton,
        hintEnabled ? styles.hintToggleButtonActive : styles.hintToggleButtonInactive,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Text style={hintEnabled ? styles.hintToggleButtonTextActive : styles.hintToggleButtonTextInactive}>Hinweise</Text>
        <Ionicons name={hintEnabled ? "bulb-sharp" : "bulb-outline"} size={20} color={hintEnabled ? theme.accentText : theme.secondaryText} style={{ marginLeft: 10 }} />
      </Animated.View>
    </Pressable>
  );
};

export default function SetupStep3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ playerCount: string; imposterCount: string; playerNames: string | string[]; selectedRoundTime: string }>();

  const playerCount = parseInt(params.playerCount || '3', 10);
  const imposterCount = parseInt(params.imposterCount || '1', 10);
  const playerNamesParam = params.playerNames;
  const playerNames = typeof playerNamesParam === 'string' ? [playerNamesParam] : (Array.isArray(playerNamesParam) ? playerNamesParam : []);
  const selectedRoundTime = parseInt(params.selectedRoundTime || String(DEFAULT_ROUND_TIME_SECONDS_FALLBACK), 10);

  const Colors = useThemeColors();
  const { initializeGame } = useGame();
  const dynamicStyles = makeStyles(Colors);

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(RANDOM_CATEGORY_NAME);
  const [hintEnabled, setHintEnabled] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const startButtonScaleAnim = useRef(new Animated.Value(1)).current;

  const animateButtonPress = (scaleValue: Animated.Value, toVal: number, onComplete?: () => void) => {
    Animated.spring(scaleValue, { toValue: toVal, friction: 5, tension: 80, useNativeDriver: true }).start(onComplete);
  };

  const handleStartGame = () => {
    if (isStarting) return;
    setIsStarting(true);
    initializeGame(playerCount, imposterCount, selectedCategoryName, hintEnabled, selectedRoundTime, playerNames);
    setTimeout(() => router.push('/role-reveal-github'), 100);
  };

  const getIconForCategory = (name: string): keyof typeof Ionicons.glyphMap => {
    if (name === RANDOM_CATEGORY_NAME) return "shuffle-outline";
    if (name === "Tiere") return "paw-outline";
    if (name === "Obst & Gemüse") return "nutrition-outline";
    if (name === "Berufe") return "briefcase-outline";
    if (name === "Sportarten") return "medal-outline";
    return "pricetag-outline";
  };

  const renderCategoryItem = useCallback(({ item }: { item: typeof CATEGORIES[0] }) => {
    const isSelected = selectedCategoryName === item.name;
    return (
      <View style={dynamicStyles.gridItemWrapper}>
        <TouchableOpacity
          style={[
            dynamicStyles.categoryGridCard,
            isSelected && dynamicStyles.categoryGridCardSelected
          ]}
          onPress={() => setSelectedCategoryName(item.name)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={getIconForCategory(item.name)}
            size={28}
            color={isSelected ? Colors.accentText : Colors.primaryText}
            style={dynamicStyles.categoryGridIcon}
          />
          <Text style={[
              dynamicStyles.categoryGridText,
              isSelected && dynamicStyles.categoryGridTextSelected
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [dynamicStyles, selectedCategoryName, Colors.accentText, Colors.primaryText]);

  // ACHTUNG: FlatList erwartet eine KOMPONENTE, KEIN JSX!
  const ListHeader = useCallback(() => (
    <View style={dynamicStyles.fullWidthGridItemWrapper}>
      <TouchableOpacity
        style={[
          dynamicStyles.categoryGridCard,
          dynamicStyles.randomCategoryCardFullWidth,
          selectedCategoryName === RANDOM_CATEGORY_NAME && dynamicStyles.categoryGridCardSelected
        ]}
        onPress={() => setSelectedCategoryName(RANDOM_CATEGORY_NAME)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={getIconForCategory(RANDOM_CATEGORY_NAME)}
          size={32}
          color={selectedCategoryName === RANDOM_CATEGORY_NAME ? Colors.accentText : Colors.primaryText}
          style={dynamicStyles.categoryGridIcon}
        />
        <Text style={[
            dynamicStyles.categoryGridText,
            selectedCategoryName === RANDOM_CATEGORY_NAME && dynamicStyles.categoryGridTextSelected,
            dynamicStyles.randomCategoryText
          ]}
          numberOfLines={1}
        >
          {RANDOM_CATEGORY_NAME}
        </Text>
      </TouchableOpacity>
    </View>
  ), [dynamicStyles, selectedCategoryName, Colors.accentText, Colors.accent, Colors.primaryText]);

}
