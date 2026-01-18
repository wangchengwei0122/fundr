'use client';

import { cn } from '@/lib/utils';

export type Step = {
  id: string;
  label: string;
  description?: string;
};

export type StepIndicatorProps = {
  steps: Step[] | readonly Step[];
  currentStep: number;
  /** Callback when step is clicked */
  onStepClick?: (stepIndex: number) => void;
  className?: string;
};

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-base',
                  'sm:px-4',
                  isCompleted && 'bg-success/10 text-success',
                  isCurrent && 'bg-primary text-primary-foreground',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    isCompleted && 'bg-success text-success-foreground',
                    isCurrent && 'bg-primary-foreground/20',
                    !isCompleted && !isCurrent && 'bg-border'
                  )}
                >
                  {isCompleted ? '\u2713' : index + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8 sm:w-12',
                    index < currentStep ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
