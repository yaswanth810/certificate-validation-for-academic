import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          icon: 'text-green-600 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          icon: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800'
        };
      case 'blue':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800'
        };
    }
  };

  const colorClasses = getColorClasses();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
            {subtitle && <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>}
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${
                trend.isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center border
          ${colorClasses.bg} ${colorClasses.border}
        `}>
          <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
