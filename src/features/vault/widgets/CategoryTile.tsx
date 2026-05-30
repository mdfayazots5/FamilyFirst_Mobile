import React from 'react';
import {
  Heart, CreditCard, GraduationCap, DollarSign,
  Shield, Scale, Award, Folder,
} from 'lucide-react';
import type { DocumentCategory } from '../repositories/VaultRepository';

interface CategoryTileProps {
  category: number;
  categoryName: DocumentCategory;
  documentCount: number;
  expiringCount: number;
  onClick: () => void;
}

const categoryConfig: Record<number, { icon: React.ElementType; color: string; bg: string }> = {
  1: { icon: Heart,          color: 'text-red-600',    bg: 'bg-red-50' },
  2: { icon: CreditCard,     color: 'text-blue-600',   bg: 'bg-blue-50' },
  3: { icon: GraduationCap,  color: 'text-purple-600', bg: 'bg-purple-50' },
  4: { icon: DollarSign,     color: 'text-green-600',  bg: 'bg-green-50' },
  5: { icon: Shield,         color: 'text-amber-600',  bg: 'bg-amber-50' },
  6: { icon: Scale,          color: 'text-indigo-600', bg: 'bg-indigo-50' },
  7: { icon: Award,          color: 'text-pink-600',   bg: 'bg-pink-50' },
  8: { icon: Folder,         color: 'text-gray-600',   bg: 'bg-gray-50' },
};

const CategoryTile: React.FC<CategoryTileProps> = ({
  category, categoryName, documentCount, expiringCount, onClick,
}) => {
  const { icon: Icon, color, bg } = categoryConfig[category] ?? categoryConfig[8];

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-4 rounded-2xl bg-white shadow-sm border border-gray-100
                 hover:shadow-md active:scale-95 transition-all duration-150 min-h-[96px] w-full text-left"
    >
      <div className={`p-2 rounded-xl ${bg} mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-sm font-semibold text-[#1A2E4A] leading-tight">{categoryName}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">{documentCount} docs</span>
        {expiringCount > 0 && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
            {expiringCount} expiring
          </span>
        )}
      </div>
    </button>
  );
};

export default CategoryTile;
