import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';

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
      title={<span className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow font-sans">Final Notes & Confirmation</span>}
      onNext={onSubmit}
      onBack={onBack} 
      isValid={isValid || false}
      nextLabel={isSubmitting ? 'Submitting...' : 'Complete Submission'}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Staff Notes
          </label>
          <textarea
            value={formData.staff_notes}
            onChange={(e) => handleInputChange('staff_notes', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            rows={4}
            placeholder="Add any internal notes about the consultation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Staff Member Name *
          </label>
          <input
            type="text"
            value={formData.staff_member}
            onChange={(e) => handleInputChange('staff_member', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            placeholder="Enter your name"
          />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            id="follow_up_required"
            checked={!!formData.follow_up_required}
            onChange={(e) => handleInputChange('follow_up_required', e.target.checked)}
            className="form-checkbox h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="follow_up_required" className="text-gray-800">
            Follow-up required?
          </label>
        </div>

        {formData.follow_up_required && (
          <div className="pl-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Follow-up Date *
            </label>
            <input
              type="date"
              value={formData.follow_up_date || ''}
              onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            />
          </div>
        )}
      </div>
    </FormStep>
  );
};

export default ConsultantNotes; 