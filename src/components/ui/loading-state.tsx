/**
 * LoadingState - Reusable loading indicator component
 * Eliminates hardcoded loading patterns throughout the app
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const loadingContainerVariants = cva(
  'flex flex-col items-center justify-center gap-4 text-muted-foreground/80',
  {
    variants: {
      size: {
        sm: 'min-h-[200px]',
        md: 'min-h-[320px]',
        lg: 'min-h-[400px]',
        full: 'min-h-screen',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const spinnerVariants = cva(
  'animate-spin rounded-full border-2',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-14 w-14',
        xl: 'h-16 w-16',
      },
      color: {
        primary: 'border-primary/30 border-t-primary',
        secondary: 'border-secondary/30 border-t-secondary',
        accent: 'border-accent/30 border-t-accent',
        muted: 'border-muted/30 border-t-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
);

const messageVariants = cva(
  'text-center',
  {
    variants: {
      variant: {
        default: 'text-sm',
        caption: 'text-xs uppercase tracking-[0.32em]',
      },
    },
    defaultVariants: {
      variant: 'caption',
    },
  }
);

export interface LoadingStateProps extends VariantProps<typeof loadingContainerVariants> {
  /** Loading message to display */
  message?: string;
  /** Spinner size */
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
  /** Spinner color */
  spinnerColor?: VariantProps<typeof spinnerVariants>['color'];
  /** Message variant */
  messageVariant?: VariantProps<typeof messageVariants>['variant'];
  /** Custom className for container */
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size,
  message = 'Loading...',
  spinnerSize = 'md',
  spinnerColor = 'primary',
  messageVariant = 'caption',
  className,
}) => {
  return (
    <div className={loadingContainerVariants({ size, className })}>
      <div className={spinnerVariants({ size: spinnerSize, color: spinnerColor })} />
      {message && (
        <span className={messageVariants({ variant: messageVariant })}>
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingState;
