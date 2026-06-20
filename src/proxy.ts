import type { NextFetchEvent, NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './libs/I18nRouting';
import { COMING_SOON } from './utils/AppConfig';

const handleI18nRouting = createMiddleware(routing);

const COMING_SOON_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Coming soon</title>
  </head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#0a0a0a;color:#fafafa">
    <main style="text-align:center;padding:2rem">
      <h1 style="font-size:2rem;font-weight:600;margin:0">Mystery Customer Insight</h1>
      <p style="margin-top:.75rem;opacity:.7">Coming soon.</p>
    </main>
  </body>
</html>`;

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
]);

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // ВРЕМЕННО: заглушка Coming Soon на всех роутах (флаг COMING_SOON в AppConfig).
  // /health исключён в config.matcher ниже, поэтому keep-alive продолжает работать.
  // Обход для проверки реального сайта: открой `…/?preview=<COMING_SOON_BYPASS>` —
  // поставится cookie, и твой браузер увидит настоящее приложение (остальные — заглушку).
  if (COMING_SOON) {
    const bypassToken = process.env.COMING_SOON_BYPASS;

    // Активация обхода через query-параметр: ставим cookie и убираем ?preview из URL.
    if (bypassToken && request.nextUrl.searchParams.get('preview') === bypassToken) {
      const cleanUrl = new URL(request.url);
      cleanUrl.searchParams.delete('preview');
      const res = NextResponse.redirect(cleanUrl);
      res.cookies.set('preview', bypassToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    const bypassed
      = !!bypassToken && request.cookies.get('preview')?.value === bypassToken;

    if (!bypassed) {
      return new NextResponse(COMING_SOON_HTML, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    // обход активен → проваливаемся к реальному приложению (Clerk/i18n ниже)
  }

  // Ключи Clerk заданы (не keyless), поэтому clerkMiddleware запускаем на ВСЕХ роутах —
  // иначе session-handshake после логина может попасть на необёрнутый роут и зациклиться.
  return clerkMiddleware(async (auth, req) => {
    // Protected-роуты требуют входа; иначе — на sign-in с нужной локалью.
    if (isProtectedRoute(req)) {
      const locale = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';

      const signInUrl = new URL(`${locale}/sign-in`, req.url);

      await auth.protect({
        unauthenticatedUrl: signInUrl.toString(),
      });
    }

    return handleI18nRouting(req);
  })(request, event);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel`, `monitoring` or `health`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|health|.*\\..*).*)',
};
