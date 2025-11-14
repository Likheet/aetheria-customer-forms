/**
 * FormStep - Redesigned with modern, clean aesthetic
 * Provides beautiful card-based layout for each consultation question
 *
 * Design Philosophy:
 * - Spacious white cards with subtle shadows
 * - Clear visual hierarchy with generous spacing
 * - Smooth micro-interactions for delightful UX
 * - Accessible contrast ratios (WCAG AA compliant)
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

const iconVariantStyles = {
  default: 'bg-secondary/80 text-secondary-foreground',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-50 text-green-600 border-green-100',
  danger: 'bg-red-50 text-red-600 border-red-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
};

const badgeVariantStyles = {
  default: 'bg-secondary text-secondary-foreground border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-50 text-green-700 border-green-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

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
  return (
    <div
      className={`
        w-full max-w-4xl mx-auto
        bg-white rounded-2xl shadow-card
        hover:shadow-card-hover
        transition-all duration-300 ease-out
        p-8 md:p-12
        space-y-8
        ${className || ''}
      `}
    >
      {/* Badge (if provided) - shown at top */}
      {badge && (
        <div className={`
          inline-flex items-center gap-2.5
          px-4 py-2 rounded-full
          border-2 text-sm font-medium
          transition-smooth
          ${badgeVariantStyles[badge.variant || 'default']}
          ${centered ? 'mx-auto' : ''}
        `}>
          {badge.icon && <badge.icon className="w-4 h-4" />}
          <span>{badge.label}</span>
        </div>
      )}

      {/* Header section with improved spacing and typography */}
      <div className={`space-y-4 ${centered ? 'text-center flex flex-col items-center' : ''}`}>
        {/* Icon - larger and more prominent */}
        {Icon && (
          <div className={`
            flex h-16 w-16 items-center justify-center
            rounded-2xl border-2
            transition-smooth
            ${iconVariantStyles[iconVariant]}
            ${centered ? 'mx-auto' : ''}
          `}>
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </div>
        )}

        {/* Title - improved typography */}
        <h2 className={`
          text-3xl font-semibold tracking-tight
          text-foreground
          leading-tight
          text-balance
          ${centered ? 'max-w-2xl' : ''}
        `}>
          {title}
        </h2>

        {/* Subtitle - improved readability */}
        {subtitle && (
          <p className={`
            text-base text-muted-foreground
            leading-relaxed
            max-w-2xl
            ${centered ? 'mx-auto' : ''}
          `}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Content area with proper spacing */}
      <div className={`
        w-full pt-4
        ${centered ? 'flex flex-col items-center' : ''}
      `}>
        {children}
      </div>
    </div>
  );
};

export default FormStep;
