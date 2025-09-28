'use client';

import Image from 'next/image';

interface GameCardProps {
  game: {
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
  };
}

export default function GameCard({ game }: GameCardProps) {
  const gameDate = new Date(game.scheduled);
  const timeString = gameDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    timeZoneName: 'short'
  });
  
  const isLive = game.status === 'inprogress';
  const isFinal = game.status === 'closed' || game.status === 'complete';
  
  const getStatusDisplay = () => {
    if (isLive) return 'LIVE';
    if (isFinal) return 'FINAL';
    return timeString;
  };

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
      style={{
        background: `linear-gradient(135deg, ${game.homeTeam.colors.primary}10, ${game.awayTeam.colors.primary}10)`
      }}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span 
          className={`
            px-3 py-1 rounded-full text-xs font-bold tracking-wider
            ${isLive ? 'bg-red-500 text-white animate-pulse' : ''}
            ${isFinal ? 'bg-gray-700 text-white' : ''}
            ${!isLive && !isFinal ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
          `}
        >
          {getStatusDisplay()}
        </span>
      </div>

      <div className="p-6">
        {/* Teams Section */}
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center p-2"
                style={{ backgroundColor: game.awayTeam.colors.primary + '20' }}
              >
                <Image
                  src={game.awayTeam.logo}
                  alt={`${game.awayTeam.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = '/fallback-mlb-logo.svg';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">AWAY</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  {game.awayTeam.name}
                </h3>
              </div>
            </div>
            {(isFinal || isLive) && (
              <div 
                className="text-3xl font-bold"
                style={{ color: game.awayTeam.colors.primary }}
              >
                {game.awayTeam.score ?? '-'}
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400">VS</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center p-2"
                style={{ backgroundColor: game.homeTeam.colors.primary + '20' }}
              >
                <Image
                  src={game.homeTeam.logo}
                  alt={`${game.homeTeam.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = '/fallback-mlb-logo.svg';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">HOME</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  {game.homeTeam.name}
                </h3>
              </div>
            </div>
            {(isFinal || isLive) && (
              <div 
                className="text-3xl font-bold"
                style={{ color: game.homeTeam.colors.primary }}
              >
                {game.homeTeam.score ?? '-'}
              </div>
            )}
          </div>
        </div>

        {/* FanDuel Odds Section */}
        {game.fanduelOdds && game.status === 'scheduled' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/fanduel.png"
                  alt="FanDuel"
                  width={60}
                  height={20}
                  className="object-contain"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Moneyline</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Away Team Odds */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {game.awayTeam.name.split(' ').pop()}
                  </div>
                  <div className="font-bold text-lg" style={{ color: game.awayTeam.colors.primary }}>
                    {game.fanduelOdds.awayOdds}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {game.fanduelOdds.awayImpliedProbability}
                  </div>
                </div>
              </div>
              
              {/* Home Team Odds */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {game.homeTeam.name.split(' ').pop()}
                  </div>
                  <div className="font-bold text-lg" style={{ color: game.homeTeam.colors.primary }}>
                    {game.fanduelOdds.homeOdds}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {game.fanduelOdds.homeImpliedProbability}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Venue Information */}
        {game.venue && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{game.venue.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Gradient */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${game.homeTeam.colors.primary}, ${game.awayTeam.colors.primary})`
        }}
      />
    </div>
  );
}
