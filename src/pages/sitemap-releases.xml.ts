export const prerender = true;

import type { APIRoute } from 'astro';
import trackData from '../../public/data/track.json';

export const GET: APIRoute = async () => {
    const siteUrl = "https://botoview.5goos.com";
    const fallbackDate = trackData?.versions?.[0]?.date || new Date().toISOString().split('T')[0];

    const releaseRoutes = (trackData?.versions || []).map((v: { id: string; date?: string }) => ({
        url: `${siteUrl}/releases/${v.id}/`,
        lastmod: v.date || fallbackDate,
        changefreq: 'monthly',
        priority: '0.7'
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${releaseRoutes.map(entry => `  <url>
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
