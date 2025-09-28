import { promises as fs } from 'fs';
import path from 'path';

interface CachedSchedule {
  date: string;
  games: any[];
  totalGames: number;
  timestamp: number;
  expiresAt: number;
}

// Cache configuration
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'mlb-schedule.json');
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load cached schedule from disk
 */
export async function loadCachedSchedule(): Promise<CachedSchedule | null> {
  try {
    await ensureCacheDir();
    const cacheContent = await fs.readFile(CACHE_FILE, 'utf-8');
    const cached: CachedSchedule = JSON.parse(cacheContent);
    
    const now = Date.now();
    const todayDate = getTodayDateString();
    
    // Check if cache is valid (not expired and for today's date)
    if (cached.expiresAt > now && cached.date === todayDate) {
      console.log(`📋 Loaded cached MLB schedule for ${cached.date} (${cached.totalGames} games)`);
      return cached;
    } else {
      console.log(`⏰ Cache expired or date mismatch. Cached: ${cached.date}, Today: ${todayDate}`);
      return null;
    }
  } catch (error) {
    console.log('📋 No valid cache found, will fetch fresh data');
    return null;
  }
}

/**
 * Save schedule to cache
 */
export async function saveCachedSchedule(scheduleData: { date: string; games: any[]; totalGames: number }): Promise<void> {
  try {
    await ensureCacheDir();
    
    const now = Date.now();
    const cached: CachedSchedule = {
      ...scheduleData,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };
    
    await fs.writeFile(CACHE_FILE, JSON.stringify(cached, null, 2), 'utf-8');
    console.log(`💾 Cached MLB schedule for ${scheduleData.date} (expires in ${CACHE_DURATION / 60000} minutes)`);
  } catch (error) {
    console.error('❌ Failed to save schedule cache:', error);
  }
}

/**
 * Clear the cache (useful for debugging or forced refresh)
 */
export async function clearScheduleCache(): Promise<void> {
  try {
    await fs.unlink(CACHE_FILE);
    console.log('🗑️ Schedule cache cleared');
  } catch (error) {
    // File doesn't exist, which is fine
    console.log('🗑️ No cache to clear');
  }
}

/**
 * Get cache info for debugging
 */
export async function getCacheInfo(): Promise<{ exists: boolean; date?: string; gamesCount?: number; expiresAt?: number; isValid?: boolean }> {
  try {
    const cached = await loadCachedSchedule();
    if (cached) {
      return {
        exists: true,
        date: cached.date,
        gamesCount: cached.totalGames,
        expiresAt: cached.expiresAt,
        isValid: cached.expiresAt > Date.now() && cached.date === getTodayDateString()
      };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}
