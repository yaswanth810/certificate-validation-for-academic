import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'edutrust' | 'vignan';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '', 
  variant = 'edutrust' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  if (variant === 'vignan') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Vignan Logo with improved styling */}
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-50 to-purple-50 p-1 shadow-sm`}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              {/* Vignan Institute Symbol */}
              <div className="relative w-3/4 h-3/4">
                {/* Purple segments */}
                <div className="absolute inset-0">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="absolute w-1/4 h-1/4 bg-purple-400"
                      style={{
                        top: '37.5%',
                        left: '37.5%',
                        transformOrigin: '50% 50%',
                        transform: `rotate(${i * 45}deg) translateY(-150%)`,
                        clipPath: 'polygon(20% 0%, 80% 0%, 50% 100%)'
                      }}
                    />
                  ))}
                </div>
                {/* Blue cross */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1/6 bg-blue-600 rounded-sm"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-1/6 bg-blue-600 rounded-sm"></div>
                </div>
                {/* Center circle with star */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-white rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-2/3 h-2/3 text-blue-600">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]} leading-tight`}>
              VIGNAN
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-tight">
              Institute of Information Technology
            </span>
          </div>
        )}
      </div>
    );
  }

  const sizeClassesOriginal = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <Link to="/" className={`flex items-center space-x-3 group ${className}`}>
      {/* Logo Circle */}
      <div className={`${sizeClassesOriginal[size]} rounded-full bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm`}>
        {/* Inner Star Shape */}
        <div className="relative w-3/4 h-3/4">
          {/* Central Blue Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-blue-600 rounded-full flex items-center justify-center">
            {/* Small White Star */}
            <div className="w-1/2 h-1/2 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          
          {/* Five Blue Arms */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-blue-600 transform origin-left"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 72}deg)`,
                clipPath: 'polygon(0 40%, 100% 0%, 100% 100%)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold text-red-600 dark:text-red-400 leading-tight`}>
            EduTrust
          </h1>
          <p className={`text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight`}>
            AUTHENTICITY VALIDATOR
          </p>
        </div>
      )}
    </Link>
  );
};

export default Logo;


