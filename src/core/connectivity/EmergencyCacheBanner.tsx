import { WifiOff } from 'lucide-react';
import { useConnectivity } from './useConnectivity';

export default function EmergencyCacheBanner() {
  const isOnline = useConnectivity();
  return (
    <div role="status" className="bg-accent px-4 py-2 text-sm font-semibold text-primary flex items-center gap-2">
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      {isOnline ? 'Connection unavailable. Showing saved emergency data.' : 'Offline. Showing saved emergency data.'}
    </div>
  );
}
