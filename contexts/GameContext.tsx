// contexts/GameContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameState, GameContextType, Player, GameSettings, GamePhase, PlayerRole } from '../types/game'; // Pfad anpassen
import { CATEGORIES, RANDOM_CATEGORY_NAME } from '../constants/Words'; // Pfad anpassen

const DefaultImposterCount = 1;
const DEFAULT_ROUND_TIME_SECONDS = 120; // Standard 2 Minuten gemäß neuer Anforderung

const initialGameState: GameState = {
  gamePhase: 'setup_step1',
  settings: {
    playerCount: 3, // Wird von SetupStep1 gesetzt
    categoryName: RANDOM_CATEGORY_NAME,
    roundTimeInSeconds: DEFAULT_ROUND_TIME_SECONDS,
    imposterCount: DefaultImposterCount, // Wird von SetupStep1 gesetzt
    hintModeEnabled: true, // Wird von SetupStep2 gesetzt
  },
  players: [],
  currentPlayerTurnForRoleReveal: 0,
  currentWord: '',
  currentCategory: RANDOM_CATEGORY_NAME,
  timerValue: DEFAULT_ROUND_TIME_SECONDS,
  isTimerRunning: false,
  isLoading: true,
  roundTimeInSeconds: DEFAULT_ROUND_TIME_SECONDS, // Wird von SetupStep3 gesetzt
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState(prev => ({ ...prev, isLoading: false }));
      console.log('[GameContext] Initial context load complete (isLoading: false)');
    }, 100);
    return () => { /* ... cleanup ... */ clearTimeout(timer); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, []);

  // console.log('[GameContext] STATE UPDATE:', gameState.gamePhase, 'Timer:', gameState.timerValue, 'Running:', gameState.isTimerRunning);

  const getWordsForCategory = useCallback(/* ... bleibt gleich ... */ (categoryName?: string): string[] => {
    if (!categoryName || categoryName === RANDOM_CATEGORY_NAME) return CATEGORIES.flatMap(cat => cat.words);
    const selectedCategory = CATEGORIES.find(cat => cat.name === categoryName);
    return selectedCategory ? selectedCategory.words : CATEGORIES.flatMap(cat => cat.words);
  }, []);


  const initializeGame = useCallback((
    playerCount: number,
    imposterCount: number,
    categoryName = RANDOM_CATEGORY_NAME,
    hintMode = false, // Standardwert hier, falls nicht übergeben
    roundTime = DEFAULT_ROUND_TIME_SECONDS,
    playerNamesInput?: string[]
  ) => {
    console.log(`[GameContext] initializeGame: playerCount=${playerCount}, imposterCount=${imposterCount}, category=${categoryName}, hintMode=${hintMode}, roundTime=${roundTime}, playerNames:`, playerNamesInput);
    setGameState(prev => ({ ...prev, isLoading: true }));
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const settings: GameSettings = {
      playerCount,
      categoryName,
      roundTimeInSeconds: roundTime,
      imposterCount: imposterCount,
      hintModeEnabled: hintMode,
    };

    const words = getWordsForCategory(categoryName);
    if (words.length === 0) { /* ... Fehlerbehandlung ... */ setGameState(prev => ({ ...prev, isLoading: false })); return; }
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    const playersArray: Player[] = [];
    const erzfeindIndices = new Set<number>();
    const actualImposterCount = Math.min(imposterCount, playerCount);
    while (erzfeindIndices.size < actualImposterCount) {
        erzfeindIndices.add(Math.floor(Math.random() * playerCount));
    }

    for (let i = 0; i < playerCount; i++) {
      const isErzfeind = erzfeindIndices.has(i);
      const name = (playerNamesInput && playerNamesInput[i] && playerNamesInput[i].trim() !== "")
                   ? playerNamesInput[i].trim()
                   : `Spieler ${i + 1}`;
      playersArray.push({
        id: `player-${i + 1}`, name: name, role: isErzfeind ? 'Erzfeind' : 'Wortkenner',
        isImposter: isErzfeind, roleWord: isErzfeind ? undefined : randomWord, fellowArchEnemies: [],
      });
    }

    setGameState(prev => ({
      ...prev, gamePhase: 'RoleReveal', settings, players: playersArray, currentWord: randomWord,
      currentCategory: categoryName, currentPlayerTurnForRoleReveal: 0,
      timerValue: roundTime, isTimerRunning: false, isLoading: false, roundTimeInSeconds: roundTime,
    }));
  }, [getWordsForCategory]); // Abhängigkeit hinzugefügt

  // ... (proceedToNextRoleReveal, setGamePhase, startGameTimer, stopGameTimer, setTimerValue, goToResolutionPhase, changeSecretWord, getImposter, endGame, resetGame mit useCallback memoisiert wie zuvor) ...
  // Stelle sicher, dass alle diese Funktionen useCallback verwenden, um unnötige Re-Renders zu vermeiden.
  // Beispiel für resetGame:
  const resetGame = useCallback(() => {
    console.log('[GameContext] resetGame: Resetting to initial state (setup_step1).');
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setGameState({...initialGameState, gamePhase: 'setup_step1', isLoading: true});
  }, []); // initialGameState ist konstant

  const proceedToNextRoleReveal = useCallback(/* ... */ () => {
    setGameState(prev => { /* ... wie zuvor ... */
      const nextTurn = prev.currentPlayerTurnForRoleReveal + 1;
      if (nextTurn < prev.settings.playerCount) {
        return { ...prev, currentPlayerTurnForRoleReveal: nextTurn, gamePhase: 'RoleReveal' };
      } else {
        return { ...prev, gamePhase: 'WordPhase', currentPlayerTurnForRoleReveal: nextTurn, timerValue: prev.settings.roundTimeInSeconds, isTimerRunning: false };
      }
    });
  }, []);

  const setGamePhase = useCallback(/* ... */ (phase: GamePhase) => setGameState(prev => ({ ...prev, gamePhase: phase })), []);
  const startGameTimer = useCallback(/* ... */ () => {
    setGameState(prev => {
        if (prev.isTimerRunning || prev.timerValue <= 0) return prev;
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
            setGameState(ps => {
                if (ps.timerValue > 0 && ps.isTimerRunning) return { ...ps, timerValue: ps.timerValue - 1 };
                else {
                    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                    return { ...ps, isTimerRunning: false, gamePhase: ps.timerValue <=0 && ps.isTimerRunning ? 'Resolution' : ps.gamePhase };
                }
            });
        }, 1000);
        return { ...prev, isTimerRunning: true };
    });
  }, []);
  const stopGameTimer = useCallback(/* ... */ () => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    setGameState(prev => ({ ...prev, isTimerRunning: false }));
  }, []);
  const setTimerValue = useCallback(/* ... */ (value: number) => setGameState(prev => ({...prev, timerValue: value})), []);
  const goToResolutionPhase = useCallback(/* ... */ (params?: { reasonKey?: string }) => {
    stopGameTimer();
    setGameState(prev => ({ ...prev, gamePhase: 'Resolution' }));
  }, [stopGameTimer]);
  const changeSecretWord = useCallback(/* ... */ (newWord: string) => {
    setGameState(prev => ({ ...prev, currentWord: newWord, players: prev.players.map(p => p.role === 'Wortkenner' ? { ...p, roleWord: newWord } : p) }));
  }, []);
  const getImposter = useCallback(/* ... */ (): Player | undefined => gameState.players.find(p => p.role === 'Erzfeind'), [gameState.players]);
  const endGame = useCallback(/* ... */ () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setGameState(prev => ({ ...prev, gamePhase: 'GameOver' }));
  }, []);


  const contextValue = useMemo(() => ({
    gameState, initializeGame, proceedToNextRoleReveal, setGamePhase, startGameTimer,
    stopGameTimer, setTimerValue, goToResolutionPhase, changeSecretWord, getImposter,
    endGame, resetGame, getWordsForCategory: getWordsForCategory, // getWordsForCategory hier direkt verwenden
  }), [
    gameState, initializeGame, proceedToNextRoleReveal, setGamePhase, startGameTimer,
    stopGameTimer, setTimerValue, goToResolutionPhase, changeSecretWord, getImposter,
    endGame, resetGame, getWordsForCategory // getWordsForCategory als Abhängigkeit
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};