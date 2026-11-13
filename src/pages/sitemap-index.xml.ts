export const prerender = true;

import type { APIRoute } from 'astro';
import trackData from '../../public/data/track.json';

export const GET: APIRoute = async () => {
    const siteUrl = "https://botoview.5goos.com";
    const latestVersion = trackData?.versions?.[0];
    const latestDate = latestVersion?.date || new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap.xml</loc>
    <lastmod>${latestDate}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new Response(xml.trim(), {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    });
};
