import React from 'react';

const GameCard = ({ game }) => {
  const gameTime = new Date(game.scheduled).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const gameDate = new Date(game.scheduled).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'inprogress': return 'bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse';
      case 'complete':
      case 'closed':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case 'postponed': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return '🕒';
      case 'inprogress': return '⚾';
      case 'complete':
      case 'closed':
        return '✅';
      case 'postponed': return '⏸️';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 transform">
      {/* Header with status and time */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-2 text-sm font-bold rounded-full shadow-md ${getStatusClass(game.status)}`}>
          {getStatusIcon(game.status)} {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
        </span>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">{gameTime}</div>
          <div className="text-sm text-gray-500">{gameDate}</div>
        </div>
      </div>

      {/* Team matchup */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {game.away_team.abbr}
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-lg">{game.away_team.name}</span>
              <div className="text-sm text-gray-600">Away</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="text-2xl font-bold text-gray-400">VS</div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {game.home_team.abbr}
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-lg">{game.home_team.name}</span>
              <div className="text-sm text-gray-600">Home</div>
            </div>
          </div>
        </div>
      </div>

      {/* Venue information */}
      {game.venue && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-lg">🏟️</span>
            <div>
              <p className="font-semibold text-gray-800">{game.venue.name}</p>
              <p className="text-sm">{game.venue.city}, {game.venue.state}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
