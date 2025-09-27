#!/usr/bin/env python3
"""
MLB Live Scores and Stats Fetcher
Fetches current MLB game scores and statistics using free APIs
"""

import requests
import json
import datetime
from typing import Dict, List, Optional

class MLBScoresFetcher:
    def __init__(self):
        # Using ESPN's free MLB API (no key required)
        self.base_url = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb"
        
    def get_todays_games(self) -> Optional[List[Dict]]:
        """Fetch today's MLB games"""
        try:
            # Get current date in YYYYMMDD format
            today = datetime.datetime.now().strftime("%Y%m%d")
            url = f"{self.base_url}/scoreboard"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get('events', [])
            
        except requests.RequestException as e:
            print(f"Error fetching games: {e}")
            return None
    
    def get_game_details(self, game_id: str) -> Optional[Dict]:
        """Get detailed stats for a specific game"""
        try:
            url = f"{self.base_url}/summary"
            params = {'event': game_id}
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            print(f"Error fetching game details: {e}")
            return None
    
    def format_game_info(self, game: Dict) -> Dict:
        """Format game information for display"""
        competition = game.get('competitions', [{}])[0]
        competitors = competition.get('competitors', [])
        
        if len(competitors) < 2:
            return {}
        
        home_team = competitors[0] if competitors[0].get('homeAway') == 'home' else competitors[1]
        away_team = competitors[1] if competitors[0].get('homeAway') == 'home' else competitors[0]
        
        return {
            'game_id': game.get('id'),
            'date': game.get('date'),
            'status': competition.get('status', {}).get('type', {}).get('name', 'Unknown'),
            'home_team': {
                'name': home_team.get('team', {}).get('displayName', 'Unknown'),
                'abbreviation': home_team.get('team', {}).get('abbreviation', 'UNK'),
                'score': home_team.get('score', '0'),
                'record': home_team.get('records', [{}])[0].get('summary', '0-0')
            },
            'away_team': {
                'name': away_team.get('team', {}).get('displayName', 'Unknown'),
                'abbreviation': away_team.get('team', {}).get('abbreviation', 'UNK'),
                'score': away_team.get('score', '0'),
                'record': away_team.get('records', [{}])[0].get('summary', '0-0')
            },
            'venue': competition.get('venue', {}).get('fullName', 'Unknown Venue'),
            'weather': competition.get('weather', {}).get('displayValue', 'N/A')
        }
    
    def get_live_scores(self) -> Dict:
        """Get all live MLB scores and basic stats"""
        games = self.get_todays_games()
        
        if not games:
            return {'error': 'No games found or API error'}
        
        formatted_games = []
        for game in games:
            game_info = self.format_game_info(game)
            if game_info:
                formatted_games.append(game_info)
        
        return {
            'date': datetime.datetime.now().strftime("%Y-%m-%d"),
            'total_games': len(formatted_games),
            'games': formatted_games
        }
    
    def save_to_file(self, data: Dict, filename: str = 'mlb_scores.json') -> bool:
        """Save MLB data to a JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving to file: {e}")
            return False
    
    def print_scores(self, data: Dict) -> None:
        """Print formatted scores to console"""
        if 'error' in data:
            print(f"Error: {data['error']}")
            return
        
        print(f"\n🏟️  MLB Scores for {data['date']}")
        print(f"📊 Total Games: {data['total_games']}")
        print("=" * 60)
        
        for game in data['games']:
            home = game['home_team']
            away = game['away_team']
            
            print(f"\n🏠 {home['name']} ({home['abbreviation']}) vs 🚌 {away['name']} ({away['abbreviation']})")
            print(f"   Score: {away['score']} - {home['score']}")
            print(f"   Status: {game['status']}")
            print(f"   Venue: {game['venue']}")
            print(f"   Records: {away['abbreviation']} {away['record']} | {home['abbreviation']} {home['record']}")
            if game['weather'] != 'N/A':
                print(f"   Weather: {game['weather']}")

def main():
    """Main function to fetch and display MLB scores"""
    fetcher = MLBScoresFetcher()
    
    print("⚾ Fetching MLB Live Scores...")
    scores_data = fetcher.get_live_scores()
    
    # Save to file
    if fetcher.save_to_file(scores_data):
        print("✅ Scores saved to mlb_scores.json")
    
    # Display scores
    fetcher.print_scores(scores_data)
    
    return scores_data

if __name__ == "__main__":
    main()
