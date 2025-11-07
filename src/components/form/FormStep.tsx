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
  // Dark theme badge colors with good contrast
  const badgeColors = {
    default: 'bg-gray-800/60 text-gray-100 border-gray-600/50 backdrop-blur-sm',
    primary: 'bg-amber-900/40 text-amber-200 border-amber-600/50 backdrop-blur-sm shadow-amber-500/20 shadow-lg',
    success: 'bg-green-900/40 text-green-200 border-green-600/50 backdrop-blur-sm shadow-green-500/20 shadow-lg',
    danger: 'bg-red-900/40 text-red-200 border-red-600/50 backdrop-blur-sm shadow-red-500/20 shadow-lg',
    warning: 'bg-yellow-900/40 text-yellow-200 border-yellow-600/50 backdrop-blur-sm shadow-yellow-500/20 shadow-lg',
    purple: 'bg-purple-900/40 text-purple-200 border-purple-600/50 backdrop-blur-sm shadow-purple-500/20 shadow-lg',
  };

  return (
    <div className={formStepVariants({ centered, className })}>
      {/* Luxury glass card wrapper */}
      <div className="luxury-section relative">
        {/* Ambient glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 via-transparent to-amber-600/20 rounded-[32px] blur-xl opacity-50" />

        <div className="relative">
          {/* Badge at top left (if provided) */}
          {badge && !centered && (
            <div className="absolute -top-3 left-6 z-10">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border-2 ${
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

            {/* Title - Using Playfair Display font with white text for maximum contrast */}
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4 font-serif">
              {title}
            </h2>

            {/* Subtitle - Light gray for good contrast on dark background */}
            {subtitle && (
              <p className="text-gray-300 text-base leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content area */}
          <div className="max-w-2xl mx-auto w-full mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default FormStep;
