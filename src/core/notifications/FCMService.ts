import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import axios from 'axios';

// Placeholder for firebase config - will be replaced by real config if available
const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

export class FCMService {
  private static messaging: Messaging | null = null;

  static async initialize(userId: string) {
    console.log('Initializing FCM for user:', userId);

    // In demo mode or if config is missing, we just log
    if (firebaseConfig.apiKey === "PLACEHOLDER") {
      console.log('FCM in Demo Mode: Skipping real initialization');
      return;
    }

    try {
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }
      
      this.messaging = getMessaging();
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: 'YOUR_PUBLIC_VAPID_KEY' // This should be in env
        });
        
        if (token) {
          console.log('FCM Token obtained:', token);
          await this.registerToken(userId, token);
        }
      }
      
      // Handle foreground messages
      onMessage(this.messaging, (payload) => {
        console.log('Foreground message received:', payload);
        // This will be handled by LocalNotificationService via a callback if needed
      });

    } catch (error) {
      console.error('FCM Initialization failed:', error);
    }
  }

  static async registerToken(userId: string, token: string) {
    try {
      await axios.put(`/api/users/${userId}/fcm-token`, { fcmToken: token });
      console.log('FCM Token registered on server');
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  }

  static onMessageReceived(callback: (payload: any) => void) {
    if (this.messaging) {
      return onMessage(this.messaging, callback);
    }
    return () => {};
  }
}
