import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { NotificationProvider } from './features/notifications/providers/NotificationProvider';
import { ReportsProvider } from './features/reports/providers/ReportsProvider';
import { ElderSettingsProvider } from './features/elder/providers/ElderSettingsProvider';
import { LocalNotificationProvider } from './core/notifications/LocalNotificationService';
import { FCMService } from './core/notifications/FCMService';
import AppRouter from './core/router/AppRouter';

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      FCMService.initialize(user.id);
    }
  }, [user?.id]);

  return <AppRouter />;
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
