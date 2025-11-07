/**
 * usePageTransition - Custom hook for page transitions with overlays
 * Eliminates hardcoded transition logic
 */

import { useCallback } from 'react';
import { TRANSITION_GRADIENTS, ANIMATION_DURATION, Z_INDEX } from '../lib/design-tokens';
import type { TransitionGradient } from '../lib/design-tokens';

interface PageTransitionOptions {
  duration?: number;
  zIndex?: number;
}

export const usePageTransition = () => {
  const transitionWithGradient = useCallback(
    (
      gradientKey: TransitionGradient,
      onComplete: () => void,
      options: PageTransitionOptions = {}
    ) => {
      const {
        duration = ANIMATION_DURATION.transition,
        zIndex = Z_INDEX.transition,
      } = options;

      const gradient = TRANSITION_GRADIENTS[gradientKey];

      const overlay = document.createElement('div');
      overlay.className = 'transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${gradient};
        z-index: ${zIndex};
        opacity: 0;
        transition: opacity ${duration}ms ease-in-out;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });

      setTimeout(() => {
        onComplete();
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
        }, duration);
      }, duration);
    },
    []
  );

  const transitionWithCustomGradient = useCallback(
    (
      gradient: string,
      onComplete: () => void,
      options: PageTransitionOptions = {}
    ) => {
      const {
        duration = ANIMATION_DURATION.transition,
        zIndex = Z_INDEX.transition,
      } = options;

      const overlay = document.createElement('div');
      overlay.className = 'transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${gradient};
        z-index: ${zIndex};
        opacity: 0;
        transition: opacity ${duration}ms ease-in-out;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });

      setTimeout(() => {
        onComplete();
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
        }, duration);
      }, duration);
    },
    []
  );

  return {
    transitionWithGradient,
    transitionWithCustomGradient,
  };
};

export default usePageTransition;
