import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth, UserRole } from './core/auth/AuthContext';
import { AppConfig } from './core/config/appConfig';
import { emergencyRoutes } from './core/router/emergencyRoutes';
import EmergencyCardScreen from './features/medical/screens/EmergencyCardScreen';
import EmergencyFolderScreen from './features/vault/screens/EmergencyFolderScreen';
import ShareDocumentViewScreen from './features/vault/screens/ShareDocumentViewScreen';
import FFErrorState from './shared/components/FFErrorState';
import FFButton from './shared/components/FFButton';
import FFShimmer from './shared/components/FFShimmer';
import './index.css';

function PrivateEmergency({ children }: { children: ReactNode }) {
  const { isAuthReady, isAuthenticated, user, logout } = useAuth();
  if (!isAuthReady) return <FFShimmer className="m-4 h-24 rounded-ff" />;
  if (!isAuthenticated || !user?.familyId || user.role === UserRole.SUPER_ADMIN) {
    return (
      <main className="mx-auto max-w-lg space-y-3 p-8 text-primary">
        <h1 className="font-display text-xl font-bold">Emergency access unavailable</h1>
        <p>Reconnect and sign in to your family account.</p>
      </main>
    );
  }
  return (
    <>
      <header className="flex items-center justify-between bg-white px-4 py-2 text-primary">
        <span className="font-display font-bold">FamilyFirst</span>
        <FFButton variant="outline" onClick={logout}>Log out</FFButton>
      </header>
      {children}
    </>
  );
}

function SharedCard() {
  const { token } = useParams();
  return <EmergencyCardScreen shareToken={token} />;
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <AuthProvider>
      <Routes>
        {AppConfig.features.documentVault && (
          <Route path={emergencyRoutes.folder} element={<PrivateEmergency><EmergencyFolderScreen /></PrivateEmergency>} />
        )}
        {AppConfig.features.medicalRecords && (
          <Route path={emergencyRoutes.card} element={<PrivateEmergency><EmergencyCardScreen /></PrivateEmergency>} />
        )}
        <Route path={emergencyRoutes.sharedCard} element={<SharedCard />} />
        <Route path={emergencyRoutes.sharedDocument} element={<ShareDocumentViewScreen />} />
        <Route path="*" element={<FFErrorState title="Emergency access unavailable" />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
