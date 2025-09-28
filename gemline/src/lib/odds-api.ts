// The Odds API Integration for MLB odds
import { matchTeamBetweenAPIs } from './mlb-team-mapping';

export interface OddsOutcome {
  name: string;
  price: number;
}

export interface OddsMarket {
  key: string;
  last_update?: string;
  outcomes: OddsOutcome[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsMarket[];
}

export interface OddsGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface FanDuelOdds {
  homeTeam: string;
  awayTeam: string;
  homeOdds?: number;
  awayOdds?: number;
  lastUpdate?: string;
}

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';
const SPORT_KEY = 'baseball_mlb';
const TIME_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch MLB odds from The Odds API
 */
export async function fetchMLBOdds(apiKey: string): Promise<OddsGame[]> {
  try {
    const url = new URL(`${ODDS_API_BASE_URL}/sports/${SPORT_KEY}/odds`);
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('regions', 'us');
    url.searchParams.append('markets', 'h2h'); // Head to head (moneyline)
    url.searchParams.append('bookmakers', 'fanduel'); // Only FanDuel odds
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`The Odds API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching odds from The Odds API:', error);
    throw error;
  }
}

/**
 * Extract FanDuel odds from a game
 */
export function extractFanDuelOdds(game: OddsGame): FanDuelOdds | null {
  const fanduel = game.bookmakers.find(b => b.key === 'fanduel');
  
  if (!fanduel) {
    return null;
  }
  
  const h2hMarket = fanduel.markets.find(m => m.key === 'h2h');
  
  if (!h2hMarket || h2hMarket.outcomes.length < 2) {
    return null;
  }
  
  const homeOutcome = h2hMarket.outcomes.find(o => o.name === game.home_team);
  const awayOutcome = h2hMarket.outcomes.find(o => o.name === game.away_team);
  
  return {
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    homeOdds: homeOutcome?.price,
    awayOdds: awayOutcome?.price,
    lastUpdate: fanduel.last_update
  };
}

/**
 * Match Sportradar game with Odds API game
 */
export function matchGamesWithOdds(
  sportradarGame: any,
  oddsGames: OddsGame[]
): OddsGame | null {
  const gameTime = new Date(sportradarGame.scheduled);
  
  for (const oddsGame of oddsGames) {
    const oddsGameTime = new Date(oddsGame.commence_time);
    
    // Check if game times are within window
    const timeDiff = Math.abs(gameTime.getTime() - oddsGameTime.getTime());
    if (timeDiff > TIME_WINDOW_MS) {
      continue;
    }
    
    // Match teams
    const homeMatch = matchTeamBetweenAPIs(
      { 
        id: sportradarGame.home?.sr_id || sportradarGame.home?.id,
        name: sportradarGame.home?.name 
      },
      oddsGame.home_team
    );
    
    const awayMatch = matchTeamBetweenAPIs(
      { 
        id: sportradarGame.away?.sr_id || sportradarGame.away?.id,
        name: sportradarGame.away?.name 
      },
      oddsGame.away_team
    );
    
    if (homeMatch && awayMatch) {
      return oddsGame;
    }
  }
  
  return null;
}

/**
 * Convert decimal odds to American odds
 */
export function decimalToAmerican(decimalOdds: number): number {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
  }
}

/**
 * Calculate implied probability from decimal odds
 */
export function calculateImpliedProbability(decimalOdds: number): number {
  // The Odds API returns decimal odds
  return 1 / decimalOdds;
}

/**
 * Format American odds for display
 */
export function formatAmericanOdds(decimalOdds?: number): string {
  if (!decimalOdds) return '-';
  const americanOdds = decimalToAmerican(decimalOdds);
  return americanOdds > 0 ? `+${americanOdds}` : `${americanOdds}`;
}
