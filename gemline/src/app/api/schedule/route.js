import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Path to the pre-fetched schedule data
    const filePath = path.join(process.cwd(), 'public', 'data', 'schedule.json');

    // Read the JSON file
    const fileContent = await fs.readFile(filePath, 'utf8');
    const scheduleData = JSON.parse(fileContent);

    // Transform the data for the frontend GameCard component
    const games = scheduleData.games?.map(game => ({
      id: game.id,
      scheduled: game.scheduled,
      status: game.status,
      // The frontend expects home_team and away_team, but the API provides home and away
      home_team: {
        id: game.home.id,
        name: game.home.name,
        abbr: game.home.abbr,
      },
      away_team: {
        id: game.away.id,
        name: game.away.name,
        abbr: game.away.abbr,
      },
      venue: game.venue ? {
        id: game.venue.id,
        name: game.venue.name,
        city: game.venue.city,
        state: game.venue.state,
      } : null,
      broadcast: game.broadcast || null,
      weather: game.weather || null,
    })) || [];

    // Return the transformed data
    return NextResponse.json({
      success: true,
      date: scheduleData.date,
      total_games: games.length,
      games: games,
    });

  } catch (error) {
    console.error('Error reading or processing schedule data:', error);

    // Handle file not found error gracefully
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        {
          success: false,
          message: 'Schedule data not found. Please run the fetch script.',
        },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load schedule data.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
