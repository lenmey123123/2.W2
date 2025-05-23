export type GameStackNavigatorParamList = {
    'index': undefined;
    'setup-step1': undefined;
    'setup-step2': { playerCount: number };
    'setup-step3': { playerCount: number; categoryName?: string };
    'role-reveal-handoff': { nextPlayerName: string };
    'role-reveal-action': { playerId: string };
    'game-play': undefined;
    'voting-handoff': { nextPlayerName: string };
    'voting-action': { voterId: string };
    'results': undefined;
    'game-over': undefined;
  };
  
  declare global {
    namespace ReactNavigation {
      interface RootParamList extends GameStackNavigatorParamList {}
    }
  }