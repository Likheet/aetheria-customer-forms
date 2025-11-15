import React from 'react';
import { StepProps } from '../../../types';
import { FormStep } from '../../form/FormStep';

interface ConsultantNotesProps extends StepProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ConsultantNotes: React.FC<ConsultantNotesProps> = ({ formData, updateFormData, onBack, onSubmit, isSubmitting }) => {
  const handleInputChange = (field: string, value: string | boolean) => {
    updateFormData({
      ...formData,
      [field]: value,
    });
    // If unchecking "follow-up required", clear the date
    if (field === 'follow_up_required' && !value) {
      updateFormData({ ...formData, follow_up_date: '' });
    }
  };

  const isStaffMemberValid = formData.staff_member && formData.staff_member.trim().length > 0;
  const isFollowUpValid = !formData.follow_up_required || (formData.follow_up_required && !!formData.follow_up_date);
  const isValid = isStaffMemberValid && isFollowUpValid;

  return (
    <FormStep
      title="Final Notes & Confirmation"
      onNext={onSubmit}
      onBack={onBack}
      isValid={isValid || false}
      nextLabel={isSubmitting ? 'Submitting...' : 'Complete Submission'}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Staff Notes
          </label>
          <textarea
            value={formData.staff_notes}
            onChange={(e) => handleInputChange('staff_notes', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-surface/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            rows={4}
            placeholder="Add any internal notes about the consultation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Staff Member Name *
          </label>
          <input
            type="text"
            value={formData.staff_member}
            onChange={(e) => handleInputChange('staff_member', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-surface/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your name"
          />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-surface/70 cursor-pointer hover:border-border/70 transition-colors">
          <input
            type="checkbox"
            id="follow_up_required"
            checked={!!formData.follow_up_required}
            onChange={(e) => handleInputChange('follow_up_required', e.target.checked)}
            className="form-checkbox h-5 w-5 rounded border-border/60 text-primary focus:ring-primary/50 bg-surface/80"
          />
          <label htmlFor="follow_up_required" className="text-foreground/90 cursor-pointer">
            Follow-up required?
          </label>
        </div>

        {formData.follow_up_required && (
          <div className="pl-4">
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Follow-up Date *
            </label>
            <input
              type="date"
              value={formData.follow_up_date || ''}
              onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-surface/60 text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}
      </div>
    </FormStep>
  );
};

export default ConsultantNotes; 