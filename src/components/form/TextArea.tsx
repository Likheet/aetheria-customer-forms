/**
 * TextArea - Modern textarea component built on ShadCN
 */

import React from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label */
  label?: string;

  /** Error message to display */
  error?: string;

  /** Helper text to show below textarea */
  helperText?: string;

  /** Whether the textarea is required */
  required?: boolean;

  /** Full width */
  fullWidth?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, required, fullWidth = true, className, id, ...props }, ref) => {
    const hasError = !!error;
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <Label
            htmlFor={textareaId}
            className="text-sm font-semibold text-gray-200 mb-2 block"
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}

        {/* Textarea */}
        <Textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "bg-gray-800/60 border-gray-700/50 text-gray-100 placeholder:text-gray-500 min-h-[100px]",
            "focus:border-amber-500/50 focus:ring-amber-500/20",
            hasError && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {/* Error message */}
        {error && (
          <p id={`${textareaId}-error`} className="text-red-300 text-sm mt-2 flex items-center gap-1.5">
            <span className="font-medium">⚠</span> {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="text-gray-400 text-sm mt-2">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
