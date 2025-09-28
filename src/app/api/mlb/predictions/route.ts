import { NextResponse } from 'next/server';
import { generateGamePrediction, generateMultiplePredictions, isGeminiConfigured } from '@/lib/gemini-api';

export interface PredictionRequest {
  homeTeam: string;
  awayTeam: string;
  homeOdds?: number;
  awayOdds?: number;
  scheduled: string;
  venue?: string;
}

export interface PredictionResponse {
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  keyFactors: string[];
}

export async function POST(request: Request) {
  try {
    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Handle single game prediction
    if (body.homeTeam && body.awayTeam) {
      const gameData = {
        homeTeam: body.homeTeam,
        awayTeam: body.awayTeam,
        homeOdds: body.homeOdds,
        awayOdds: body.awayOdds,
        scheduled: body.scheduled,
        venue: body.venue
      };

      const prediction = await generateGamePrediction(gameData);
      return NextResponse.json(prediction);
    }

    // Handle multiple games prediction
    if (Array.isArray(body.games)) {
      const games = body.games.map((game: any) => ({
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        homeOdds: game.homeOdds,
        awayOdds: game.awayOdds,
        scheduled: game.scheduled,
        venue: game.venue
      }));

      const predictions = await generateMultiplePredictions(games);
      return NextResponse.json({ predictions });
    }

    return NextResponse.json(
      { error: 'Invalid request format. Provide single game data or array of games.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in predictions API:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MLB Game Predictions API',
    status: 'active',
    geminiConfigured: isGeminiConfigured(),
    endpoints: {
      POST: 'Generate predictions for games',
      GET: 'API status and configuration'
    }
  });
}
