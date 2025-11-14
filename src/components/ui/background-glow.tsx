/**
 * BackgroundGlow - Simplified no-op component for compatibility
 */

import React from 'react';

export interface BackgroundGlowProps {
  className?: string;
  color?: string;
  position?: string;
  size?: string;
  blur?: string;
}

export const BackgroundGlow: React.FC<BackgroundGlowProps> = () => {
  return null;
};

interface BackgroundGlowContainerProps {
  variant?: 'default' | 'intense' | 'subtle' | 'centered';
  children?: React.ReactNode;
}

export const BackgroundGlowContainer: React.FC<BackgroundGlowContainerProps> = () => {
  return null;
};

export default BackgroundGlow;
