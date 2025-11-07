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
      {/* Minimal luxury card - clean with subtle premium touches */}
      <div className="relative animate-fade-in-up rounded-3xl border border-border/50 p-12 md:p-16 bg-surface/95 shadow-sm">
        {/* Single subtle accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Badge at top left (if provided) */}
        {badge && !centered && (
          <div className="absolute -top-3 left-8">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${
                badgeColors[badge.variant || 'primary']
              }`}
            >
              {badge.icon && <badge.icon className="w-3.5 h-3.5" />}
              <span>{badge.label}</span>
            </div>
          </div>
        )}

        {/* Header section */}
        <div className={centered ? 'text-center' : ''}>
          {/* Icon - simplified, no fancy container */}
          {Icon && (
            <div className={`${centered ? 'mx-auto' : ''} mb-8`}>
              <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
          )}

          {/* Title - clean serif with subtle gold accent on hover */}
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 font-serif text-foreground transition-colors hover:text-primary/90">
            {title}
          </h2>

          {/* Subtitle - minimal, clean */}
          {subtitle && (
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mx-auto font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content area - clean and spacious */}
        <div className="max-w-3xl mx-auto w-full mt-12">{children}</div>
      </div>
    </div>
  );
};

export default FormStep;
