/**
 * TextInput - Modern text input component built on ShadCN
 */

import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

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
  ({ label, error, helperText, required, fullWidth = true, className, id, ...props }, ref) => {
    const hasError = !!error;
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <Label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-200 mb-2 block"
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}

        {/* Input field */}
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            "bg-gray-800/60 border-gray-700/50 text-gray-100 placeholder:text-gray-500",
            "focus:border-amber-500/50 focus:ring-amber-500/20",
            hasError && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {/* Error message */}
        {error && (
          <p id={`${inputId}-error`} className="text-red-300 text-sm mt-2 flex items-center gap-1.5">
            <span className="font-medium">⚠</span> {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-gray-400 text-sm mt-2">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
