import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { NotificationProvider } from './features/notifications/providers/NotificationProvider';
import { ReportsProvider } from './features/reports/providers/ReportsProvider';
import { ElderSettingsProvider } from './features/elder/providers/ElderSettingsProvider';
import { LocalNotificationProvider } from './core/notifications/LocalNotificationService';
import { FCMService } from './core/notifications/FCMService';
import AppRouter from './core/router/AppRouter';
import { apiForbiddenEvent } from './core/network/apiClient';

function AppContent() {
  const { user, isAuthReady } = useAuth();
  const [permissionError, setPermissionError] = useState('');

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const showPermissionError = (event: Event) => {
      setPermissionError((event as CustomEvent<string>).detail);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setPermissionError(''), 5000);
    };
    window.addEventListener(apiForbiddenEvent, showPermissionError);
    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener(apiForbiddenEvent, showPermissionError);
    };
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      void FCMService.initialize(user?.id).catch(() => {
        // The service records registration failures.
      });
    }
  }, [isAuthReady, user?.id]);

  return (
    <>
      <AppRouter />
      {permissionError && (
        <div role="alert" className="fixed inset-x-4 bottom-24 z-[100] mx-auto max-w-md rounded-xl bg-alert px-4 py-3 font-body text-sm text-white shadow-lg">
          {permissionError}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ReportsProvider>
            <ElderSettingsProvider>
              <LocalNotificationProvider>
                <AppContent />
              </LocalNotificationProvider>
            </ElderSettingsProvider>
          </ReportsProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
