import { NextResponse } from 'next/server';
import { 
  getTeamColors,
  getLocalTeamLogo,
  AP_IMAGES_ENABLED,
  buildLogoProxyUrl,
  buildLogoIndex
} from '@/lib/mlb-logos';
import { 
  loadCachedSchedule, 
  saveCachedSchedule 
} from '@/lib/schedule-cache';
import { 
  fetchMLBOdds, 
  matchGamesWithOdds, 
  extractFanDuelOdds,
  formatAmericanOdds,
  calculateImpliedProbability
} from '@/lib/odds-api';
import { findTeamBySportradarId } from '@/lib/mlb-team-mapping';

// Fallback team names for unknown teams
const teamNameMap: Record<string, string> = {
  'sr:competitor:3': 'Arizona Diamondbacks',
  'sr:competitor:4': 'Atlanta Braves',
  'sr:competitor:5': 'Baltimore Orioles',
  'sr:competitor:6': 'Boston Red Sox',
  'sr:competitor:7': 'Chicago Cubs',
  'sr:competitor:8': 'Chicago White Sox',
  'sr:competitor:9': 'Cincinnati Reds',
  'sr:competitor:10': 'Cleveland Guardians',
  'sr:competitor:11': 'Colorado Rockies',
  'sr:competitor:12': 'Detroit Tigers',
  'sr:competitor:13': 'Houston Astros',
  'sr:competitor:14': 'Kansas City Royals',
  'sr:competitor:15': 'Los Angeles Angels',
  'sr:competitor:16': 'Los Angeles Dodgers',
  'sr:competitor:17': 'Miami Marlins',
  'sr:competitor:18': 'Milwaukee Brewers',
  'sr:competitor:19': 'Minnesota Twins',
  'sr:competitor:20': 'New York Mets',
  'sr:competitor:21': 'New York Yankees',
  'sr:competitor:22': 'Oakland Athletics',
  'sr:competitor:23': 'Philadelphia Phillies',
  'sr:competitor:24': 'Pittsburgh Pirates',
  'sr:competitor:25': 'San Diego Padres',
  'sr:competitor:26': 'San Francisco Giants',
  'sr:competitor:27': 'Seattle Mariners',
  'sr:competitor:28': 'St. Louis Cardinals',
  'sr:competitor:29': 'Tampa Bay Rays',
  'sr:competitor:30': 'Texas Rangers',
  'sr:competitor:31': 'Toronto Blue Jays',
  'sr:competitor:32': 'Washington Nationals'
};

// Generic fallback logo for unknown teams (local asset)
const genericFallbackLogo = '/fallback-mlb-logo.svg';

interface Game {
  id: string;
  scheduled: string;
  status: string;
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    colors: { primary: string; secondary: string };
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    colors: { primary: string; secondary: string };
    score?: number;
  };
  venue?: {
    name: string;
    location?: string;
  };
  fanduelOdds?: {
    homeOdds: string;
    awayOdds: string;
    homeImpliedProbability: string;
    awayImpliedProbability: string;
    lastUpdate?: string;
  };
}

