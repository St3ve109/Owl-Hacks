'use client';

import { useState, useEffect } from 'react';
import GameCard from '@/components/GameCard';

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

interface ScheduleData {
  date: string;
  games: Game[];
  totalGames: number;
}

export default function Home() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  const fetchSchedule = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = forceRefresh ? '/api/mlb/schedule?refresh=true' : '/api/mlb/schedule';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }
      
      const data = await response.json();
      setScheduleData(data);
      setLastRefresh(new Date());
      
      // Check if data has timestamp (indicating it came from cache)
      setIsFromCache(!!data.timestamp && !forceRefresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchSchedule, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchSchedule(false); // Normal refresh (can use cache)
  };

  const handleForceRefresh = () => {
    fetchSchedule(true); // Force refresh (bypass cache)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ⚾ MLB Schedule
              </h1>
              {scheduleData && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(scheduleData.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
                {isFromCache && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
                    </svg>
                    Cached data
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <svg 
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={handleForceRefresh}
                  disabled={loading}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                  title="Force refresh from API (bypasses cache)"
                >
                  <svg 
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4-4h4m-4-4h4M8 4h4m-4 0v4m4-4v4" />
                  </svg>
                  Force
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                ⚾
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading today's games...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading Schedule</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Games Grid */}
        {scheduleData && !loading && !error && (
          <>
            {/* Games Count */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {scheduleData.totalGames} {scheduleData.totalGames === 1 ? 'Game' : 'Games'} Today
                </span>
              </div>
            </div>

            {/* No Games Message */}
            {scheduleData.games.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏖️</div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  No Games Scheduled
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back tomorrow for more MLB action!
                </p>
              </div>
            )}

            {/* Games Grid */}
            {scheduleData.games.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {scheduleData.games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Powered by Gemline AI • MLB data from Sportradar API</p>
            <p className="mt-1">© 2025 All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
