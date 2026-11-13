export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
    const requestedKey = params.key;

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

    const expectedKey = 
        (locals as any)?.runtime?.env?.INDEXNOW_KEY || 
        process.env.INDEXNOW_KEY || 
        import.meta.env.INDEXNOW_KEY;

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
};
