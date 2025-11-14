/**
 * TextInput - Modern, accessible text input component
 * Clean light theme with polished interactions
 */

import React from 'react';
import { inputVariants } from '../../styles/variants';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;

  /** Error message to display */
  error?: string;

  /** Helper text to show below input */
  helperText?: string;

  /** Whether the input is required */
  required?: boolean;

  /** Full width */
  fullWidth?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, required, fullWidth = true, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={fullWidth ? 'w-full max-w-2xl mx-auto' : ''}>
        {/* Label - Clear dark text on light background */}
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2.5">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Input field with clean light theme styling */}
        <input
          ref={ref}
          className={inputVariants({
            variant: hasError ? 'error' : 'default',
            className,
          })}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />

        {/* Error message - Clear red text */}
        {error && (
          <p id={`${props.id}-error`} className="text-destructive text-sm mt-2.5 flex items-center gap-1.5 font-medium">
            <span className="text-base">⚠</span> {error}
          </p>
        )}

        {/* Helper text - Muted but readable */}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-muted-foreground text-sm mt-2.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
