// MLB Team Mapping for matching between Sportradar and The Odds API
export interface TeamMapping {
  canonical: string;
  sportradarNames: string[];
  oddsApiNames: string[];
  abbreviations: string[];
  market: string;
  sportradarId: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export const MLB_TEAM_MAPPINGS: Record<string, TeamMapping> = {
  "Arizona Diamondbacks": {
    canonical: "Arizona Diamondbacks",
    sportradarNames: ["Diamondbacks", "Arizona Diamondbacks", "D-backs"],
    oddsApiNames: ["Arizona Diamondbacks"],
    abbreviations: ["ARI", "AZ"],
    market: "Arizona",
    sportradarId: "sr:competitor:3",
    colors: { primary: "#A71930", secondary: "#E3D4AD" }
  },
  "Atlanta Braves": {
    canonical: "Atlanta Braves",
    sportradarNames: ["Braves", "Atlanta Braves"],
    oddsApiNames: ["Atlanta Braves"],
    abbreviations: ["ATL"],
    market: "Atlanta",
    sportradarId: "sr:competitor:4",
    colors: { primary: "#CE1141", secondary: "#13274F" }
  },
  "Baltimore Orioles": {
    canonical: "Baltimore Orioles",
    sportradarNames: ["Orioles", "Baltimore Orioles", "O's"],
    oddsApiNames: ["Baltimore Orioles"],
    abbreviations: ["BAL"],
    market: "Baltimore",
    sportradarId: "sr:competitor:5",
    colors: { primary: "#DF4601", secondary: "#000000" }
  },
  "Boston Red Sox": {
    canonical: "Boston Red Sox",
    sportradarNames: ["Red Sox", "Boston Red Sox"],
    oddsApiNames: ["Boston Red Sox"],
    abbreviations: ["BOS"],
    market: "Boston",
    sportradarId: "sr:competitor:6",
    colors: { primary: "#BD3039", secondary: "#0C2340" }
  },
  "Chicago Cubs": {
    canonical: "Chicago Cubs",
    sportradarNames: ["Cubs", "Chicago Cubs"],
    oddsApiNames: ["Chicago Cubs"],
    abbreviations: ["CHC"],
    market: "Chicago",
    sportradarId: "sr:competitor:7",
    colors: { primary: "#0E3386", secondary: "#CC3433" }
  },
  "Chicago White Sox": {
    canonical: "Chicago White Sox",
    sportradarNames: ["White Sox", "Chicago White Sox"],
    oddsApiNames: ["Chicago White Sox"],
    abbreviations: ["CHW", "CWS"],
    market: "Chicago",
    sportradarId: "sr:competitor:8",
    colors: { primary: "#27251F", secondary: "#C4CED4" }
  },
  "Cincinnati Reds": {
    canonical: "Cincinnati Reds",
    sportradarNames: ["Reds", "Cincinnati Reds"],
    oddsApiNames: ["Cincinnati Reds"],
    abbreviations: ["CIN"],
    market: "Cincinnati",
    sportradarId: "sr:competitor:9",
    colors: { primary: "#C6011F", secondary: "#000000" }
  },
  "Cleveland Guardians": {
    canonical: "Cleveland Guardians",
    sportradarNames: ["Guardians", "Cleveland Guardians"],
    oddsApiNames: ["Cleveland Guardians"],
    abbreviations: ["CLE"],
    market: "Cleveland",
    sportradarId: "sr:competitor:10",
    colors: { primary: "#00385D", secondary: "#E50022" }
  },
  "Colorado Rockies": {
    canonical: "Colorado Rockies",
    sportradarNames: ["Rockies", "Colorado Rockies"],
    oddsApiNames: ["Colorado Rockies"],
    abbreviations: ["COL"],
    market: "Colorado",
    sportradarId: "sr:competitor:11",
    colors: { primary: "#33006F", secondary: "#C4CED4" }
  },
  "Detroit Tigers": {
    canonical: "Detroit Tigers",
    sportradarNames: ["Tigers", "Detroit Tigers"],
    oddsApiNames: ["Detroit Tigers"],
    abbreviations: ["DET"],
    market: "Detroit",
    sportradarId: "sr:competitor:12",
    colors: { primary: "#0C2340", secondary: "#FA4616" }
  },
  "Houston Astros": {
    canonical: "Houston Astros",
    sportradarNames: ["Astros", "Houston Astros"],
    oddsApiNames: ["Houston Astros"],
    abbreviations: ["HOU"],
    market: "Houston",
    sportradarId: "sr:competitor:13",
    colors: { primary: "#002D62", secondary: "#EB6E1F" }
  },
  "Kansas City Royals": {
    canonical: "Kansas City Royals",
    sportradarNames: ["Royals", "Kansas City Royals", "KC Royals"],
    oddsApiNames: ["Kansas City Royals"],
    abbreviations: ["KC", "KCR"],
    market: "Kansas City",
    sportradarId: "sr:competitor:14",
    colors: { primary: "#004687", secondary: "#7AB2DD" }
  },
  "Los Angeles Angels": {
    canonical: "Los Angeles Angels",
    sportradarNames: ["Angels", "Los Angeles Angels", "LA Angels"],
    oddsApiNames: ["Los Angeles Angels"],
    abbreviations: ["LAA"],
    market: "Los Angeles",
    sportradarId: "sr:competitor:15",
    colors: { primary: "#BA0021", secondary: "#003263" }
  },
  "Los Angeles Dodgers": {
    canonical: "Los Angeles Dodgers",
    sportradarNames: ["Dodgers", "Los Angeles Dodgers", "LA Dodgers"],
    oddsApiNames: ["Los Angeles Dodgers"],
    abbreviations: ["LAD"],
    market: "Los Angeles",
    sportradarId: "sr:competitor:16",
    colors: { primary: "#005A9C", secondary: "#EF3E42" }
  },
  "Miami Marlins": {
    canonical: "Miami Marlins",
    sportradarNames: ["Marlins", "Miami Marlins"],
    oddsApiNames: ["Miami Marlins"],
    abbreviations: ["MIA"],
    market: "Miami",
    sportradarId: "sr:competitor:17",
    colors: { primary: "#00A3E0", secondary: "#EF3340" }
  },
  "Milwaukee Brewers": {
    canonical: "Milwaukee Brewers",
    sportradarNames: ["Brewers", "Milwaukee Brewers"],
    oddsApiNames: ["Milwaukee Brewers"],
    abbreviations: ["MIL"],
    market: "Milwaukee",
    sportradarId: "sr:competitor:18",
    colors: { primary: "#12284B", secondary: "#FFC52F" }
  },
  "Minnesota Twins": {
    canonical: "Minnesota Twins",
    sportradarNames: ["Twins", "Minnesota Twins"],
    oddsApiNames: ["Minnesota Twins"],
    abbreviations: ["MIN"],
    market: "Minnesota",
    sportradarId: "sr:competitor:19",
    colors: { primary: "#002B5C", secondary: "#D31145" }
  },
  "New York Mets": {
    canonical: "New York Mets",
    sportradarNames: ["Mets", "New York Mets", "NY Mets"],
    oddsApiNames: ["New York Mets"],
    abbreviations: ["NYM"],
    market: "New York",
    sportradarId: "sr:competitor:20",
    colors: { primary: "#002D72", secondary: "#FF5910" }
  },
  "New York Yankees": {
    canonical: "New York Yankees",
    sportradarNames: ["Yankees", "New York Yankees", "NY Yankees"],
    oddsApiNames: ["New York Yankees"],
    abbreviations: ["NYY"],
    market: "New York",
    sportradarId: "sr:competitor:21",
    colors: { primary: "#132448", secondary: "#C4CED4" }
  },
  "Oakland Athletics": {
    canonical: "Oakland Athletics",
    sportradarNames: ["Athletics", "Oakland Athletics", "A's"],
    oddsApiNames: ["Oakland Athletics"],
    abbreviations: ["OAK"],
    market: "Oakland",
    sportradarId: "sr:competitor:22",
    colors: { primary: "#003831", secondary: "#EFB21E" }
  },
  "Philadelphia Phillies": {
    canonical: "Philadelphia Phillies",
    sportradarNames: ["Phillies", "Philadelphia Phillies"],
    oddsApiNames: ["Philadelphia Phillies"],
    abbreviations: ["PHI"],
    market: "Philadelphia",
    sportradarId: "sr:competitor:23",
    colors: { primary: "#E81828", secondary: "#002D72" }
  },
  "Pittsburgh Pirates": {
    canonical: "Pittsburgh Pirates",
    sportradarNames: ["Pirates", "Pittsburgh Pirates"],
    oddsApiNames: ["Pittsburgh Pirates"],
    abbreviations: ["PIT"],
    market: "Pittsburgh",
    sportradarId: "sr:competitor:24",
    colors: { primary: "#27251F", secondary: "#FDB827" }
  },
  "San Diego Padres": {
    canonical: "San Diego Padres",
    sportradarNames: ["Padres", "San Diego Padres"],
    oddsApiNames: ["San Diego Padres"],
    abbreviations: ["SD", "SDP"],
    market: "San Diego",
    sportradarId: "sr:competitor:25",
    colors: { primary: "#2F241D", secondary: "#FFC425" }
  },
  "San Francisco Giants": {
    canonical: "San Francisco Giants",
    sportradarNames: ["Giants", "San Francisco Giants", "SF Giants"],
    oddsApiNames: ["San Francisco Giants"],
    abbreviations: ["SF", "SFG"],
    market: "San Francisco",
    sportradarId: "sr:competitor:26",
    colors: { primary: "#FD5A1E", secondary: "#27251F" }
  },
  "Seattle Mariners": {
    canonical: "Seattle Mariners",
    sportradarNames: ["Mariners", "Seattle Mariners"],
    oddsApiNames: ["Seattle Mariners"],
    abbreviations: ["SEA"],
    market: "Seattle",
    sportradarId: "sr:competitor:27",
    colors: { primary: "#0C2C56", secondary: "#005C5C" }
  },
  "St. Louis Cardinals": {
    canonical: "St. Louis Cardinals",
    sportradarNames: ["Cardinals", "St. Louis Cardinals", "St Louis Cardinals"],
    oddsApiNames: ["St. Louis Cardinals"],
    abbreviations: ["STL"],
    market: "St. Louis",
    sportradarId: "sr:competitor:28",
    colors: { primary: "#C41E3A", secondary: "#0C2340" }
  },
  "Tampa Bay Rays": {
    canonical: "Tampa Bay Rays",
    sportradarNames: ["Rays", "Tampa Bay Rays", "TB Rays"],
    oddsApiNames: ["Tampa Bay Rays"],
    abbreviations: ["TB", "TBR"],
    market: "Tampa Bay",
    sportradarId: "sr:competitor:29",
    colors: { primary: "#092C5C", secondary: "#8FBCE6" }
  },
  "Texas Rangers": {
    canonical: "Texas Rangers",
    sportradarNames: ["Rangers", "Texas Rangers"],
    oddsApiNames: ["Texas Rangers"],
    abbreviations: ["TEX"],
    market: "Texas",
    sportradarId: "sr:competitor:30",
    colors: { primary: "#003278", secondary: "#C0111F" }
  },
  "Toronto Blue Jays": {
    canonical: "Toronto Blue Jays",
    sportradarNames: ["Blue Jays", "Toronto Blue Jays"],
    oddsApiNames: ["Toronto Blue Jays"],
    abbreviations: ["TOR"],
    market: "Toronto",
    sportradarId: "sr:competitor:31",
    colors: { primary: "#134A8E", secondary: "#1D2D5C" }
  },
  "Washington Nationals": {
    canonical: "Washington Nationals",
    sportradarNames: ["Nationals", "Washington Nationals"],
    oddsApiNames: ["Washington Nationals"],
    abbreviations: ["WAS", "WSH"],
    market: "Washington",
    sportradarId: "sr:competitor:32",
    colors: { primary: "#AB0003", secondary: "#14225A" }
  }
};

// Create reverse lookup maps for efficient matching
export const SPORTRADAR_ID_MAP = new Map<string, string>();
export const ODDS_API_NAME_MAP = new Map<string, string>();
export const ABBREVIATION_MAP = new Map<string, string>();
export const SPORTRADAR_NAME_MAP = new Map<string, string>();

// Initialize reverse lookup maps
Object.entries(MLB_TEAM_MAPPINGS).forEach(([canonical, mapping]) => {
  // Map Sportradar IDs
  SPORTRADAR_ID_MAP.set(mapping.sportradarId, canonical);
  
  // Map Odds API names
  mapping.oddsApiNames.forEach(name => {
    ODDS_API_NAME_MAP.set(name.toLowerCase(), canonical);
  });
  
  // Map abbreviations
  mapping.abbreviations.forEach(abbr => {
    ABBREVIATION_MAP.set(abbr, canonical);
  });
  
  // Map Sportradar names
  mapping.sportradarNames.forEach(name => {
    SPORTRADAR_NAME_MAP.set(name.toLowerCase(), canonical);
  });
});

// Helper function to find team by Sportradar ID
export function findTeamBySportradarId(id: string): TeamMapping | null {
  const canonical = SPORTRADAR_ID_MAP.get(id);
  return canonical ? MLB_TEAM_MAPPINGS[canonical] : null;
}

// Helper function to find team by Odds API name
export function findTeamByOddsApiName(name: string): TeamMapping | null {
  const canonical = ODDS_API_NAME_MAP.get(name.toLowerCase());
  return canonical ? MLB_TEAM_MAPPINGS[canonical] : null;
}

// Helper function to find team by Sportradar name
export function findTeamBySportradarName(name: string): TeamMapping | null {
  const canonical = SPORTRADAR_NAME_MAP.get(name.toLowerCase());
  return canonical ? MLB_TEAM_MAPPINGS[canonical] : null;
}

// Helper function to match teams between APIs
export function matchTeamBetweenAPIs(
  sportradarTeam: { id?: string; name?: string },
  oddsApiTeamName: string
): boolean {
  // Try to find team by Sportradar ID first
  if (sportradarTeam.id) {
    const teamMapping = findTeamBySportradarId(sportradarTeam.id);
    if (teamMapping) {
      // Check if the odds API name matches any of the expected names
      return teamMapping.oddsApiNames.some(
        name => name.toLowerCase() === oddsApiTeamName.toLowerCase()
      );
    }
  }
  
  // Fallback to name matching if ID not found
  if (sportradarTeam.name) {
    const sportradarMapping = findTeamBySportradarName(sportradarTeam.name);
    const oddsMapping = findTeamByOddsApiName(oddsApiTeamName);
    return sportradarMapping?.canonical === oddsMapping?.canonical;
  }
  
  return false;
}
