import React from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showDescriptions?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  orientation = 'horizontal',
  size = 'md',
  showDescriptions = true
}) => {
  const getStepConfig = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: Check,
          bgColor: 'bg-green-500',
          textColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-500'
        };
      case 'current':
        return {
          icon: Loader2,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-500',
          animate: true
        };
      case 'error':
        return {
          icon: Circle,
          bgColor: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-500'
        };
      case 'pending':
      default:
        return {
          icon: Circle,
          bgColor: 'bg-gray-300 dark:bg-gray-600',
          textColor: 'text-gray-500 dark:text-gray-400',
          borderColor: 'border-gray-300 dark:border-gray-600'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          circle: 'w-6 h-6',
          icon: 'w-3 h-3',
          title: 'text-sm',
          description: 'text-xs'
        };
      case 'lg':
        return {
          circle: 'w-12 h-12',
          icon: 'w-6 h-6',
          title: 'text-lg',
          description: 'text-base'
        };
      case 'md':
      default:
        return {
          circle: 'w-8 h-8',
          icon: 'w-4 h-4',
          title: 'text-base',
          description: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const config = getStepConfig(step.status);
          const Icon = config.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200 dark:bg-gray-700 -ml-px" />
              )}
              
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center rounded-full border-2 flex-shrink-0
                ${sizeClasses.circle} ${config.bgColor} ${config.borderColor}
              `}>
                <Icon className={`
                  ${sizeClasses.icon} text-white
                  ${config.animate ? 'animate-spin' : ''}
                `} />
              </div>

              {/* Step Content */}
              <div className="ml-4 min-w-0 flex-1">
                <h4 className={`font-medium ${config.textColor} ${sizeClasses.title}`}>
                  {step.title}
                </h4>
                {showDescriptions && step.description && (
                  <p className={`mt-1 text-gray-600 dark:text-gray-400 ${sizeClasses.description}`}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const config = getStepConfig(step.status);
        const Icon = config.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step */}
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center rounded-full border-2 flex-shrink-0
                ${sizeClasses.circle} ${config.bgColor} ${config.borderColor}
              `}>
                <Icon className={`
                  ${sizeClasses.icon} text-white
                  ${config.animate ? 'animate-spin' : ''}
                `} />
              </div>

              {/* Step Content */}
              <div className="mt-2 text-center">
                <h4 className={`font-medium ${config.textColor} ${sizeClasses.title}`}>
                  {step.title}
                </h4>
                {showDescriptions && step.description && (
                  <p className={`mt-1 text-gray-600 dark:text-gray-400 ${sizeClasses.description} max-w-24`}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4" />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Preset progress indicators for common workflows
export const ScholarshipClaimProgress: React.FC<{
  currentStep: 'eligibility' | 'confirmation' | 'transaction' | 'complete';
  error?: boolean;
}> = ({ currentStep, error = false }) => {
  const steps: Step[] = [
    {
      id: 'eligibility',
      title: 'Check Eligibility',
      description: 'Verify requirements',
      status: currentStep === 'eligibility' ? (error ? 'error' : 'current') : 
             ['confirmation', 'transaction', 'complete'].includes(currentStep) ? 'completed' : 'pending'
    },
    {
      id: 'confirmation',
      title: 'Confirm Details',
      description: 'Review claim',
      status: currentStep === 'confirmation' ? (error ? 'error' : 'current') : 
             ['transaction', 'complete'].includes(currentStep) ? 'completed' : 'pending'
    },
    {
      id: 'transaction',
      title: 'Submit Transaction',
      description: 'Sign with wallet',
      status: currentStep === 'transaction' ? (error ? 'error' : 'current') : 
             currentStep === 'complete' ? 'completed' : 'pending'
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Funds received',
      status: currentStep === 'complete' ? 'completed' : 'pending'
    }
  ];

  return <ProgressIndicator steps={steps} />;
};

export const ScholarshipCreateProgress: React.FC<{
  currentStep: 'details' | 'criteria' | 'funding' | 'review' | 'transaction' | 'complete';
  error?: boolean;
}> = ({ currentStep, error = false }) => {
  const stepOrder = ['details', 'criteria', 'funding', 'review', 'transaction', 'complete'];
  const currentIndex = stepOrder.indexOf(currentStep);

  const steps: Step[] = [
    {
      id: 'details',
      title: 'Basic Details',
      description: 'Name & description',
      status: currentIndex > 0 ? 'completed' : (currentStep === 'details' ? (error ? 'error' : 'current') : 'pending')
    },
    {
      id: 'criteria',
      title: 'Eligibility',
      description: 'Set requirements',
      status: currentIndex > 1 ? 'completed' : (currentStep === 'criteria' ? (error ? 'error' : 'current') : 'pending')
    },
    {
      id: 'funding',
      title: 'Funding',
      description: 'Set amount',
      status: currentIndex > 2 ? 'completed' : (currentStep === 'funding' ? (error ? 'error' : 'current') : 'pending')
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      status: currentIndex > 3 ? 'completed' : (currentStep === 'review' ? (error ? 'error' : 'current') : 'pending')
    },
    {
      id: 'transaction',
      title: 'Deploy',
      description: 'Submit transaction',
      status: currentIndex > 4 ? 'completed' : (currentStep === 'transaction' ? (error ? 'error' : 'current') : 'pending')
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Scholarship live',
      status: currentStep === 'complete' ? 'completed' : 'pending'
    }
  ];

  return <ProgressIndicator steps={steps} orientation="horizontal" />;
};

export default ProgressIndicator;
