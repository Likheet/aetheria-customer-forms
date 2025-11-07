/**
 * TextInput - Consistent text input component
 * Replaces hard-coded input styling
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
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label - Light text for dark theme */}
        {label && (
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input field with dark theme styling */}
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

        {/* Error message - Light red text on dark */}
        {error && (
          <p id={`${props.id}-error`} className="text-red-300 text-sm mt-2 flex items-center gap-1">
            <span className="font-medium">⚠</span> {error}
          </p>
        )}

        {/* Helper text - Light gray on dark */}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-gray-400 text-sm mt-2">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
