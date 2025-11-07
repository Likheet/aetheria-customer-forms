/**
 * FormStep - Consistent container for each form step
 * Provides title, icon, subtitle, and content area
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formStepVariants } from '../../styles/variants';
import { iconContainerVariants } from '../../styles/variants';

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
  iconVariant = 'primary',
  children,
  centered = false,
  badge,
  className,
}) => {
  const badgeColors = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-amber-100 text-amber-800 border-amber-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className={formStepVariants({ centered, className })}>
      {/* Badge at top left (if provided) */}
      {badge && !centered && (
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
              badgeColors[badge.variant || 'primary']
            }`}
          >
            {badge.icon && <badge.icon className="w-4 h-4" />}
            <span>{badge.label}</span>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className={centered ? 'text-center' : ''}>
        {/* Icon */}
        {Icon && (
          <div
            className={`${
              centered ? 'mx-auto' : ''
            } mb-6 ${iconContainerVariants({ variant: iconVariant, size: 'lg' })}`}
          >
            <Icon className="w-8 h-8" />
          </div>
        )}

        {/* Title */}
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && <p className="text-gray-600 text-base">{subtitle}</p>}
      </div>

      {/* Content area */}
      <div className="max-w-2xl mx-auto w-full">{children}</div>
    </div>
  );
};

export default FormStep;
