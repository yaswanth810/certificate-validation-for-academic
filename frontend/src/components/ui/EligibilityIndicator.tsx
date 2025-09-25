import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Info, ChevronDown } from 'lucide-react';

export interface EligibilityStatus {
  isEligible: boolean;
  status: 'eligible' | 'not-eligible' | 'pending' | 'claimed';
  reasons: string[];
  certificateCount?: number;
  requiredCertificates?: number;
  hasRequiredCourses?: boolean;
  hasValidDepartment?: boolean;
  hasValidEnrollment?: boolean;
}

interface EligibilityIndicatorProps {
  status: EligibilityStatus;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'card' | 'inline';
}

const EligibilityIndicator: React.FC<EligibilityIndicatorProps> = ({
  status,
  showTooltip = true,
  size = 'md',
  variant = 'badge'
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = () => {
    switch (status.status) {
      case 'eligible':
        return {
          icon: CheckCircle,
          text: 'Eligible',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'not-eligible':
        return {
          icon: XCircle,
          text: 'Not Eligible',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending Review',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'claimed':
        return {
          icon: CheckCircle,
          text: 'Already Claimed',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      default:
        return {
          icon: AlertTriangle,
          text: 'Unknown',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          textColor: 'text-gray-800 dark:text-gray-200',
          iconColor: 'text-gray-600 dark:text-gray-400',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      case 'md':
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      case 'md':
      default:
        return 'w-4 h-4';
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (variant === 'card') {
    return (
      <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`${getIconSize()} ${config.iconColor}`} />
            <span className={`font-medium ${config.textColor}`}>
              {config.text}
            </span>
          </div>
          {status.reasons.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`${config.textColor} hover:opacity-70 transition-opacity`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {showDetails && status.reasons.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <div className="space-y-2">
              {status.reasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
                  <span className="text-xs opacity-80">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Progress */}
        {status.certificateCount !== undefined && status.requiredCertificates !== undefined && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <div className="flex items-center justify-between text-xs opacity-80 mb-1">
              <span>Certificates</span>
              <span>{status.certificateCount}/{status.requiredCertificates}</span>
            </div>
            <div className="w-full bg-current bg-opacity-20 rounded-full h-1.5">
              <div
                className="bg-current h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((status.certificateCount / status.requiredCertificates) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center space-x-2">
        <Icon className={`${getIconSize()} ${config.iconColor}`} />
        <span className={`${config.textColor} font-medium`}>
          {config.text}
        </span>
        {showTooltip && status.reasons.length > 0 && (
          <div className="relative group">
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap max-w-xs">
              <div className="space-y-1">
                {status.reasons.slice(0, 3).map((reason, index) => (
                  <div key={index}>{reason}</div>
                ))}
                {status.reasons.length > 3 && (
                  <div className="text-gray-300">+{status.reasons.length - 3} more</div>
                )}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default badge variant
  return (
    <div className="relative group">
      <span className={`
        inline-flex items-center space-x-1.5 rounded-full border font-medium transition-all duration-200
        ${getSizeClasses()} ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${showTooltip && status.reasons.length > 0 ? 'cursor-help' : ''}
      `}>
        <Icon className={`${getIconSize()} ${config.iconColor}`} />
        <span>{config.text}</span>
      </span>

      {/* Tooltip */}
      {showTooltip && status.reasons.length > 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap max-w-xs">
          <div className="space-y-1">
            {status.reasons.slice(0, 3).map((reason, index) => (
              <div key={index}>{reason}</div>
            ))}
            {status.reasons.length > 3 && (
              <div className="text-gray-300">+{status.reasons.length - 3} more reasons</div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
};

export default EligibilityIndicator;
