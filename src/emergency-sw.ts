/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { isEmergencyRoute } from './core/router/emergencyRoutes';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Parameters<typeof precacheAndRoute>[0] };

void self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST, { cleanURLs: false, directoryIndex: '' });

const offlineError = () => new Response(
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>FamilyFirst is offline</title><body style="margin:2rem;background:#F8F4EE;color:#1A2E4A;font:1rem system-ui">' +
  '<h1>You are offline</h1><p>Reconnect to open this page.</p>' +
  '<a href="" style="display:inline-flex;align-items:center;min-height:48px">Try again</a></body></html>',
  { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
);

const scope = new URL(self.registration.scope);
registerRoute(
  ({ request, url }) => request.mode === 'navigate' && url.origin === scope.origin && url.pathname.startsWith(scope.pathname),
  async ({ request, url }) => {
    try {
      return await fetch(request);
    } catch {
      const route = '/' + url.pathname.slice(scope.pathname.length);
      if (isEmergencyRoute(route)) {
        return await matchPrecache(new URL('emergency.html', scope).href) ?? offlineError();
      }
      return offlineError();
    }
  },
);
