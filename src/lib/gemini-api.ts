import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GamePrediction {
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  keyFactors: string[];
}

export interface GameData {
  homeTeam: string;
  awayTeam: string;
  homeOdds?: number;
  awayOdds?: number;
  scheduled: string;
  venue?: string;
}

/**
 * Initialize Google Generative AI client
 */
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google Gemini API key not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate AI-powered game prediction using Gemini
 */
export async function generateGamePrediction(gameData: GameData): Promise<GamePrediction> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert MLB analyst. Analyze this upcoming game and provide a prediction:

Game Details:
- Home Team: ${gameData.homeTeam}
- Away Team: ${gameData.awayTeam}
- Game Time: ${gameData.scheduled}
- Venue: ${gameData.venue || 'TBD'}
${gameData.homeOdds && gameData.awayOdds ? `
- Betting Odds: ${gameData.homeTeam} ${gameData.homeOdds > 0 ? '+' : ''}${gameData.homeOdds}, ${gameData.awayTeam} ${gameData.awayOdds > 0 ? '+' : ''}${gameData.awayOdds}
` : ''}

Please provide a prediction in the following JSON format:
{
  "homeTeam": "${gameData.homeTeam}",
  "awayTeam": "${gameData.awayTeam}",
  "prediction": "Brief prediction (e.g., 'Home team wins 6-4')",
  "confidence": 75,
  "reasoning": "Detailed analysis of why this prediction is made",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
}

Consider factors like:
- Recent team performance and trends
- Head-to-head history
- Home field advantage
- Pitching matchups
- Team injuries and roster changes
- Weather conditions (if relevant)
- Betting line implications

Keep the prediction concise but informative. Confidence should be 1-100.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          homeTeam: parsed.homeTeam || gameData.homeTeam,
          awayTeam: parsed.awayTeam || gameData.awayTeam,
          prediction: parsed.prediction || 'No prediction available',
          confidence: Math.max(1, Math.min(100, parsed.confidence || 50)),
          reasoning: parsed.reasoning || 'Analysis not available',
          keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors : ['Analysis in progress']
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON response:', parseError);
    }

    // Fallback if JSON parsing fails
    return {
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
      prediction: 'AI analysis in progress',
      confidence: 50,
      reasoning: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
      keyFactors: ['AI analysis', 'Game data processing', 'Prediction generation']
    };

  } catch (error) {
    console.error('Error generating game prediction:', error);
    
    // Return fallback prediction
    return {
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
      prediction: 'Prediction unavailable',
      confidence: 0,
      reasoning: 'AI service temporarily unavailable. Please try again later.',
      keyFactors: ['Service unavailable']
    };
  }
}

/**
 * Generate predictions for multiple games
 */
export async function generateMultiplePredictions(games: GameData[]): Promise<GamePrediction[]> {
  const predictions: GamePrediction[] = [];
  
  // Process games in batches to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize);
    const batchPromises = batch.map(game => generateGamePrediction(game));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      predictions.push(...batchResults);
      
      // Add small delay between batches to respect rate limits
      if (i + batchSize < games.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing batch ${i}-${i + batchSize}:`, error);
      // Add fallback predictions for failed batch
      batch.forEach(game => {
        predictions.push({
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          prediction: 'Prediction unavailable',
          confidence: 0,
          reasoning: 'Batch processing failed',
          keyFactors: ['Processing error']
        });
      });
    }
  }
  
  return predictions;
}

/**
 * Check if Gemini API is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GOOGLE_GEMINI_API_KEY;
}
