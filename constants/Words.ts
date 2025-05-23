export interface Category {
    name: string;
    words: string[];
  }
  
  export const CATEGORIES: Category[] = [
    {
      name: 'Tiere',
      words: ['Hund', 'Katze', 'Elefant', 'Giraffe', 'Löwe', 'Tiger', 'Zebra', 'Affe', 'Krokodil', 'Pinguin'],
    },
    {
      name: 'Obst & Gemüse',
      words: ['Apfel', 'Banane', 'Orange', 'Traube', 'Erdbeere', 'Karotte', 'Brokkoli', 'Tomate', 'Gurke', 'Paprika'],
    },
    {
      name: 'Berufe',
      words: ['Arzt', 'Lehrer', 'Polizist', 'Feuerwehrmann', 'Koch', 'Ingenieur', 'Künstler', 'Musiker', 'Pilot', 'Bäcker'],
    },
    {
      name: 'Sportarten',
      words: ['Fußball', 'Basketball', 'Tennis', 'Schwimmen', 'Volleyball', 'Golf', 'Hockey', 'Boxen', 'Surfen', 'Skifahren'],
    },
    // Die Kategorie "Alltagsgegenstände" wurde entfernt.
    // {
    //   name: 'Alltagsgegenstände',
    //   words: ['Stuhl', 'Tisch', 'Lampe', 'Buch', 'Telefon', 'Computer', 'Schlüssel', 'Brille', 'Tasse', 'Uhr'],
    // },
  ];
  
  export const RANDOM_CATEGORY_NAME = 'Zufällige Kategorie / Alle Wörter';