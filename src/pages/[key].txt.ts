export const prerender = false;

import type { APIRoute } from 'astro';
// @ts-expect-error cloudflare:workers is provided at runtime by Cloudflare Workers
import { env as cfWorkerEnv } from 'cloudflare:workers';

export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const requestedKey = params.key?.trim();

        if (requestedKey === 'robots') {
            const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: https://botoview.5goos.com/sitemap.xml\n`;
            return new Response(robotsContent, {
                status: 200,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "public, max-age=86400",
                    "X-Content-Type-Options": "nosniff"
                }
            });
        }

        const staticFiles = ['security', 'humans', 'ads', 'sitemap'];
        if (!requestedKey || staticFiles.includes(requestedKey)) {
            try {
                const runtimeLocals = locals as { runtime?: { env?: { ASSETS?: { fetch: (u: URL) => Promise<Response> } } } };
                const workerEnv = cfWorkerEnv as { ASSETS?: { fetch: (u: URL) => Promise<Response> } } | undefined;
                const assets = runtimeLocals?.runtime?.env?.ASSETS || workerEnv?.ASSETS;
                if (assets) {
                    const assetRes = await assets.fetch(new URL(`https://botoview.5goos.com/${requestedKey}.txt`));
                    if (assetRes && assetRes.status === 200) {
                        return assetRes;
                    }
                }
            } catch {}
            return new Response("Not Found", {
                status: 404,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Content-Type-Options": "nosniff"
                }
            });
        }

        if (!/^[a-zA-Z0-9_-]{8,128}$/.test(requestedKey)) {
            return new Response("Not Found", {
                status: 404,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Content-Type-Options": "nosniff"
                }
            });
        }

        let localsEnvKey: string | undefined;
        try {
            const runtimeLocals = locals as { runtime?: { env?: { INDEXNOW_KEY?: string } } };
            localsEnvKey = runtimeLocals?.runtime?.env?.INDEXNOW_KEY;
        } catch {}

        let cfEnvKey: string | undefined;
        try {
            // @ts-expect-error cloudflare:workers is provided at runtime by Cloudflare Workers
            const cf = await import('cloudflare:workers');
            cfEnvKey = cf?.env?.INDEXNOW_KEY;
        } catch {}

        const rawExpectedKey = 
            localsEnvKey || 
            cfEnvKey || 
            process.env.INDEXNOW_KEY || 
            (import.meta.env as any)?.INDEXNOW_KEY;

        const expectedKey = rawExpectedKey ? String(rawExpectedKey).trim() : undefined;

        if (!expectedKey || requestedKey !== expectedKey) {
            return new Response("Not Found", {
                status: 404,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Content-Type-Options": "nosniff"
                }
            });
        }

        return new Response(expectedKey, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=86400"
            }
        });
    } catch (error) {
        console.error("IndexNow key verification endpoint error:", error);
        return new Response("Internal Server Error", {
            status: 500,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Content-Type-Options": "nosniff"
            }
        });
    }
};
