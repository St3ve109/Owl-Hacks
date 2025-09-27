'use client';

import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';

const ScheduleList = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/schedule');
        const data = await response.json();

        if (data.success) {
          setSchedule(data);
        } else {
          setError(data.message || 'An unknown error occurred');
        }
      } catch (err) {
        setError('Failed to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading today's schedule...</p>
        <p className="text-gray-500 text-sm mt-2">Getting the latest game information</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">⚠️</span>
            <p className="font-bold text-red-800 text-lg">Error Loading Schedule</p>
          </div>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!schedule || schedule.games.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <span className="text-6xl mb-4 block">⚾</span>
          <p className="text-gray-800 font-bold text-xl mb-2">No Games Today</p>
          <p className="text-gray-600">No MLB games are scheduled for today.</p>
          <p className="text-gray-500 text-sm mt-2">Check back tomorrow for more games!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
          Today's Games
        </h2>
        <p className="text-gray-600 text-lg">
          {schedule.total_games} game{schedule.total_games !== 1 ? 's' : ''} scheduled for {schedule.date}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {schedule.games.map((game, index) => (
          <div 
            key={game.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-4 bg-gray-50 rounded-full px-6 py-3">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-sm text-gray-600">
              {schedule.games.filter(g => g.status === 'scheduled').length} Scheduled
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">
              {schedule.games.filter(g => g.status === 'inprogress').length} In Progress
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
            <span className="text-sm text-gray-600">
              {schedule.games.filter(g => g.status === 'complete' || g.status === 'closed').length} Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;
