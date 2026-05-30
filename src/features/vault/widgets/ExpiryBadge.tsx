import React from 'react';
import type { ExpiryStatus } from '../repositories/VaultRepository';

interface ExpiryBadgeProps {
  status: ExpiryStatus;
  expiryDate?: string;
  compact?: boolean;
}

const config: Record<ExpiryStatus, { bg: string; text: string; label: string }> = {
  None:  { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'No expiry' },
  Green: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Valid' },
  Amber: { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Expiring soon' },
  Red:   { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Expiring!' },
};

const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({ status, expiryDate, compact = false }) => {
  if (status === 'None') return null;
  const { bg, text, label } = config[status];

  const daysLeft = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
    : null;

  const displayText = compact
    ? (daysLeft !== null ? `${daysLeft}d` : label)
    : (daysLeft !== null
        ? (daysLeft <= 0 ? 'Expired' : `${label} · ${daysLeft}d left`)
        : label);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {displayText}
    </span>
  );
};

export default ExpiryBadge;
