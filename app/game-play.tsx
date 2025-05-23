// app/game-play.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Alert, Platform, Pressable, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useGame } from '../contexts/GameContext'; // Pfad anpassen
import { t } from '../constants/TempTranslations'; // Pfad anpassen
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, useAppTheme } from '../constants/ThemeConstants'; // Pfad anpassen
// import { LinearGradient } from 'expo-linear-gradient'; // Nur wenn benötigt
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '../components/ScreenWrapper'; // Unser ScreenWrapper
import PrimaryButton from '../components/PrimaryButton';   // Unsere Buttons
import SecondaryButton from '../components/SecondaryButton'; // Unsere Buttons

const ADMIN_PIN = "2004";
const SCREEN_WIDTH = Dimensions.get('window').width;
// const SCREEN_HEIGHT = Dimensions.get('window').height; // Nicht direkt verwendet

const getTimerColorValue = (timerValue: number, roundTimeInSeconds: number, theme: AppTheme) => {
  if (timerValue <= 0) return theme.colors.destructiveAction;
  if (timerValue <= 10) return theme.colors.destructiveAction;
  const percentage = roundTimeInSeconds > 0 ? timerValue / roundTimeInSeconds : 1;
  if (percentage < 0.4) return theme.colors.secondaryAccent || theme.colors.accent; // Fallback auf accent
  return theme.colors.primaryText; // Standardfarbe für Timer (ggf. theme.colors.accent)
};

