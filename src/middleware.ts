import { defineMiddleware } from 'astro:middleware';

const STATIC_FILE_EXT_RE = /\.(txt|xml|json|js|mjs|css|svg|png|ico|jpg|jpeg|webp|woff2?|webmanifest|map)$/i;

export const onRequest = defineMiddleware(async (context, next) => {
    if (context.isPrerendered) {
        return next();
    }

    const { request, url } = context;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return next();
    }

    const pathname = url.pathname;
    const collapsed = pathname.replace(/\/{2,}/g, '/');
    if (collapsed !== pathname) {
        const target = new URL(`${collapsed}${url.search}`, url.origin);
        return Response.redirect(target.toString(), 301);
    }

    if (pathname === '/index.html') {
        const target = new URL(`/${url.search}`, url.origin);
        return Response.redirect(target.toString(), 301);
    }
    if (pathname.endsWith('/index.html')) {
        const cleanPath = pathname.slice(0, -'index.html'.length);
        const target = new URL(`${cleanPath}${url.search}`, url.origin);
        return Response.redirect(target.toString(), 301);
    }

    if (pathname !== '/' && !pathname.endsWith('/') && !STATIC_FILE_EXT_RE.test(pathname)) {
        const target = new URL(`${pathname}/${url.search}`, url.origin);
        return new Response(null, {
            status: 301,
            headers: {
                'Location': target.toString(),
                'Cache-Control': 'public, max-age=86400'
            }
        });
    }

    return next();
});
