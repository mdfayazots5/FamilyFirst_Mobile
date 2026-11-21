const workerUrl = new URL(self.location.href);
const base = new URL('./', workerUrl);

self.addEventListener('notificationclick', event => {
  const path = event.notification.data?.familyFirstLink;
  if (typeof path !== 'string') return;
  event.stopImmediatePropagation();
  event.notification.close();
  const fallback = new URL('notifications', base);
  const target = /^\/(?!\/)/.test(path) && !path.includes('\\')
    ? new URL(path.slice(1), base)
    : fallback;
  event.waitUntil(self.clients.openWindow(
    target.origin === base.origin && target.pathname.startsWith(base.pathname) ? target.href : fallback.href,
  ));
});

const config = Object.fromEntries(
  ['apiKey', 'projectId', 'messagingSenderId', 'appId'].map(key => [key, workerUrl.searchParams.get(key)]),
);
if (Object.values(config).every(Boolean)) {
  importScripts(
    'https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js',
  );
  firebase.initializeApp(config);
  firebase.messaging().onBackgroundMessage(payload => {
    // Firebase already displays notification payloads in the background.
    if (payload.notification) return;
    return self.registration.showNotification('FamilyFirst update', {
      data: { familyFirstLink: payload.data?.deepLink ?? '/notifications' },
    });
  });
}
