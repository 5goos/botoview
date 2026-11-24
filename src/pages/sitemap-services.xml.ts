export const prerender = true;

import type { APIRoute } from 'astro';
import trackData from '../../public/data/track.json';
import { TOP_INDEXABLE_SERVICES } from '../utils/serviceTelemetry';

// Use import.meta.glob to discover all service JSON files at build time
// (fs.readdirSync is unreliable in Cloudflare/Vite prerender context)
const serviceModules = import.meta.glob<Array<{ v: string; t: string }>>(
    '../../public/data/services/*.json',
    { eager: true, import: 'default' }
);

export const GET: APIRoute = async () => {
    const siteUrl = "https://botoview.5goos.com";
    const fallbackDate = trackData?.versions?.[0]?.date || new Date().toISOString().split('T')[0];
    const versionDateMap = new Map((trackData?.versions || []).map((v: { id: string; date?: string }) => [v.id, v.date || fallbackDate]));

    const topSet = new Set(TOP_INDEXABLE_SERVICES);

    // Extract service slugs from glob keys and build sitemap entries for ALL services
    const entries = Object.entries(serviceModules)
        .map(([pathKey, changes]) => {
            const match = pathKey.match(/\/([^/]+)\.json$/);
            const service = match ? match[1] : '';
            if (!service) return null;

            const list = Array.isArray(changes) ? changes : [];
            let lastmod = fallbackDate;
            if (list.length > 0 && list[0]?.v) {
                const matchDate = versionDateMap.get(list[0].v);
                if (matchDate) {
                    lastmod = matchDate;
                }
            }

            return {
                url: `${siteUrl}/services/${service}/`,
                lastmod,
                changefreq: topSet.has(service) ? 'weekly' : 'monthly',
                priority: topSet.has(service) ? '0.9' : '0.7'
            };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .sort((a, b) => a.url.localeCompare(b.url));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml.trim(), {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    });
};
