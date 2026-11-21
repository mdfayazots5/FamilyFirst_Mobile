import { initializeApp } from 'firebase/app';
import { deleteToken, getMessaging, getToken, isSupported, onMessage, type MessagePayload, type Messaging } from 'firebase/messaging';
import apiClient from '../network/apiClient';
import { MasterApiReference, resolvePath } from '../api/MasterApiReference';
import { AppConfig } from '../config/appConfig';
import { logger } from '../services/logger';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim();
const bindingKey = 'ff_push_user';

function waitForActivation(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.active) return Promise.resolve();
  const worker = registration.installing ?? registration.waiting;
  if (!worker) return Promise.reject(new Error('Push worker installation is unavailable.'));
  return new Promise((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      worker.removeEventListener('statechange', check);
      if (error) reject(error);
      else resolve();
    };
    const check = () => {
      if (worker.state === 'activated') finish();
      else if (worker.state === 'redundant') finish(new Error('Push worker installation failed.'));
    };
    const timeout = setTimeout(() => finish(new Error('Push worker activation timed out.')), 10_000);
    worker.addEventListener('statechange', check);
    check();
  });
}

export class FCMService {
  private static messaging: Messaging | null = null;
  private static hasSdkRegistration = false;
  private static requestedUser?: string;
  private static queue: Promise<void> = Promise.resolve();

  static get isConfigured() {
    return AppConfig.fcmEnabled && Object.values(config).every(Boolean) && Boolean(vapidKey);
  }

  static initialize(userId?: string): Promise<void> {
    this.requestedUser = userId;
    const result = this.queue.then(() => this.sync(userId));
    this.queue = result.catch(() => logger.warn('FamilyFirst push registration could not be updated.'));
    return result;
  }

  static async enable(userId: string): Promise<void> {
    if (!this.isConfigured || typeof Notification === 'undefined' || !window.isSecureContext) {
      throw new Error('Browser push is unavailable.');
    }
    // Request permission directly from the button gesture.
    if (await Notification.requestPermission() !== 'granted') {
      throw new Error('Notification permission is required.');
    }
    await this.initialize(userId);
  }

  private static async sync(userId?: string) {
    if (!this.isConfigured || !window.isSecureContext || typeof Notification === 'undefined') return;
    if (userId !== this.requestedUser) return;
    const previousUser = localStorage.getItem(bindingKey);
    if ((!userId || Notification.permission !== 'granted') && !previousUser) return;
    if (!await isSupported()) throw new Error('Browser push is unavailable.');

    const base = new URL(import.meta.env.BASE_URL, window.location.origin);
    const scope = new URL('firebase-push/', base).href;
    const worker = new URL('firebase-messaging-sw.js', base);
    for (const [name, value] of Object.entries(config)) worker.searchParams.set(name, value!);
    const existing = await navigator.serviceWorker.getRegistration(scope);
    const dedicated = existing?.scope === scope ? existing : undefined;
    const disconnecting = !userId || Notification.permission !== 'granted';
    if (disconnecting && !dedicated) {
      localStorage.removeItem(bindingKey);
      return;
    }
    const registration = dedicated && (disconnecting || dedicated.active?.scriptURL === worker.href)
      ? dedicated
      : await navigator.serviceWorker.register(worker.href, { scope });
    await waitForActivation(registration);

    if (!this.messaging) {
      this.messaging = getMessaging(initializeApp(config, 'familyfirst-push'));
      onMessage(this.messaging, payload => {
        if (this.requestedUser && localStorage.getItem(bindingKey) === this.requestedUser) {
          void registration.showNotification(payload.notification?.title ?? 'FamilyFirst update', {
            body: payload.notification?.body,
            data: { familyFirstLink: payload.data?.deepLink ?? '/notifications' },
          }).catch(() => logger.warn('FamilyFirst could not display a push notification.'));
        }
      });
    }

    // Associate the token with the dedicated push worker.
    if (previousUser && (previousUser !== userId || Notification.permission !== 'granted')) {
      for (const notification of await registration.getNotifications()) notification.close();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription && !await subscription.unsubscribe()) throw new Error('Browser push unsubscribe failed.');
      if (this.hasSdkRegistration) {
        await deleteToken(this.messaging).catch(() => logger.warn('FamilyFirst could not revoke the Firebase registration token.'));
      }
      localStorage.removeItem(bindingKey);
    }

    if (!userId || userId !== this.requestedUser || Notification.permission !== 'granted') return;
    const token = await getToken(this.messaging, { vapidKey, serviceWorkerRegistration: registration });
    this.hasSdkRegistration = true;
    if (!token) throw new Error('Firebase returned no registration token.');
    if (userId !== this.requestedUser) {
      await deleteToken(this.messaging);
      return;
    }
    // Track the binding even if the API request fails, so logout can revoke the subscription.
    localStorage.setItem(bindingKey, userId);
    await this.registerToken(userId, token);
  }

  static async registerToken(userId: string, token: string) {
    await apiClient.put(
      resolvePath(MasterApiReference.Users.FcmToken, { userId: encodeURIComponent(userId) }),
      { fcmToken: token },
    );
  }

  static onMessageReceived(callback: (payload: MessagePayload) => void) {
    if (this.messaging) return onMessage(this.messaging, callback);
    return () => {};
  }
}
