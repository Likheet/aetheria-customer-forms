/**
 * ConcernPriorityStep - Drag to reorder priorities
 * Replaces UpdatedConsultForm.tsx concern priority rendering (lines 2617-2641)
 *
 * Pattern: Sortable list with up/down arrows
 * Acne is locked at #1 if selected
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { FormStep } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

/**
 * Concern Priority Step
 * Pattern: Reorder concerns using arrow buttons
 * Special: Acne stays at #1 if selected
 */
export const ConcernPriorityStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const selected = Array.isArray(formData.mainConcerns) ? formData.mainConcerns : [];
  const order = Array.isArray(formData.concernPriority) ? formData.concernPriority : [];

  // Move concern up or down
  const move = (concern: string, direction: number) => {
    const idx = order.indexOf(concern);
    if (idx === -1) return;

    const minIdx = selected.includes('Acne') ? 1 : 0; // Acne stays at #1
    const newIdx = idx + direction;

    // Prevent moving out of bounds or into Acne's position
    if (newIdx < minIdx || newIdx >= order.length) return;
    if (concern === 'Acne') return; // Acne can't move

    const newOrder = [...order];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    updateFormData({ concernPriority: newOrder });
  };

  return (
    <FormStep
      title="What would you like to prioritize?"
      subtitle="Drag to reorder or use the arrows. Acne stays #1 if selected."
      icon={Sparkles}
      iconVariant="primary"
      centered
    >
      <div className="max-w-xl mx-auto w-full">
        <ul className="space-y-2">
          {order.map((concern, idx) => {
            const isAcne = concern === 'Acne';
            const minIdx = selected.includes('Acne') ? 1 : 0;

            return (
              <li
                key={concern}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isAcne
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 inline-flex items-center justify-center rounded-full text-sm font-semibold ${
                      idx === 0
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-700/60 text-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`text-lg ${
                      isAcne ? 'text-red-700' : 'text-gray-800'
                    }`}
                  >
                    {concern}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(concern, -1)}
                    disabled={idx === minIdx || isAcne}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100 transition-colors"
                    aria-label={`Move ${concern} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(concern, 1)}
                    disabled={idx === order.length - 1}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100 transition-colors"
                    aria-label={`Move ${concern} down`}
                  >
                    ↓
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {errors.concernPriority && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {errors.concernPriority}
          </p>
        )}
      </div>
    </FormStep>
  );
};

/**
 * Code summary:
 *
 * Old implementation (lines 2617-2641): ~25 lines
 * - All logic inline in renderStep
 * - Hard-coded colors and spacing
 * - Complex inline conditions
 *
 * New implementation: ~125 lines (includes comments)
 * - Clear move function with bounds checking
 * - Acne locking logic centralized
 * - Consistent with other step components
 * - Better accessibility with aria-labels
 *
 * Benefits:
 * - Easy to test move logic independently
 * - Clear separation of UI and logic
 * - Type-safe array operations
 * - All styling centralized
 * - Easier to add drag-and-drop later if needed
 */
