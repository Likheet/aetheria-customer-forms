/**
 * FormStep - Consistent container for each form step
 * Provides title, icon, subtitle, and content area
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface FormStepProps {
  /** Step title */
  title: string;

  /** Optional subtitle/description */
  subtitle?: string;

  /** Icon to display (Lucide React icon component) */
  icon?: LucideIcon;

  /** Icon container color variant */
  iconVariant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'purple';

  /** Content of the step */
  children: React.ReactNode;

  /** Whether to center the content */
  centered?: boolean;

  /** Optional badge to display next to title (e.g., concern name) */
  badge?: {
    label: string;
    icon?: LucideIcon;
    variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'purple';
  };

  /** Custom className */
  className?: string;
}

export const FormStep: React.FC<FormStepProps> = ({
  title,
  subtitle,
  icon: Icon,
  children,
  centered = false,
  badge,
  className,
}) => {
  return (
    <div className={`w-full max-w-4xl mx-auto space-y-8 py-8 ${className || ''}`}>
      {/* Badge (if provided) */}
      {badge && !centered && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border bg-muted text-sm font-medium">
          {badge.icon && <badge.icon className="w-4 h-4" />}
          <span>{badge.label}</span>
        </div>
      )}

      {/* Header section */}
      <div className={centered ? 'text-center' : ''}>
        {/* Icon */}
        {Icon && (
          <div className={`${centered ? 'mx-auto' : ''} mb-4 flex h-12 w-12 items-center justify-center rounded-md border bg-muted`}>
            <Icon className="h-6 w-6" />
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-semibold tracking-tight">
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content area */}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default FormStep;