export default function GamePlayScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = makeStyles(theme);

  const { gameState, startGameTimer, stopGameTimer, goToResolutionPhase, changeSecretWord, resetGame } = useGame();
  const { gamePhase, timerValue, isTimerRunning, currentWord, settings, players, isLoading: isGameContextLoading } = gameState;
  const roundTimeInSeconds = settings.roundTimeInSeconds;

  const isFocused = useIsFocused();
  const [stopButtonConfirm, setStopButtonConfirm] = useState(false);
  const pausedByButtonRef = useRef(false);
  const timerWasRunningBeforeStopConfirm = useRef(false);

  const [isAdminMenuVisible, setIsAdminMenuVisible] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [newWordInput, setNewWordInput] = useState(""); // Wird beim Öffnen des Admin-Menüs gesetzt
  const [isScreenReady, setIsScreenReady] = useState(false);

  const timerScale = useSharedValue(1);
  const globalScreenPulseOpacity = useSharedValue(0);
  const actionButtonScale = useSharedValue(1);

  const triggerHapticPulse = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
  }, []);

  // Screen-Bereitschaft und Timer-Start-Logik
  useEffect(() => {
    console.log(`[GamePlayScreen] Focus/State Sync: focused=${isFocused}, phase=${gamePhase}, players=${players?.length}, contextLoading=${isGameContextLoading}, timerVal=${timerValue}, roundTime=${roundTimeInSeconds}, isTimerRunning=${isTimerRunning}`);
    if (isFocused && (gamePhase === 'WordPhase' || gamePhase === 'playing') && players && players.length > 0 && !isGameContextLoading) {
      setIsScreenReady(true);
      if (timerValue === roundTimeInSeconds && roundTimeInSeconds > 0 && !isTimerRunning && !stopButtonConfirm && !pausedByButtonRef.current) {
        console.log('[GamePlayScreen] Auto-starting timer.');
        startGameTimer();
      } else if (timerValue <= 0 && isTimerRunning) {
        // Fall, wo der Timer im Context vielleicht schon abgelaufen ist, während der Screen nicht fokussiert war
        console.log('[GamePlayScreen] Timer was 0 and running, ensuring it is stopped and phase moves.');
        stopGameTimer(); // Stellt sicher, dass isTimerRunning im Context false ist
        goToResolutionPhase({ reasonKey: 'resolutionScreen.timerExpired' });
      }
    } else if (isFocused && gamePhase !== 'WordPhase' && gamePhase !== 'playing' && gamePhase !== 'Resolution' && !isGameContextLoading) {
      console.warn(`[GamePlayScreen] Invalid game phase: ${gamePhase} while focused. Navigating to setup.`);
      router.replace('/setup-step1');
      setIsScreenReady(false);
    } else if (!isFocused) {
      console.log('[GamePlayScreen] Screen lost focus. Stopping timer & animations.');
      if (isTimerRunning) stopGameTimer();
      cancelAnimation(timerScale);
      cancelAnimation(globalScreenPulseOpacity);
      timerScale.value = withTiming(1);
      globalScreenPulseOpacity.value = withTiming(0);
      setIsScreenReady(false);
      setStopButtonConfirm(false);
    }
  }, [isFocused, gamePhase, players, timerValue, roundTimeInSeconds, isTimerRunning, stopButtonConfirm, startGameTimer, stopGameTimer, isGameContextLoading, router, goToResolutionPhase]);

  // Reanimated Animationen
  useEffect(() => {
    if (!isScreenReady) {
        cancelAnimation(timerScale);
        cancelAnimation(globalScreenPulseOpacity);
        timerScale.value = withTiming(1, { duration: 200 });
        globalScreenPulseOpacity.value = withTiming(0, { duration: 200 });
        return;
    }

    // Animationen nur starten, wenn der Timer auch wirklich läuft
    if (isTimerRunning && timerValue <= 10 && timerValue > 0) {
        timerScale.value = withRepeat(
            withSequence(
            withTiming(1.1, { duration: 500, easing: Easing.bezier(0.5, 0, 0.5, 1) }),
            withTiming(1, { duration: 500, easing: Easing.bezier(0.5, 0, 0.5, 1) }),
            withTiming(1, { duration: 100 }, () => runOnJS(triggerHapticPulse)(Haptics.ImpactFeedbackStyle.Medium))
            ), -1, false
        );
        globalScreenPulseOpacity.value = withRepeat(
            withSequence(withTiming(0.05, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1, true
        );
    } else {
        cancelAnimation(timerScale);
        cancelAnimation(globalScreenPulseOpacity);
        timerScale.value = withTiming(1, { duration: 300 });
        globalScreenPulseOpacity.value = withTiming(0, { duration: 300 });
    }

    if (timerValue <= 0 && isTimerRunning) { // Dieser Fall sollte vom Context-Timer behandelt werden
        console.log("[GamePlayScreen] Timer value reached 0 in useEffect. Context should handle phase change.");
        // Der Context setzt isTimerRunning auf false und gamePhase auf Resolution
        // Dieser useEffect reagiert dann auf die Phasenänderung.
    }
  }, [timerValue, isTimerRunning, isScreenReady, roundTimeInSeconds, theme, timerScale, globalScreenPulseOpacity, triggerHapticPulse]);

  // Navigation zur Ergebnis-Seite (Resolution)
  useEffect(() => {
    if (isFocused && gamePhase === 'Resolution' && !navigationTriggeredRef.current) { // navigationTriggeredRef hinzugefügt
      console.log("[GamePlayScreen] GamePhase is 'Resolution'. Navigating to results screen.");
      navigationTriggeredRef.current = true; // Verhindere mehrfache Navigation
      router.replace('/results');
    }
  }, [isFocused, gamePhase, router]);
  const navigationTriggeredRef = useRef(false); // Für Navigation

  // Button Handler
  const handleStopRoundPress = () => {
    if (!isScreenReady || (timerValue <= 0 && !stopButtonConfirm)) return;
    triggerHapticPulse(Haptics.ImpactFeedbackStyle.Heavy);

    if (!stopButtonConfirm) {
      setStopButtonConfirm(true);
      timerWasRunningBeforeStopConfirm.current = isTimerRunning;
      if (isTimerRunning) stopGameTimer();
      pausedByButtonRef.current = false;
      actionButtonScale.value = withSequence(
          withTiming(1.2, {duration: 150, easing: Easing.out(Easing.ease) }),
          withTiming(1, {duration: 150, easing: Easing.in(Easing.ease) })
      );
    } else {
      goToResolutionPhase({ reasonKey: 'resolutionScreen.roundStoppedByPlayerConfirm' });
    }
  };

  const handlePausePress = () => {
    if (!isScreenReady || (timerValue <= 0 && !stopButtonConfirm)) return;
    triggerHapticPulse();

    if (stopButtonConfirm) {
      setStopButtonConfirm(false);
      pausedByButtonRef.current = false;
      actionButtonScale.value = withTiming(1, {easing: Easing.out(Easing.ease)});
      if (timerWasRunningBeforeStopConfirm.current && timerValue > 0) {
        startGameTimer();
      }
      timerWasRunningBeforeStopConfirm.current = false;
    } else {
      if (isTimerRunning) {
        stopGameTimer();
        pausedByButtonRef.current = true;
      } else {
        if ((gamePhase === 'WordPhase' || gamePhase === 'playing') && timerValue > 0) {
          pausedByButtonRef.current = false;
          startGameTimer();
        }
      }
    }
  };
  
  useEffect(() => {
     if (!isFocused) {
        setStopButtonConfirm(false); // Reset confirm state if screen loses focus
        timerWasRunningBeforeStopConfirm.current = false;
        pausedByButtonRef.current = false;
     }
  }, [isFocused]);

  // Admin Funktionen
  const handleAdminButtonPress = () => { setNewWordInput(currentWord); setIsPinModalVisible(true); setPinInput("");};
  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsPinModalVisible(false);
      setNewWordInput(currentWord);
      setIsAdminMenuVisible(true);
    } else {
      Alert.alert(t('common.error', {defaultValue: 'Fehler'}), t('gameScreen.adminPinIncorrect', {defaultValue: 'Falsche PIN!'}));
      setPinInput("");
    }
  };
  const handleAdminChangeWordInternal = () => {
    if (newWordInput.trim()) {
      changeSecretWord(newWordInput.trim());
      Alert.alert(t('common.success', {defaultValue: 'Erfolg'}), t('gameScreen.adminWordChangedSuccess', { word: newWordInput.trim(), defaultValue: `Wort geändert zu: ${newWordInput.trim()}` }));
      setIsAdminMenuVisible(false);
    } else {
      Alert.alert(t('common.error', {defaultValue: 'Fehler'}), t('gameScreen.adminErrorEmptyWord', {defaultValue: 'Neues Wort darf nicht leer sein.'}));
    }
  };
  const handleAdminRestartGameInternal = () => {
    setIsAdminMenuVisible(false);
    resetGame(); // Nutzt unsere Context-Funktion
    router.replace('/setup-step1');
  };
  const handleAdminEndRoundInternal = () => {
    setIsAdminMenuVisible(false);
    goToResolutionPhase({ reasonKey: 'resolutionScreen.roundStoppedByAdmin' });
  };

  // Animated Styles
  const animatedTimerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
    color: getTimerColorValue(timerValue, roundTimeInSeconds, theme),
  }));
  const animatedGlobalScreenPulseStyle = useAnimatedStyle(() => ({
    opacity: globalScreenPulseOpacity.value,
    backgroundColor: theme.colors.destructiveAction,
  }));
  const animatedStopButtonWrapperStyle = useAnimatedStyle(() => ({
    transform: [{scale: stopButtonConfirm ? actionButtonScale.value : 1}]
  }));

  // UI Logik
  const timerDisplayValue = timerValue > 0 ? Math.ceil(timerValue) : 0;
  let pauseResumeIconName: keyof typeof Ionicons.glyphMap = isTimerRunning ? "pause-circle-outline" : "play-circle-outline";
  if (stopButtonConfirm) pauseResumeIconName = "close-circle-outline";

  if (!isScreenReady || isGameContextLoading) {
    return (
      <ScreenWrapper style={styles.centeredMessageContainer}>
        <Stack.Screen options={{ title: t('common.loading', {defaultValue: "Laden..."}) }} />
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>{t('common.loadingData', {defaultValue: "Daten werden geladen..."})}</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.screenContainer}>
      <Stack.Screen options={{ title: t('gameScreen.title', {defaultValue: "Spielrunde"}) }} />
      <Animated.View style={[styles.globalScreenPulseOverlay, animatedGlobalScreenPulseStyle]} pointerEvents="none" />
      
      {__DEV__ && (
        <TouchableOpacity style={styles.adminGearButton} onPress={handleAdminButtonPress}>
          <Ionicons name="settings-outline" size={28} color={theme.colors.primaryText} />
        </TouchableOpacity>
      )}

      <View style={styles.wordDisplaySection}>
        <Text style={styles.wordLabel}>{t('gameScreen.currentWordLabel', {defaultValue: "Das aktuelle Wort:"})}</Text>
        <Text style={styles.wordText} numberOfLines={2} adjustsFontSizeToFit>{currentWord || "..."}</Text>
      </View>

      <View style={styles.timerSection}>
        <Animated.Text style={[styles.timerText, animatedTimerStyle]}>
          {timerDisplayValue}
        </Animated.Text>
      </View>

      <View style={styles.controlsSection}>
        {stopButtonConfirm ? (
            <Text style={styles.confirmStopText}>{t('gameScreen.confirmStopPrompt', {defaultValue: "Runde wirklich beenden?"})}</Text>
        ) : (
            <Text style={styles.instructionText}>
                {isTimerRunning ? t('gameScreen.roundIsRunning', {defaultValue: "Runde läuft..."}) 
                                : (pausedByButtonRef.current ? t('gameScreen.gamePaused', {defaultValue: "Spiel pausiert."}) 
                                : (timerValue === roundTimeInSeconds && roundTimeInSeconds > 0 ? t('gameScreen.readyToStartTapPlay', {defaultValue: "Bereit? Tippe Play!"}) 
                                : t('gameScreen.gamePausedTapPlay', {defaultValue: "Pausiert. Tippe Play!"})))}
            </Text>
        )}
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={[styles.mainActionButton, styles.pauseResumeButton]}
                onPress={handlePausePress}
                disabled={timerValue <= 0 && !stopButtonConfirm}
            >
                <Ionicons name={pauseResumeIconName} size={40} color={theme.colors.background} />
            </TouchableOpacity>
            
            <Animated.View style={animatedStopButtonWrapperStyle}>
                <TouchableOpacity
                    style={[
                        styles.mainActionButton,
                        stopButtonConfirm ? styles.confirmStopActiveButton : styles.stopButton,
                    ]}
                    onPress={handleStopRoundPress}
                    disabled={timerValue <= 0 && !stopButtonConfirm}
                >
                    <Ionicons name={stopButtonConfirm ? "checkmark-circle-outline" : "stop-circle-outline"} size={40} color={theme.colors.background} />
                </TouchableOpacity>
            </Animated.View>
        </View>
      </View>

      {/* Admin PIN Modal */}
      <Modal
        visible={isPinModalVisible}
        onRequestClose={() => setIsPinModalVisible(false)}
        transparent
        animationType="fade"
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsPinModalVisible(false)}>
          <Pressable style={styles.modalViewPin} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('gameScreen.adminEnterPinTitle')}</Text>
            <TextInput
              style={styles.pinInput}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={pinInput}
              onChangeText={setPinInput}
              autoFocus
              placeholder="PIN"
              placeholderTextColor={theme.colors.secondaryText}
            />
            <View style={styles.modalButtonRow}>
                <SecondaryButton title={t('common.cancel')} onPress={() => setIsPinModalVisible(false)} style={styles.modalButtonSecondary}/>
                <PrimaryButton title={t('common.submit')} onPress={handlePinSubmit} style={styles.modalButtonPrimary}/>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Admin Menu Modal */}
      <Modal
        visible={isAdminMenuVisible}
        onRequestClose={() => setIsAdminMenuVisible(false)}
        transparent
        animationType="slide"
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsAdminMenuVisible(false)}>
            <Pressable style={styles.modalViewAdminMenu} onPress={(e) => e.stopPropagation()}>
                <Text style={styles.modalTitle}>{t('gameScreen.adminMenuTitle')}</Text>
                
                <Text style={styles.adminLabel}>{t('gameScreen.adminChangeWordLabel')}</Text>
                <TextInput
                style={styles.adminWordInput}
                value={newWordInput}
                onChangeText={setNewWordInput}
                placeholder={t('gameScreen.adminNewWordPlaceholder')}
                placeholderTextColor={theme.colors.secondaryText}
                />
                <PrimaryButton title={t('gameScreen.adminApplyWordChange')} onPress={handleAdminChangeWordInternal} style={styles.adminMenuFullWidthButton} />

                <View style={styles.adminSeparator} />
                <PrimaryButton title={t('gameScreen.adminEndRound')} onPress={handleAdminEndRoundInternal} style={styles.adminMenuFullWidthButton} />
                <PrimaryButton title={t('gameScreen.adminRestartGame')} onPress={handleAdminRestartGameInternal} style={[styles.adminMenuFullWidthButton, {backgroundColor: theme.colors.destructiveAction}]} />
                
                <View style={styles.adminSeparator} />
                <SecondaryButton title={t('common.close')} onPress={() => setIsAdminMenuVisible(false)} style={styles.adminMenuFullWidthButton} />
            </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
};

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? theme.spacing.lg : theme.spacing.xl + theme.spacing.md, // Mehr Platz oben für Admin Button etc.
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md, // Weniger horizontales Padding für mehr Platz
  },
  centeredMessageContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: theme.fonts.secondary,
    fontSize: theme.fontSizes.h3,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  globalScreenPulseOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  adminGearButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Angepasst an SafeArea
    right: 15,
    padding: theme.spacing.sm,
    zIndex: 10,
  },
  wordDisplaySection: {
    flex: 1.5, // Mehr Platz für Wort
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  wordLabel: {
    fontFamily: theme.fonts.secondaryMedium,
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.xs,
  },
  wordText: {
    fontFamily: theme.fonts.primary,
    fontSize: theme.fontSizes.h1 + 6, // Größer
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  timerSection: {
    flex: 2.5, // Timer prominenter
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timerText: {
    fontFamily: theme.fonts.primary,
    fontSize: SCREEN_WIDTH * 0.32, // Leicht angepasst
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controlsSection: {
    flex: 2, // Mehr Platz für Controls
    alignItems: 'center',
    justifyContent: 'center', // Zentriert die Elemente in diesem Bereich
    width: '100%',
    paddingBottom: theme.spacing.md,
  },
  confirmStopText: {
    fontFamily: theme.fonts.secondaryMedium,
    fontSize: theme.fontSizes.h3 -2, // Etwas kleiner
    color: theme.colors.destructiveAction,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionText: {
    fontFamily: theme.fonts.secondary,
    fontSize: theme.fontSizes.body -1, // Etwas kleiner
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.lg, // Mehr Abstand zu Buttons
    minHeight: theme.fontSizes.body * 2,
    paddingHorizontal: theme.spacing.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Buttons etwas weiter auseinander
    alignItems: 'center',
    width: '90%',
    maxWidth: 320, // Etwas kleiner
  },
  mainActionButton: {
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 0.2,
    maxWidth: 75, // Leicht angepasst
    maxHeight: 75,
    borderRadius: (SCREEN_WIDTH * 0.2) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: theme.colors.primaryText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pauseResumeButton: {
    backgroundColor: theme.colors.secondaryAccent || theme.colors.accent, // Fallback, wenn secondaryAccent nicht definiert
  },
  stopButton: {
    backgroundColor: theme.colors.primaryAccent,
  },
  confirmStopActiveButton: {
    backgroundColor: theme.colors.destructiveAction,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalViewPin: { // Spezielles Styling für PIN-Modal
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxWidth: 320,
  },
  modalViewAdminMenu: { // Spezielles Styling für Admin-Menü
    margin: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 380,
  },
  modalTitle: {
    fontFamily: theme.fonts.primaryMedium,
    fontSize: theme.fontSizes.h2,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xl, // Mehr Abstand
    textAlign: "center",
  },
  pinInput: {
    borderBottomWidth: 2, // Sichtbarer
    borderColor: theme.colors.primaryAccent,
    color: theme.colors.primaryText,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fontSizes.h1, // Größer für PIN
    textAlign: 'center',
    width: 180,
    marginBottom: theme.spacing.xl + theme.spacing.sm,
    letterSpacing: theme.spacing.lg, // Mehr Abstand zwischen Zahlen
    fontFamily: theme.fonts.primary, // Passende Schrift
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  modalButtonPrimary: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  adminLabel: {
    fontFamily: theme.fonts.secondaryMedium,
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  adminWordInput: {
    width: '100%',
    backgroundColor: `${theme.colors.primaryText}10`, // Leichter Hintergrund für Input
    borderColor: theme.colors.borderColor,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.md -2 : theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSizes.body,
    color: theme.colors.primaryText,
    fontFamily: theme.fonts.secondary,
  },
  adminMenuFullWidthButton: {
    width: '100%',
    marginVertical: theme.spacing.xs + 2,
  },
  adminSeparator: {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.borderColor,
    marginVertical: theme.spacing.md,
  }
});