export async function GET(request: Request) {
  try {
    // Check for force refresh parameter
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // Try to load from cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedSchedule = await loadCachedSchedule();
      if (cachedSchedule) {
        return NextResponse.json(cachedSchedule);
      }
    }

    // Get API keys from environment variables
    const apiKey = process.env.master_key;
    const oddsApiKey = process.env.odds_api_key;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'MLB API key not configured' },
        { status: 500 }
      );
    }
    
    if (!oddsApiKey) {
      console.warn('⚠️ Odds API key not configured - odds will not be available');
    }

    console.log('🔄 Fetching fresh MLB schedule from Sportradar API...');

    // Get today's date in the format required by the API
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Fetch today's MLB schedule from Sportradar
    const response = await fetch(
      `https://api.sportradar.com/mlb/trial/v8/en/games/${year}/${month}/${day}/schedule.json?api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Build logo index only if AP Images is enabled (for future use)
    if (AP_IMAGES_ENABLED) {
      await buildLogoIndex(apiKey);
    }

    // Fetch odds from The Odds API if key is available
    let oddsGames: any[] = [];
    if (oddsApiKey) {
      try {
        console.log('🎲 Fetching FanDuel odds from The Odds API...');
        oddsGames = await fetchMLBOdds(oddsApiKey);
        console.log(`✅ Fetched odds for ${oddsGames.length} games`);
      } catch (error) {
        console.error('Failed to fetch odds:', error);
        // Continue without odds
      }
    }

    // Normalize the data
    const normalizedGames: Game[] = (data.games || []).map((game: any) => {
      const homeTeamId = game.home?.sr_id || game.home?.id || '';
      const awayTeamId = game.away?.sr_id || game.away?.id || '';
      
      // Get team info from mapping
      const homeTeamMapping = findTeamBySportradarId(homeTeamId);
      const awayTeamMapping = findTeamBySportradarId(awayTeamId);
      
      // Get team names from mapping or API data
      const homeTeamName = homeTeamMapping?.canonical || teamNameMap[homeTeamId] || game.home?.name || 'Unknown Team';
      const awayTeamName = awayTeamMapping?.canonical || teamNameMap[awayTeamId] || game.away?.name || 'Unknown Team';

      // Use local assets for logos (or proxy when AP Images is available)
      const homeLogo = homeTeamName !== 'Unknown Team'
        ? (AP_IMAGES_ENABLED 
            ? buildLogoProxyUrl({ id: homeTeamId, name: homeTeamName }, { size: '250' })
            : getLocalTeamLogo(homeTeamName))
        : genericFallbackLogo;

      const awayLogo = awayTeamName !== 'Unknown Team'
        ? (AP_IMAGES_ENABLED
            ? buildLogoProxyUrl({ id: awayTeamId, name: awayTeamName }, { size: '250' })
            : getLocalTeamLogo(awayTeamName))
        : genericFallbackLogo;

      // Get team colors
      const homeTeamColors = getTeamColors(homeTeamId);
      const awayTeamColors = getTeamColors(awayTeamId);

      // Try to match with odds data
      let fanduelOdds;
      if (oddsGames.length > 0) {
        const matchedOddsGame = matchGamesWithOdds(game, oddsGames);
        if (matchedOddsGame) {
          const odds = extractFanDuelOdds(matchedOddsGame);
          if (odds?.homeOdds && odds?.awayOdds) {
            fanduelOdds = {
              homeOdds: formatAmericanOdds(odds.homeOdds),
              awayOdds: formatAmericanOdds(odds.awayOdds),
              homeImpliedProbability: (calculateImpliedProbability(odds.homeOdds) * 100).toFixed(1) + '%',
              awayImpliedProbability: (calculateImpliedProbability(odds.awayOdds) * 100).toFixed(1) + '%',
              lastUpdate: odds.lastUpdate
            };
          }
        }
      }

      return {
        id: game.id,
        scheduled: game.scheduled,
        status: game.status,
        homeTeam: {
          id: homeTeamId,
          name: homeTeamName,
          logo: homeLogo,
          colors: homeTeamColors,
          score: game.home?.runs
        },
        awayTeam: {
          id: awayTeamId,
          name: awayTeamName,
          logo: awayLogo,
          colors: awayTeamColors,
          score: game.away?.runs
        },
        venue: game.venue ? {
          name: game.venue.name,
          location: game.venue.location
        } : undefined,
        fanduelOdds
      };
    });

    const scheduleData = {
      date: `${year}-${month}-${day}`,
      games: normalizedGames,
      totalGames: normalizedGames.length
    };

    // Save to cache for future requests
    await saveCachedSchedule(scheduleData);

    return NextResponse.json(scheduleData);

  } catch (error) {
    console.error('Error fetching MLB schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MLB schedule' },
      { status: 500 }
    );
  }
}
