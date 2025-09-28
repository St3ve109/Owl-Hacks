import { NextResponse } from 'next/server';
import { buildLogoIndex } from '@/lib/mlb-logos';

// NOTE: we keep IMG_BASE here in sync with lib (trial by default)
const IMG_BASE = 'https://api.sportradar.com/mlb-images-t3/ap';

type LogoLink = { href: string; width?: string; height?: string; type?: string };
type LogoAsset = { id: string; links: LogoLink[]; reference_entities?: { type: 'team'|'league'; name: string; sportradar_id?: string }[] };

function selectAsset(logoIndex: Map<string, LogoAsset>, teamId?: string, teamName?: string) {
  const candidates = [
    teamId?.toLowerCase(),
    teamId?.replace('sr:competitor:', ''), // harmless if not present
    teamName?.toLowerCase(),
    teamName?.replace(/\s+/g, '-').toLowerCase(),
    teamName?.split(' ').pop()?.toLowerCase(),
  ].filter(Boolean) as string[];

  for (const key of candidates) {
    const asset = logoIndex.get(key);
    if (asset) return asset;
  }
  return null;
}

function selectLink(asset: LogoAsset, size: '250'|'500'|'1000', preferTransparent = false) {
  let link = asset.links.find(l => l.href.includes(`h${size}`)) ?? asset.links[0];
  if (preferTransparent) {
    const t = asset.links.find(l => l.href.includes(`h${size}`) && l.href.includes('transparent'));
    if (t) link = t;
  }
  return link;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const teamId = url.searchParams.get('teamId') || undefined;
  const teamName = url.searchParams.get('name') || undefined;
  const size = (url.searchParams.get('size') as '250'|'500'|'1000') || '250';
  const preferTransparent = url.searchParams.get('transparent') === '1';

  const apiKey = process.env.master_key;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }
  if (!teamId && !teamName) {
    return NextResponse.json({ error: 'Missing team identifier' }, { status: 400 });
  }

  try {
    // 1) cached manifest index
    const index = await buildLogoIndex(apiKey);
    const asset = selectAsset(index, teamId, teamName);
    if (!asset) return NextResponse.json({ error: 'Logo not found' }, { status: 404 });

    // 2) pick best link and fetch binary with server-held key
    const link = selectLink(asset, size, preferTransparent);
    const upstreamUrl = `${IMG_BASE}${link.href}?api_key=${apiKey}`;

    const upstream = await fetch(upstreamUrl, { headers: { Accept: '*/*' }, redirect: 'follow', cache: 'no-store' });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }

    // 3) stream image back to client; cache at the edge for a day
    const res = new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
      status: 200,
    });
    return res;
  } catch (err) {
    console.error('Logo proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 });
  }
}
