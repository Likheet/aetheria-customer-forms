/**
 * ErrorState - Reusable error state component
 * Eliminates hardcoded error patterns throughout the app
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

const errorCardVariants = cva(
  'mx-auto max-w-xl',
  {
    variants: {
      variant: {
        error: 'border-destructive/50 bg-gradient-to-br from-destructive/15 to-destructive/10',
        warning: 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-yellow-900/10',
        info: 'border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-900/10',
      },
    },
    defaultVariants: {
      variant: 'error',
    },
  }
);

export interface ErrorStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
}

export interface ErrorStateProps extends VariantProps<typeof errorCardVariants> {
  /** Error title */
  title: string;
  /** Error message/description */
  message: string;
  /** Action buttons */
  actions?: ErrorStateAction[];
  /** Optional icon override */
  icon?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  variant = 'error',
  title,
  message,
  actions,
  icon,
  className,
}) => {
  const defaultIcon = React.useMemo(() => {
    if (icon) return icon;

    switch (variant) {
      case 'error':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertCircle className="h-6 w-6" />;
    }
  }, [variant, icon]);

  const titleColor = React.useMemo(() => {
    switch (variant) {
      case 'error':
        return 'text-destructive-foreground';
      case 'warning':
        return 'text-yellow-200';
      case 'info':
        return 'text-blue-200';
      default:
        return 'text-foreground';
    }
  }, [variant]);

  const descriptionColor = React.useMemo(() => {
    switch (variant) {
      case 'error':
        return 'text-destructive-foreground/80';
      case 'warning':
        return 'text-yellow-200/80';
      case 'info':
        return 'text-blue-200/80';
      default:
        return 'text-muted-foreground';
    }
  }, [variant]);

  return (
    <Card className={errorCardVariants({ variant, className })}>
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3">
          {defaultIcon}
          <div className="flex-1">
            <CardTitle className={`text-lg ${titleColor}`}>
              {title}
            </CardTitle>
            <CardDescription className={`text-sm ${descriptionColor} mt-2`}>
              {message}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {actions && actions.length > 0 && (
        <CardFooter className="justify-end gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || (index === actions.length - 1 ? 'primary' : 'outline')}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorState;
