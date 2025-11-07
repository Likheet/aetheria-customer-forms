/**
 * BackgroundGlow - Reusable ambient glow effect component
 * Eliminates hardcoded background glow patterns throughout the app
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const glowVariants = cva(
  'pointer-events-none absolute rounded-full blur-[120px] transition-opacity duration-700',
  {
    variants: {
      color: {
        gold: 'bg-gradient-to-br from-[hsla(40,58%,62%,0.18)] to-transparent',
        purple: 'bg-gradient-to-br from-[hsla(266,32%,26%,0.22)] to-transparent',
        goldLight: 'bg-gradient-to-br from-[hsla(40,58%,62%,0.15)] to-transparent',
        purpleLight: 'bg-gradient-to-br from-[hsla(266,32%,26%,0.2)] to-transparent',
        goldStrong: 'bg-gradient-to-br from-[hsla(40,58%,62%,0.22)] to-transparent',
        purpleStrong: 'bg-gradient-to-br from-[hsla(266,32%,26%,0.28)] to-transparent',
      },
      position: {
        'top-left': '-left-16 top-24',
        'top-right': 'right-0 top-16',
        'top-center': 'left-1/2 -translate-x-1/2 top-20',
        'bottom-left': 'left-32 bottom-24',
        'bottom-right': 'right-24 bottom-20',
        'center': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
      },
      size: {
        sm: 'h-52 w-52',
        md: 'h-64 w-64',
        lg: 'h-72 w-72',
        xl: 'h-80 w-80',
      },
      blur: {
        light: 'blur-[100px]',
        medium: 'blur-[150px]',
        strong: 'blur-[180px]',
        intense: 'blur-[200px]',
      },
    },
    defaultVariants: {
      color: 'gold',
      position: 'top-left',
      size: 'lg',
      blur: 'medium',
    },
  }
);

export interface BackgroundGlowProps extends VariantProps<typeof glowVariants> {
  className?: string;
}

export const BackgroundGlow: React.FC<BackgroundGlowProps> = ({
  color,
  position,
  size,
  blur,
  className,
}) => {
  return (
    <div
      className={glowVariants({ color, position, size, blur, className })}
      aria-hidden="true"
    />
  );
};

/**
 * BackgroundGlowContainer - Pre-configured multi-glow patterns
 */
interface BackgroundGlowContainerProps {
  variant?: 'default' | 'intense' | 'subtle' | 'centered';
  children?: React.ReactNode;
}

export const BackgroundGlowContainer: React.FC<BackgroundGlowContainerProps> = ({
  variant = 'default',
  children,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0">
      {variant === 'default' && (
        <>
          <BackgroundGlow color="goldLight" position="top-left" size="lg" blur="medium" />
          <BackgroundGlow color="purpleLight" position="top-right" size="xl" blur="strong" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[rgba(8,9,13,0.75)] to-transparent" />
        </>
      )}

      {variant === 'intense' && (
        <>
          <BackgroundGlow color="goldStrong" position="top-left" size="xl" blur="intense" />
          <BackgroundGlow color="purpleStrong" position="top-right" size="xl" blur="intense" />
          <BackgroundGlow color="goldLight" position="bottom-right" size="md" blur="medium" />
          <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-[rgba(10,12,18,0.75)] to-transparent" />
        </>
      )}

      {variant === 'subtle' && (
        <>
          <BackgroundGlow color="goldLight" position="top-left" size="md" blur="light" />
          <BackgroundGlow color="purpleLight" position="top-right" size="lg" blur="medium" />
        </>
      )}

      {variant === 'centered' && (
        <>
          <BackgroundGlow color="gold" position="center" size="xl" blur="intense" />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[rgba(8,9,13,0.6)]" />
        </>
      )}

      {children}
    </div>
  );
};

export default BackgroundGlow;
