// file: src/components/dashboard/StatsCards.tsx

import React from 'react';
import { Database, Shield, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  totalMemories?: number;
  storageUsed?: string;
  verifiedMemories?: number;
  activeQuests?: number;
  [key: string]: any; // Allow additional properties
}

interface StatsCardsProps {
  stats?: Stats | null | any; // Make it more flexible
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  // Provide default values if stats is null or undefined
  const safeStats = {
    totalMemories: stats?.totalMemories ?? 0,
    storageUsed: stats?.storageUsed ?? '0 MB',
    verifiedMemories: stats?.verifiedMemories ?? 0,
    activeQuests: stats?.activeQuests ?? 0
  };

  const cards = [
    {
      title: 'Total Memories',
      value: safeStats.totalMemories,
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Storage Used',
      value: safeStats.storageUsed,
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Verified',
      value: safeStats.verifiedMemories,
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Active Quests',
      value: safeStats.activeQuests,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconBg: 'bg-orange-100'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        );
      })}
    </div>
  );
};