export const prerender = true;

import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import trackData from '../../public/data/track.json';
import { TOP_INDEXABLE_SERVICES } from '../utils/serviceTelemetry';

export const GET: APIRoute = async () => {
    const siteUrl = "https://botoview.5goos.com";
    const fallbackDate = trackData?.versions?.[0]?.date || new Date().toISOString().split('T')[0];
    const versionDateMap = new Map((trackData?.versions || []).map((v: { id: string; date?: string }) => [v.id, v.date || fallbackDate]));

    // Sitemaps must exclusively contain canonical, high-authority, indexable URLs
    const services = TOP_INDEXABLE_SERVICES;
    const entries = services.map((service: string) => {
        let lastmod = fallbackDate;
        try {
            const filePath = path.resolve(process.cwd(), `public/data/services/${service}.json`);
            if (fs.existsSync(filePath)) {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (Array.isArray(content) && content.length > 0 && content[0]?.v) {
                    const matchDate = versionDateMap.get(content[0].v);
                    if (matchDate) {
                        lastmod = matchDate;
                    }
                }
            }
        } catch {}

        return {
            url: `${siteUrl}/services/${service}/`,
            lastmod,
            changefreq: 'weekly',
            priority: '0.9'
        };
    });

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
