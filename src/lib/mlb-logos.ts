// MLB Logo Service using Sportradar AP Images API
// Production-ready approach with proper caching and error handling

type Team = { 
  id: string; 
  name: string;
  market?: string;
};

type LogoLink = { 
  href: string; 
  width?: string; 
  height?: string; 
  type?: string 
};

type ReferenceEntity = { 
  type: 'team' | 'league'; 
  name: string; 
  sportradar_id?: string 
};

type LogoAsset = { 
  id: string; 
  links: LogoLink[]; 
  reference_entities?: ReferenceEntity[] 
};

type LogoManifest = {
  assets: LogoAsset[];
};

type TeamColors = {
  primary: string;
  secondary: string;
};

// Base URLs and configuration
const IMG_BASE_TRIAL = 'https://api.sportradar.com/mlb-images-t3/ap';
const IMG_BASE_PROD = 'https://api.sportradar.com/mlb-images-p3/ap';
const MLB_API_BASE = 'https://api.sportradar.com/mlb/trial/v8/en';

// Use trial endpoint by default (switch to prod when ready)
const IMG_BASE = IMG_BASE_TRIAL;

// Cache duration in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const HIERARCHY_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory caches
let logoIndexCache: Map<string, LogoAsset> | null = null;
let logoIndexCacheTime: number = 0;
let hierarchyCache: any = null;
let hierarchyCacheTime: number = 0;

// Team colors mapping (fallback for visual consistency)
export const teamColors: Record<string, TeamColors> = {
  'sr:competitor:3': { primary: '#A71930', secondary: '#E3D4AD' }, // Arizona Diamondbacks
  'sr:competitor:4': { primary: '#13274F', secondary: '#CE1141' }, // Atlanta Braves
  'sr:competitor:5': { primary: '#DF4601', secondary: '#000000' }, // Baltimore Orioles
  'sr:competitor:6': { primary: '#BD3039', secondary: '#0C2340' }, // Boston Red Sox
  'sr:competitor:7': { primary: '#0E3386', secondary: '#CC3433' }, // Chicago Cubs
  'sr:competitor:8': { primary: '#27251F', secondary: '#C4CED4' }, // Chicago White Sox
  'sr:competitor:9': { primary: '#C6011F', secondary: '#000000' }, // Cincinnati Reds
  'sr:competitor:10': { primary: '#00385D', secondary: '#E50022' }, // Cleveland Guardians
  'sr:competitor:11': { primary: '#33006F', secondary: '#C4CED4' }, // Colorado Rockies
  'sr:competitor:12': { primary: '#0C2340', secondary: '#FA4616' }, // Detroit Tigers
  'sr:competitor:13': { primary: '#002D62', secondary: '#EB6E1F' }, // Houston Astros
  'sr:competitor:14': { primary: '#004687', secondary: '#BD9B60' }, // Kansas City Royals
  'sr:competitor:15': { primary: '#BA0021', secondary: '#003263' }, // Los Angeles Angels
  'sr:competitor:16': { primary: '#005A9C', secondary: '#EF3E42' }, // Los Angeles Dodgers
  'sr:competitor:17': { primary: '#00A3E0', secondary: '#EF3340' }, // Miami Marlins
  'sr:competitor:18': { primary: '#0A2351', secondary: '#FFC52F' }, // Milwaukee Brewers
  'sr:competitor:19': { primary: '#002B5C', secondary: '#D31145' }, // Minnesota Twins
  'sr:competitor:20': { primary: '#002D72', secondary: '#FF5910' }, // New York Mets
  'sr:competitor:21': { primary: '#003087', secondary: '#C4CED3' }, // New York Yankees
  'sr:competitor:22': { primary: '#003831', secondary: '#EFB21E' }, // Oakland Athletics
  'sr:competitor:23': { primary: '#E81828', secondary: '#002D72' }, // Philadelphia Phillies
  'sr:competitor:24': { primary: '#27251F', secondary: '#FDB827' }, // Pittsburgh Pirates
  'sr:competitor:25': { primary: '#2F241D', secondary: '#FFC425' }, // San Diego Padres
  'sr:competitor:26': { primary: '#FD5A1E', secondary: '#27251F' }, // San Francisco Giants
  'sr:competitor:27': { primary: '#0C2C56', secondary: '#005C5C' }, // Seattle Mariners
  'sr:competitor:28': { primary: '#C41E3A', secondary: '#0C2340' }, // St. Louis Cardinals
  'sr:competitor:29': { primary: '#092C5C', secondary: '#8FBCE6' }, // Tampa Bay Rays
  'sr:competitor:30': { primary: '#003278', secondary: '#C0111F' }, // Texas Rangers
  'sr:competitor:31': { primary: '#134A8E', secondary: '#1D2D5C' }, // Toronto Blue Jays
  'sr:competitor:32': { primary: '#AB0003', secondary: '#14225A' }, // Washington Nationals
};

