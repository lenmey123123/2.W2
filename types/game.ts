// types/game.ts
export type PlayerRole = 'Wortkenner' | 'Erzfeind';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  isImposter: boolean;
  roleWord?: string;
  fellowArchEnemies?: string[];
  // votesReceived?: string[]; // Entfernt, da kein Voting
}

export type GamePhase =
  | 'Setup' // Kompatibilität mit altem GameScreen
  | 'RoleReveal'
  | 'WordPhase' // Kompatibilität mit altem GameScreen (unser 'playing')
  | 'Resolution'// Kompatibilität mit altem GameScreen (unser 'results_internal')
  | 'GameOver'   // Kompatibilität mit altem GameScreen
  // Unsere Phasen
  | 'setup_step1'
  | 'setup_step2'
  | 'setup_step3'
  | 'playing'
  | 'results_internal' // Unsere interne Phase für Ergebnisse
  | 'game_over_internal';


export interface GameSettings {
  playerCount: number;
  categoryName?: string;
  imposterCount: number;
  hintModeEnabled?: boolean;
  roundTimeInSeconds: number; // Ehemals timerDuration, jetzt explizit
}

export interface GameState {
  gamePhase: GamePhase;
  settings: GameSettings;
  players: Player[];
  currentPlayerTurnForRoleReveal: number;
  currentWord: string;
  currentCategory?: string;
  timerValue: number;
  isTimerRunning: boolean; // Für den neuen GameScreen
  // votes: Record<string, string>; // Entfernt
  isLoading: boolean;
  roundTimeInSeconds: number; // Duplikat aus Settings für einfachen Zugriff im GameScreen
}

export interface GameContextType {
    gameState: GameState;
    proceedToNextRoleReveal: (caller?: string) => void;
    initializeGame: (
      playerCount: number,
      imposterCount: number, // Ist bereits Teil der Signatur
      categoryName?: string,
      hintMode?: boolean,
      roundTime?: number,
      playerNames?: string[] // Ist bereits Teil der Signatur
    ) => void;
    setGamePhase: (phase: GamePhase) => void;
    startGameTimer: () => void;
    stopGameTimer: () => void;
    goToResolutionPhase: (params?: { reasonKey?: string }) => void;
    changeSecretWord: (newWord: string) => void;
    setTimerValue: (value: number) => void;
    getImposter: () => Player | undefined;
    endGame: () => void;
    resetGame: () => void;
    getWordsForCategory: (categoryName?: string) => string[];
  }