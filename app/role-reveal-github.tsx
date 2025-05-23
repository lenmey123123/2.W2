import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Pressable,
  Platform, Appearance, ActivityIndicator, Dimensions, InteractionManager
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useGame } from '../contexts/GameContext';
import { t } from '../constants/TempTranslations';
import { Player } from '../types/game';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, useAppTheme } from '../constants/ThemeConstants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const INTERACTION_BLOCK_DURATION = 700;
const FADE_DURATION = 300;

const RoleRevealGithubScreen: React.FC = () => {
  const router = useRouter();
  const { gameState, proceedToNextRoleReveal } = useGame();
  const theme = useAppTheme();
  const [cooldownProgress, setCooldownProgress] = useState(1);

  const {
    players,
    currentPlayerTurnForRoleReveal,
    currentCategory,
    gamePhase: currentGamePhaseFromContext,
    settings,
    currentWord: currentSecretWord,
    isLoading: isGameContextLoading
  } = gameState;

  const hintModeEnabled = settings.hintModeEnabled;

  const [isRoleDetailsVisible, setIsRoleDetailsVisible] = useState(false);
  const [isInteractionBlocked, setIsInteractionBlocked] = useState(true);
  const [currentDisplayedPlayer, setCurrentDisplayedPlayer] = useState<Player | null>(null);
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  const passToPlayerOpacity = useRef(new Animated.Value(0)).current;
  const cardFrontOpacity = useRef(new Animated.Value(1)).current;
  const cardBackOpacity = useRef(new Animated.Value(0)).current;

  const isFocused = useIsFocused();
  const navigationTriggeredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown-Animation: Nur Vibration am Ende, kein Overlay, kein Effekt
  useEffect(() => {
    if (isInteractionBlocked) {
      setCooldownProgress(0);
      let start: number | null = null;
      let frame: number;
      const duration = INTERACTION_BLOCK_DURATION;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        setCooldownProgress(progress);
        if (progress < 1) {
          frame = requestAnimationFrame(animate);
        } else {
          setCooldownProgress(1);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      };
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    } else {
      setCooldownProgress(1);
    }
  }, [isInteractionBlocked]);

  useEffect(() => {
    passToPlayerOpacity.setValue(0);
    cardFrontOpacity.setValue(1);
    cardBackOpacity.setValue(0);
    setIsRoleDetailsVisible(false);

    if (isFocused) {
      navigationTriggeredRef.current = false;
      setIsScreenLoading(true);

      if (isGameContextLoading) {
        return;
      }

      if (currentGamePhaseFromContext === 'RoleReveal') {
        if (players && players.length > 0 && currentPlayerTurnForRoleReveal < players.length) {
          const player = players[currentPlayerTurnForRoleReveal];
          setCurrentDisplayedPlayer(player);
          setIsInteractionBlocked(true);

          Animated.timing(passToPlayerOpacity, {
            toValue: 1,
            duration: FADE_DURATION,
            useNativeDriver: Platform.OS !== 'web',
          }).start(() => {
            setTimeout(() => {
              setIsInteractionBlocked(false);
            }, INTERACTION_BLOCK_DURATION);
          });
          setIsScreenLoading(false);
        } else if (players && players.length > 0 && currentPlayerTurnForRoleReveal >= players.length) {
          setIsScreenLoading(false);
          setCurrentDisplayedPlayer(null);
        } else if ((!players || players.length === 0) && !isGameContextLoading) {
          InteractionManager.runAfterInteractions(() => router.replace('/setup-step1'));
        } else {
          setIsScreenLoading(true);
        }
      } else if (currentGamePhaseFromContext === 'WordPhase' || currentGamePhaseFromContext === 'playing') {
        if (!navigationTriggeredRef.current) {
          navigationTriggeredRef.current = true;
          InteractionManager.runAfterInteractions(() => router.replace('/game-play'));
        }
      } else if (
        currentGamePhaseFromContext !== 'setup_step1' &&
        currentGamePhaseFromContext !== 'setup_step2' &&
        currentGamePhaseFromContext !== 'setup_step3'
      ) {
        InteractionManager.runAfterInteractions(() => router.replace('/setup-step1'));
      } else {
        setIsScreenLoading(true);
      }
    } else {
      setIsInteractionBlocked(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, currentGamePhaseFromContext, players, currentPlayerTurnForRoleReveal, isGameContextLoading]);

  const handleCardPress = () => {
    if (isInteractionBlocked) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsInteractionBlocked(true);

    if (!isRoleDetailsVisible) {
      Animated.sequence([
        Animated.timing(cardFrontOpacity, { toValue: 0, duration: FADE_DURATION / 2, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(cardBackOpacity, { toValue: 1, duration: FADE_DURATION, useNativeDriver: Platform.OS !== 'web' })
      ]).start(() => {
        setIsRoleDetailsVisible(true);
        setIsInteractionBlocked(false);
      });
    } else {
      Animated.parallel([
        Animated.timing(passToPlayerOpacity, { toValue: 0, duration: FADE_DURATION, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(cardBackOpacity, { toValue: 0, duration: FADE_DURATION, useNativeDriver: Platform.OS !== 'web' })
      ]).start(() => {
        proceedToNextRoleReveal('RoleRevealScreen.handleCardPress.PathB');
      });
    }
  };

  const styles = getStyles(theme);

  if (
    isScreenLoading ||
    isGameContextLoading ||
    (currentGamePhaseFromContext === 'RoleReveal' &&
      !currentDisplayedPlayer &&
      !(players && currentPlayerTurnForRoleReveal >= players.length && players.length > 0))
  ) {
    let loadingMessageKey = 'common.loadingData';
    if (
      (currentGamePhaseFromContext === 'WordPhase' || currentGamePhaseFromContext === 'playing') &&
      players &&
      currentPlayerTurnForRoleReveal >= players.length
    ) {
      loadingMessageKey = 'roleRevealScreen.startingGame';
    }
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Laden...'}} />
        <ActivityIndicator size="large" color={theme.colors.primaryAccent} />
        <Text style={styles.loadingText}>{t(loadingMessageKey)}</Text>
      </View>
    );
  }

  if (
    !currentDisplayedPlayer &&
    currentGamePhaseFromContext === 'RoleReveal' &&
    players &&
    players.length > 0 &&
    currentPlayerTurnForRoleReveal < players.length
  ) {
    InteractionManager.runAfterInteractions(() => router.replace('/setup-step1'));
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Fehler'}} />
        <Text style={styles.errorText}>{t('errors.genericError')}</Text>
      </View>
    );
  }
  if (
    !currentDisplayedPlayer &&
    currentGamePhaseFromContext === 'RoleReveal' &&
    players &&
    currentPlayerTurnForRoleReveal >= players.length
  ) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Starte Spiel...'}} />
        <ActivityIndicator size="large" color={theme.colors.primaryAccent} />
        <Text style={styles.loadingText}>{t('roleRevealScreen.startingGame')}</Text>
      </View>
    );
  }

  const roleText =
    currentDisplayedPlayer?.role === 'Erzfeind'
      ? t('roles.archEnemy')
      : t('roles.wordKnower');
  const fellowEnemiesText =
    currentDisplayedPlayer?.role === 'Erzfeind' &&
    currentDisplayedPlayer?.fellowArchEnemies &&
    currentDisplayedPlayer.fellowArchEnemies.length > 0
      ? `${t('roleRevealScreen.fellowArchEnemiesTitle')}: ${currentDisplayedPlayer.fellowArchEnemies.join(', ')}`
      : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: currentDisplayedPlayer?.name || 'Rolle aufdecken' }} />
      <Animated.Text style={[styles.passToPlayerText, { opacity: passToPlayerOpacity }]}>
        {currentDisplayedPlayer ? t('roleRevealScreen.passToPlayer', { playerName: currentDisplayedPlayer.name }) : ""}
      </Animated.Text>

      {currentDisplayedPlayer && (
        <Pressable
          onPress={handleCardPress}
          style={[styles.cardPressableArea]}
          testID="card-pressable"
          disabled={isInteractionBlocked}
        >
          <View style={styles.cardBase}>
            <View style={[styles.cardFace, styles.cardFaceFront]}>
              <Ionicons name="help-circle-outline" size={SCREEN_WIDTH * 0.35} color={theme.colors.primaryAccent} />
              <Text style={styles.cardFrontText}>{t('roleRevealScreen.tapToReveal')}</Text>
            </View>
            <Animated.View style={[styles.cardFace, styles.cardFaceBack, { opacity: cardBackOpacity }]}>
              <Text style={styles.roleTitle}>{roleText}</Text>
              {currentDisplayedPlayer.role === 'Wortkenner' && currentSecretWord ? (
                <Text style={styles.secretWordText} numberOfLines={2} adjustsFontSizeToFit>{currentSecretWord}</Text>
              ) : null}
              {currentDisplayedPlayer.role === 'Erzfeind' ? (
                <Text style={styles.hintText}>
                  {hintModeEnabled && currentCategory
                    ? t('roleRevealScreen.archEnemyHint', { category: currentCategory })
                    : t('roleRevealScreen.erzfeindNoHintShort')}
                </Text>
              ) : null}
              {fellowEnemiesText ? (
                <Text style={styles.fellowEnemiesText}>{fellowEnemiesText}</Text>
              ) : null}
              {isRoleDetailsVisible && (
                <Text style={styles.tapToContinueText}>
                  {currentPlayerTurnForRoleReveal < players.length - 1
                    ? t('roleRevealScreen.tapCardToContinue')
                    : t('roleRevealScreen.tapToStartGame')}
                </Text>
              )}
            </Animated.View>
          </View>
        </Pressable>
      )}
    </View>
  );
};

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontFamily: theme.fonts.secondary,
    fontSize: theme.fontSizes.h3,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.fonts.secondaryMedium,
    fontSize: theme.fontSizes.h2,
    color: theme.colors.destructiveAction,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  passToPlayerText: {
    fontFamily: theme.fonts.primaryMedium,
    fontSize: theme.fontSizes.h2,
    color: theme.colors.primaryText,
    textAlign: 'center',
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.12,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  cardPressableArea: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.6,
    maxWidth: 380,
    maxHeight: 580,
    alignItems: 'center',
    justifyContent: 'center',
  },