/**
 * Fetch and cache the MLB league hierarchy
 */
export async function fetchLeagueHierarchy(apiKey: string) {
  // Check cache first
  if (hierarchyCache && (Date.now() - hierarchyCacheTime < HIERARCHY_CACHE_DURATION)) {
    return hierarchyCache;
  }

  try {
    const url = `${MLB_API_BASE}/league/hierarchy.json?api_key=${apiKey}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Next.js cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hierarchy: ${response.status}`);
    }

    const data = await response.json();
    hierarchyCache = data;
    hierarchyCacheTime = Date.now();
    return data;
  } catch (error) {
    console.error('Error fetching league hierarchy:', error);
    // Return cached data if available, even if expired
    if (hierarchyCache) return hierarchyCache;
    throw error;
  }
}

/**
 * Build and cache the logo index from AP Images manifest
 */
export async function buildLogoIndex(apiKey: string): Promise<Map<string, LogoAsset>> {
  // Check cache first
  if (logoIndexCache && (Date.now() - logoIndexCacheTime < CACHE_DURATION)) {
    return logoIndexCache;
  }

  try {
    // In trial, the logos manifest doesn't include year
    const url = `${IMG_BASE}/logos/manifest.json?api_key=${apiKey}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      // Handle potential 302 redirects
      redirect: 'follow',
      next: { revalidate: 3600 } // Next.js cache for 1 hour
    });

    if (!response.ok) {
      console.warn(`Logo manifest fetch failed with status ${response.status}`);
      // Fall back to empty index rather than throwing
      return new Map();
    }

    const manifest: LogoManifest = await response.json();
    const index = new Map<string, LogoAsset>();

    // Index assets by team reference
    for (const asset of (manifest.assets || [])) {
      const teamRef = asset.reference_entities?.find((e) => e.type === 'team');
      if (!teamRef) continue;

      // Create multiple keys for better matching
      const keys = [
        teamRef.sportradar_id?.toLowerCase(),
        teamRef.name?.toLowerCase(),
        // Handle team name variations
        teamRef.name?.replace(/\s+/g, '-').toLowerCase(),
        teamRef.name?.split(' ').pop()?.toLowerCase(), // Last word (often nickname)
      ].filter(Boolean) as string[];

      // Store under all possible keys
      for (const key of keys) {
        index.set(key, asset);
      }
    }

    // Cache the result
    logoIndexCache = index;
    logoIndexCacheTime = Date.now();
    
    console.log(`Logo index built with ${index.size} entries`);
    return index;
  } catch (error) {
    console.error('Error building logo index:', error);
    // Return empty map as fallback
    return new Map();
  }
}

/**
 * Pick the best logo URL for the given asset and options
 */
export function pickLogoUrl(
  asset: LogoAsset, 
  apiKey: string,
  opts?: { 
    size?: '250' | '500' | '1000';
    preferTransparent?: boolean;
  }
): string {
  const size = opts?.size ?? '250';
  
  // Try to find the requested size
  let link = asset.links.find(l => l.href.includes(`h${size}`));
  
  // If transparent is preferred and available
  if (opts?.preferTransparent) {
    const transparentLink = asset.links.find(l => 
      l.href.includes(`h${size}`) && l.href.includes('transparent')
    );
    if (transparentLink) link = transparentLink;
  }
  
  // Fallback to first available link
  if (!link) link = asset.links[0];
  
  // Construct full URL (manifest href is relative)
  return `${IMG_BASE}${link.href}?api_key=${apiKey}`;
}

/**
 * Resolve team logo URL from team data
 */
export function resolveTeamLogo(
  team: Team | { id: string; name: string },
  logoIndex: Map<string, LogoAsset>,
  apiKey: string,
  opts?: { size?: '250' | '500' | '1000' }
): string | undefined {
  // Try multiple lookup strategies
  const candidates = [
    team.id?.toLowerCase(),
    team.id?.replace('sr:competitor:', ''),
    team.name?.toLowerCase(),
    team.name?.replace(/\s+/g, '-').toLowerCase(),
    team.name?.split(' ').pop()?.toLowerCase(),
  ].filter(Boolean) as string[];

  for (const key of candidates) {
    const asset = logoIndex.get(key);
    if (asset) {
      return pickLogoUrl(asset, apiKey, opts);
    }
  }

  // No logo found
  return undefined;
}

/**
 * Get team colors (with fallback)
 */
export function getTeamColors(teamId: string): TeamColors {
  return teamColors[teamId] || {
    primary: '#000000',
    secondary: '#FFFFFF'
  };
}

/**
 * High-level helper to get team data with logo
 */
export async function enrichTeamWithLogo(
  team: { id: string; name: string },
  apiKey: string,
  opts?: { size?: '250' | '500' | '1000' }
): Promise<{
  id: string;
  name: string;
  logo: string | undefined;
  colors: TeamColors;
}> {
  try {
    const logoIndex = await buildLogoIndex(apiKey);
    const logo = resolveTeamLogo(team, logoIndex, apiKey, opts);
    const colors = getTeamColors(team.id);

    return {
      ...team,
      logo,
      colors
    };
  } catch (error) {
    console.error(`Error enriching team ${team.name}:`, error);
    // Return team with fallbacks
    return {
      ...team,
      logo: undefined,
      colors: getTeamColors(team.id)
    };
  }
}

/**
 * Batch enrich multiple teams (more efficient)
 */
export async function enrichTeamsWithLogos(
  teams: { id: string; name: string }[],
  apiKey: string,
  opts?: { size?: '250' | '500' | '1000' }
): Promise<Map<string, { logo: string | undefined; colors: TeamColors }>> {
  const result = new Map<string, { logo: string | undefined; colors: TeamColors }>();
  
  try {
    const logoIndex = await buildLogoIndex(apiKey);
    
    for (const team of teams) {
      const logo = resolveTeamLogo(team, logoIndex, apiKey, opts);
      const colors = getTeamColors(team.id);
      result.set(team.id, { logo, colors });
    }
  } catch (error) {
    console.error('Error enriching teams:', error);
    // Provide fallback for all teams
    for (const team of teams) {
      result.set(team.id, { 
        logo: undefined, 
        colors: getTeamColors(team.id) 
      });
    }
  }
  
  return result;
}

/**
 * Build a proxy URL for team logos (keeps API key on server)
 * Currently disabled - using local assets instead
 */
export function buildLogoProxyUrl(
  team: { id?: string; name?: string }, 
  opts?: { size?: '250' | '500' | '1000'; transparent?: boolean }
) {
  const size = opts?.size ?? '250';
  const transparent = opts?.transparent ? '&transparent=1' : '';
  return `/api/mlb/logo?teamId=${encodeURIComponent(team.id || '')}&name=${encodeURIComponent(team.name || '')}&size=${size}${transparent}`;
}

/**
 * Get local team logo from assets directory
 * These are SVG files stored locally to avoid API dependencies
 */
export function getLocalTeamLogo(teamName: string): string {
  // Map short names from API to full names in our assets
  const teamNameMapping: Record<string, string> = {
    'Diamondbacks': 'Arizona Diamondbacks',
    'Braves': 'Atlanta Braves',
    'Orioles': 'Baltimore Orioles',
    'Red Sox': 'Boston Red Sox',
    'Cubs': 'Chicago Cubs',
    'White Sox': 'Chicago White Sox',
    'Reds': 'Cincinnati Reds',
    'Guardians': 'Cleveland Guardians',
    'Rockies': 'Colorado Rockies',
    'Tigers': 'Detroit Tigers',
    'Astros': 'Houston Astros',
    'Royals': 'Kansas City Royals',
    'Angels': 'Los Angeles Angels',
    'Dodgers': 'Los Angeles Dodgers',
    'Marlins': 'Miami Marlins',
    'Brewers': 'Milwaukee Brewers',
    'Twins': 'Minnesota Twins',
    'Mets': 'New York Mets',
    'Yankees': 'New York Yankees',
    'Athletics': 'Oakland Athletics',
    'Phillies': 'Philadelphia Phillies',
    'Pirates': 'Pittsburgh Pirates',
    'Padres': 'San Diego Padres',
    'Giants': 'San Francisco Giants',
    'Mariners': 'Seattle Mariners',
    'Cardinals': 'St. Louis Cardinals',
    'Rays': 'Tampa Bay Rays',
    'Rangers': 'Texas Rangers',
    'Blue Jays': 'Toronto Blue Jays',
    'Nationals': 'Washington Nationals'
  };

  // Use mapping if available, otherwise use the name as-is
  const fullName = teamNameMapping[teamName] || teamName;
  
  // Handle special cases and encode spaces for URL
  const safeName = fullName.replace(/\s+/g, '%20');
  return `/assets/${safeName}.svg`;
}

// Feature flag for AP Images API (set to true when API access is fixed)
export const AP_IMAGES_ENABLED = false;
