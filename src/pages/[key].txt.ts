export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const requestedKey = params.key?.trim();

        // Defense-in-depth: Validate requestedKey format to prevent path traversal or injection
        if (!requestedKey || !/^[a-zA-Z0-9_-]{8,128}$/.test(requestedKey)) {
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
            localsEnvKey = (locals as any)?.runtime?.env?.INDEXNOW_KEY;
        } catch {
            // Astro v6+ Cloudflare adapter removes locals.runtime.env in favor of 'cloudflare:workers'
        }

        let cfEnvKey: string | undefined;
        try {
            // Cloudflare Workers runtime (Astro v6+)
            // @ts-ignore
            const cf = await import('cloudflare:workers');
            cfEnvKey = cf?.env?.INDEXNOW_KEY;
        } catch {
            // Outside Cloudflare Workers runtime
        }

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