// ...existing code...
cardBase: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.xl + theme.spacing.sm,
    backgroundColor: theme.colors.cardBackground,
    position: 'relative',
    overflow: Platform.OS === 'android' ? 'visible' : 'hidden', // wichtig für Android
    // Schatten für iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    // Schatten für Android
    elevation: 24,
  },
// ...existing code...
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.xl + theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backfaceVisibility: 'hidden',
  },
  cardFaceFront: {
    backgroundColor: theme.colors.floatingElementBackground,
  },
  cardFaceBack: {
    backgroundColor: theme.colors.primaryAccent,
  },
  cardFrontText: {
    fontFamily: theme.fonts.secondaryMedium,
    fontSize: theme.fontSizes.h2,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  roleTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: theme.fontSizes.h1 + 2,
    color: theme.colors.background,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secretWordText: {
    fontFamily: theme.fonts.primaryMedium,
    fontSize: theme.fontSizes.h1 + theme.spacing.xs,
    color: theme.colors.background,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  hintText: {
    fontFamily: theme.fonts.secondary,
    fontSize: theme.fontSizes.h3,
    color: theme.colors.background + 'E6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: theme.spacing.sm,
  },
  fellowEnemiesText: {
    fontFamily: theme.fonts.secondary,
    fontSize: theme.fontSizes.body,
    color: theme.colors.background + 'CC',
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  tapToContinueText: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    fontFamily: theme.fonts.secondaryMedium,
    fontSize: theme.fontSizes.caption,
    color: theme.colors.background + 'B3',
  }
});

export default RoleRevealGithubScreen;