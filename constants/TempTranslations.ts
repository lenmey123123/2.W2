// Dieser Screen braucht einige Übersetzungen. Wir erstellen temporäre Stubs.
// Du solltest dies später durch dein richtiges i18n-System ersetzen.
const translations: Record<string, Record<string, string>> = {
    en: {
      'common.loadingData': 'Loading data...',
      'roleRevealScreen.startingGame': 'Starting game...',
      'errors.genericError': 'An error occurred. Please try again.',
      'roleRevealScreen.passToPlayer': 'Pass the device to {{playerName}}.',
      'roleRevealScreen.tapToReveal': 'Tap card to reveal your role',
      'roles.archEnemy': 'Arch-Enemy',
      'roles.wordKnower': 'Word Knower',
      'roleRevealScreen.fellowArchEnemiesTitle': 'Fellow Arch-Enemies',
      'roleRevealScreen.archEnemyHint': 'The category is "{{category}}". Find the secret word!',
      'roleRevealScreen.erzfeindNoHintShort': 'Find the secret word!',
      'roleRevealScreen.tapCardToContinue': 'Tap card to hide & pass',
      'roleRevealScreen.tapToStartGame': 'Tap card to start the game',
    },
    de: { // Deutsche Übersetzungen
      'common.loadingData': 'Lade Daten...',
      'roleRevealScreen.startingGame': 'Spiel wird gestartet...',
      'errors.genericError': 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
      'roleRevealScreen.passToPlayer': 'Gib das Gerät an {{playerName}}.',
      'roleRevealScreen.tapToReveal': 'Tippe, um deine Rolle aufzudecken',
      'roles.archEnemy': 'Erzfeind',
      'roles.wordKnower': 'Wortkenner',
      'roleRevealScreen.fellowArchEnemiesTitle': 'Mit-Erzfeinde', // Angepasst für Singular/Plural
      'roleRevealScreen.archEnemyHint': 'Die Kategorie ist "{{category}}". Finde das geheime Wort!',
      'roleRevealScreen.erzfeindNoHintShort': 'Finde das geheime Wort!',
      'roleRevealScreen.tapCardToContinue': 'Tippe, um zu verbergen & weiterzugeben',
      'roleRevealScreen.tapToStartGame': 'Tippe, um das Spiel zu starten',
    }
  };
  
  // Einfache t-Funktion
  export const t = (key: string, options?: { [key: string]: string | number }): string => {
    const lang = 'de'; // Feste Sprache für jetzt auf Deutsch eingestellt
    let translation = translations[lang]?.[key] || translations.en?.[key] || key; // Fallback auf Englisch, dann auf den Key selbst
  
    if (options) {
      Object.keys(options).forEach(optKey => {
        // Ersetzt Platzhalter wie {{playerName}} durch den Wert aus options
        const regex = new RegExp(`{{${optKey}}}`, 'g');
        translation = translation.replace(regex, String(options[optKey]));
      });
    }
    return translation;
  };