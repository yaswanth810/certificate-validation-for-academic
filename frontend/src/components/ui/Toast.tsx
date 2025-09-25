import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconClass = "w-5 h-5";
  
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-green-500`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-red-500`} />;
    case 'warning':
      return <AlertCircle className={`${iconClass} text-yellow-500`} />;
    case 'info':
      return <Info className={`${iconClass} text-blue-500`} />;
  }
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative flex items-start p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out transform";
    const visibilityStyles = isVisible && !isLeaving 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-white dark:bg-gray-800 border-green-200 dark:border-green-800`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-white dark:bg-gray-800 border-red-200 dark:border-red-800`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-800`;
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800`;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <ToastIcon type={toast.type} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Convenience hooks for different toast types
export const useSuccessToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string, action?: Toast['action']) => {
    addToast({ type: 'success', title, message, action });
  };
};

export const useErrorToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string, action?: Toast['action']) => {
    addToast({ type: 'error', title, message, action, duration: 8000 });
  };
};

export const useWarningToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string, action?: Toast['action']) => {
    addToast({ type: 'warning', title, message, action });
  };
};

export const useInfoToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string, action?: Toast['action']) => {
    addToast({ type: 'info', title, message, action });
  };
};
