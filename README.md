# Gemline - MLB Schedule & Odds Tracker

A modern web application that displays today's MLB games with real-time FanDuel betting odds, built with Next.js and TypeScript.

## Features

### ⚾ MLB Schedule Integration
- Real-time MLB schedule from Sportradar MLB API v8
- Team logos, colors, and branding
- Game status tracking (scheduled, live, final)
- Venue information
- 30-minute intelligent caching system

### 💰 FanDuel Odds Integration
- Live moneyline odds from The Odds API
- FanDuel-exclusive betting lines
- Implied probability calculations
- American odds format (+150, -200, etc.)
- Visual FanDuel branding

### 🔄 Smart Game Matching
- Comprehensive team mapping between APIs
- Multiple matching strategies:
  - Exact team name matching
  - Abbreviation matching (NYY, LAD, etc.)
  - Market + name matching
  - Time window validation (30-minute window)

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark mode support
- Team color theming
- Loading states and error handling
- Force refresh capability

## Getting Started

### Prerequisites

1. Node.js 18+ and npm
2. API Keys (add to `.env` file):
   ```env
   master_key=YOUR_SPORTRADAR_API_KEY
   odds_api_key=YOUR_ODDS_API_KEY
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gemline.git
   cd gemline
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your API keys

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

### Sportradar MLB API v8
- Endpoint: `https://api.sportradar.com/mlb/trial/v8/en/games/{year}/{month}/{day}/schedule.json`
- Provides: Schedule, teams, venues, scores
- Rate limit: Trial tier limits apply

### The Odds API
- Endpoint: `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds`
- Provides: FanDuel moneyline odds
- Markets: Head-to-head (h2h)
- Region: US

## Architecture

### Team Mapping System
The application uses a comprehensive mapping system to match teams between different APIs:

```typescript
// Example mapping structure
{
  "New York Yankees": {
    canonical: "New York Yankees",
    sportradarNames: ["Yankees", "New York Yankees"],
    oddsApiNames: ["New York Yankees"],
    abbreviations: ["NYY"],
    sportradarId: "sr:competitor:21"
  }
}
```

### Caching Strategy
- 30-minute cache duration for API responses
- Cache invalidation on force refresh
- Separate cache for schedule and odds data
- File-based caching in `.cache` directory

## Project Structure

```
gemline/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── mlb/
│   │   │       └── schedule/     # API endpoint for fetching games + odds
│   │   ├── page.tsx              # Main page component
│   │   └── layout.tsx            # App layout
│   ├── components/
│   │   └── GameCard.tsx          # Individual game card with odds display
│   └── lib/
│       ├── mlb-team-mapping.ts   # Team mapping between APIs
│       ├── odds-api.ts           # The Odds API integration
│       └── schedule-cache.ts     # Caching system
├── public/
│   └── fanduel.png              # FanDuel logo
└── package.json
```

## Key Features Implementation

### Odds Display
- Only shows odds for scheduled games (not live or completed)
- Displays both team odds side by side
- Shows implied probability percentage
- FanDuel branding with official logo

### Error Handling
- Graceful fallback when odds unavailable
- Continues showing schedule even if odds API fails
- User-friendly error messages
- Retry mechanisms

## Testing

Run the test script to verify API integrations:
```bash
node test-odds-integration.js
```

## Performance Optimizations

- Pre-computed team lookup maps for O(1) access
- Batch API requests where possible
- Intelligent caching to reduce API calls
- Next.js optimizations (Image optimization, etc.)

## Future Enhancements

- [ ] Additional sportsbooks beyond FanDuel
- [ ] Spread and total betting lines
- [ ] Historical odds tracking
- [ ] AI-powered game predictions
- [ ] User accounts and bet tracking
- [ ] Mobile app version

## License

MIT

## Acknowledgments

- Sportradar for MLB data
- The Odds API for betting odds
- FanDuel for odds provision
- Next.js team for the framework
