export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
    try {
        const requestedKey = params.key;

        if (!requestedKey || !/^[a-zA-Z0-9_-]{8,128}$/.test(requestedKey)) {
            return new Response("Not Found", {
                status: 404,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Content-Type-Options": "nosniff"
                }
            });
        }

        let cfEnv: Record<string, string | undefined> | undefined;
        try {
            const cf = await import('cloudflare:workers');
            cfEnv = cf?.env;
        } catch {
        }

        const expectedKey = 
            cfEnv?.INDEXNOW_KEY || 
            process.env.INDEXNOW_KEY || 
            (import.meta.env as any)?.INDEXNOW_KEY;

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
