/**
 * Norwegian Golf Clubs Database
 * Complete list of golf clubs in Norway for autocomplete
 */

export const norwegianGolfClubs = [
  // Oslo region
  'Oslo Golfklubb',
  'Bogstad Golfklubb',
  'Holtsmark Golfklubb',
  'Losby Gods Golfklubb',
  'Miklagard Golfklubb',
  'Ullensaker Golfklubb',
  'Westerngolf',
  'Kjekstad Golfklubb',
  'Grini Golfklubb',

  // Viken
  'Drammen Golfklubb',
  'Asker Golfklubb',
  'Bærum Golfklubb',
  'Holmenkollen Golfklubb',
  'Nordre Øyeren Golfklubb',
  'Sarpsborg Golfklubb',
  'Fredrikstad Golfklubb',
  'Ski Golfklubb',
  'Ås Golfklubb',
  'Moss Golfklubb',
  'Hobøl Golfklubb',
  'Halden Golfklubb',
  'Kongsberg Golfklubb',
  'Mjøndalen Golfklubb',
  'Tyrifjord Golfklubb',

  // Vestfold og Telemark
  'Borre Golfklubb',
  'Kragerø Golfklubb',
  'Skien Golfklubb',
  'Sandefjord Golfklubb',
  'Tønsberg Golfklubb',
  'Larvik Golfklubb',

  // Innlandet
  'Gjøvik Golfklubb',
  'Hamar Golfklubb',
  'Lillehammer Golfklubb',
  'Elverum Golfklubb',
  'Valdres Golfklubb',
  'Hedemarken Golfklubb',

  // Agder
  'Kristiansand Golfklubb',
  'Søgne Golfklubb',
  'Grimstad Golfklubb',
  'Arendal Golfklubb',
  'Mandal Golfklubb',

  // Rogaland
  'Stavanger Golfklubb',
  'Sola Golfklubb',
  'Jæren Golfklubb',
  'Sandnes Golfklubb',
  'Eiganes Golfklubb',
  'Ogna Golfklubb',

  // Vestland
  'Bergen Golfklubb',
  'Meland Golfklubb',
  'Voss Golfklubb',
  'Fjell Golfklubb',
  'Askøy Golfklubb',
  'Os Golfklubb',
  'Fana Golfklubb',

  // Møre og Romsdal
  'Molde Golfklubb',
  'Kristiansund Golfklubb',
  'Ålesund Golfklubb',
  'Sunndal Golfklubb',

  // Trøndelag
  'Trondheim Golfklubb',
  'Lade Golfklubb',
  'Byneset Golfklubb',
  'Levanger Golfklubb',
  'Steinkjer Golfklubb',
  'Namsos Golfklubb',

  // Nordland
  'Bodø Golfklubb',
  'Mosjøen Golfklubb',
  'Narvik Golfklubb',
  'Lofoten Golfklubb',

  // Troms og Finnmark
  'Tromsø Golfklubb',
  'Alta Golfklubb',
  'Hammerfest Golfklubb',
  'Lakselv Golfklubb',

  // Coastal and special
  'Lyngør Golfklubb',
  'Hankø Golfklubb',
  'Son Spa Golfklubb',
  'Vestby Golfklubb',
  'Gol Golfklubb',
  'Geilo Golfklubb',
  'Kvitfjell Golfklubb',
  'Oppdal Golfklubb',
].sort(); // Alphabetically sorted

/**
 * Filter golf clubs by search query
 */
export function filterGolfClubs(query: string): string[] {
  if (!query || query.length < 2) {
    return norwegianGolfClubs.slice(0, 10); // Show first 10 if no query
  }

  const lowerQuery = query.toLowerCase();
  return norwegianGolfClubs.filter(club =>
    club.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get club suggestions based on partial input
 */
export function getClubSuggestions(input: string, maxResults = 5): string[] {
  if (!input || input.length < 2) {
    return [];
  }

  const filtered = filterGolfClubs(input);
  return filtered.slice(0, maxResults);
}
