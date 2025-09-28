import { NextResponse } from 'next/server';
import { 
  getCacheInfo, 
  clearScheduleCache, 
  loadCachedSchedule 
} from '@/lib/schedule-cache';

export async function GET() {
  try {
    const cacheInfo = await getCacheInfo();
    return NextResponse.json({
      cache: cacheInfo,
      actions: {
        clear: '/api/mlb/cache?action=clear',
        refresh: '/api/mlb/schedule?refresh=true'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get cache info' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearScheduleCache();
    return NextResponse.json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

// Handle query parameters for actions
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'clear':
        await clearScheduleCache();
        return NextResponse.json({ 
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        });
        
      case 'info':
        const cacheInfo = await getCacheInfo();
        const cachedData = await loadCachedSchedule();
        return NextResponse.json({
          info: cacheInfo,
          data: cachedData ? {
            date: cachedData.date,
            gamesCount: cachedData.totalGames,
            timestamp: new Date(cachedData.timestamp).toISOString(),
            expiresAt: new Date(cachedData.expiresAt).toISOString()
          } : null
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: clear, info' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to perform cache action' },
      { status: 500 }
    );
  }
}
