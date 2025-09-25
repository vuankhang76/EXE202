import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'white';
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  white: 'text-white'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  text = 'Đang tải...',
  showText = false,
  className,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        showText && 'flex-col gap-2',
        className
      )}
      {...props}
    >
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {showText && text && (
        <span className={cn(
          'font-medium',
          textSizeClasses[size],
          variantClasses[variant]
        )}>
          {text}
        </span>
      )}
    </div>
  );
}

// Preset loading components for common use cases
export function ButtonLoadingSpinner({ className, ...props }: Omit<LoadingSpinnerProps, 'size' | 'variant'>) {
  return (
    <LoadingSpinner 
      size="sm" 
      variant="white"
      className={cn('mr-2', className)}
      {...props}
    />
  );
}

export function PageLoadingSpinner({ className, ...props }: Omit<LoadingSpinnerProps, 'size' | 'showText'>) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <LoadingSpinner 
        size="lg" 
        showText={true}
        className={className}
        {...props}
      />
    </div>
  );
}

export function FullPageLoadingSpinner({ className, ...props }: Omit<LoadingSpinnerProps, 'size' | 'showText'>) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner 
        size="xl" 
        showText={true}
        className={className}
        {...props}
      />
    </div>
  );
}

export default LoadingSpinner;
