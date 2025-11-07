/**
 * TagInput - Tag/chip input with autocomplete suggestions
 * Extracted from UpdatedConsultForm.tsx (lines 1148-1325)
 * Used for entering multiple items (e.g., irritating products)
 */

import React, { useState, useRef } from 'react';

export interface TagInputProps {
  /** Current tags */
  value: string[];

  /** Called when tags change */
  onChange: (tags: string[]) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Autocomplete suggestions */
  suggestions?: string[];

  /** Additional className */
  className?: string;

  /** Helper text */
  helperText?: string;
}

// Default ingredient suggestions for irritating products
const DEFAULT_SUGGESTIONS = [
  'Azelaic Acid',
  'Benzoyl Peroxide',
  'Glycolic Acid (AHA)',
  'Hydroquinone',
  'Kojic Acid',
  'Lactic Acid (AHA)',
  'Mandelic Acid (AHA)',
  'Niacinamide',
  'Retinol / Retinoids (Adapalene, Tretinoin, etc.)',
  'Salicylic Acid (BHA)',
  'Vitamin C (Ascorbic Acid, Derivatives)',
].sort((a, b) => a.localeCompare(b));

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Type and press Enter or comma...',
  suggestions = DEFAULT_SUGGESTIONS,
  className,
  helperText = 'Separate items with commas or press Enter',
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);

  const addTag = (raw: string) => {
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = Array.from(new Set([...value, ...parts]));
    onChange(next);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const filteredSuggestions = input.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(input.toLowerCase()))
    : suggestions;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Escape
    if (e.key === 'Escape') {
      if (input.trim()) {
        e.preventDefault();
        e.stopPropagation();
        setInput('');
        setHighlight(-1);
        return;
      }
      if (focused && filteredSuggestions.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        setFocused(false);
        setHighlight(-1);
        return;
      }
    }

    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((prev) => Math.min(prev + 1, filteredSuggestions.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((prev) => Math.max(prev - 1, 0));
      return;
    }

    // Select highlighted suggestion
    if (
      (e.key === 'Enter' || e.key === 'Tab') &&
      highlight >= 0 &&
      filteredSuggestions[highlight]
    ) {
      e.preventDefault();
      addTag(filteredSuggestions[highlight]);
      setInput('');
      setHighlight(-1);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    // Add tag on Enter, comma, or Tab
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (input.trim()) {
        e.preventDefault();
        addTag(input);
        setInput('');
        setHighlight(-1);
        requestAnimationFrame(() => inputRef.current?.focus());
      } else if (e.key === 'Tab') {
        // Allow tab to move focus when input empty
      } else {
        e.preventDefault();
      }
    }

    // Backspace to remove last tag when input empty
    if (e.key === 'Backspace' && input === '' && value.length > 0) {
      e.preventDefault();
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setFocused(false);
      if (input.trim()) {
        addTag(input);
        setInput('');
      }
      setHighlight(-1);
    }, 150);
  };

  const handleFocus = () => {
    setFocused(true);
    setHighlight(-1);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 items-center p-2 border border-border/60 rounded-xl bg-surface/60 relative">
        {/* Tags */}
        {value.map((tag, i) => (
          <div
            key={tag + i}
            className="inline-flex items-center space-x-2 bg-primary/15 text-sm text-foreground/90 px-3 py-1 rounded-full border border-primary/30"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="flex-1 min-w-[160px] p-2 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground/50"
          aria-autocomplete="list"
          aria-expanded={focused}
        />

        {/* Autocomplete dropdown */}
        {focused && filteredSuggestions.length > 0 && (
          <div className="absolute left-2 right-2 top-full mt-2 bg-surface border border-border/60 rounded-lg shadow-xl z-50 max-h-48 overflow-auto">
            {filteredSuggestions.map((suggestion, idx) => (
              <div
                key={suggestion}
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  addTag(suggestion);
                  setInput('');
                  setHighlight(-1);
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                onMouseEnter={() => setHighlight(idx)}
                className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                  highlight === idx ? 'bg-primary/20 text-foreground' : 'hover:bg-surface/80 text-foreground/80'
                }`}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      {helperText && (
        <p className="text-xs text-muted-foreground/70 mt-2">{helperText}</p>
      )}
    </div>
  );
};

export default TagInput;
