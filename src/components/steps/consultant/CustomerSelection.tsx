import React, { useState, useEffect } from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';
import { getConsultationsWithoutInput } from '../../../services/consultantInputService';
import { ConsultationData, ConsultantInputData } from '../../../lib/supabase';

const CustomerSelection: React.FC<StepProps & { isLoading: boolean }> = ({ formData, updateFormData, onNext, onBack, errors, isLoading }) => {
  const [availableConsultations, setAvailableConsultations] = useState<Partial<ConsultationData>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(formData.consultation_id || null);

  useEffect(() => {
    const loadConsultations = async () => {
      const result = await getConsultationsWithoutInput();
      if (result.success && result.data) {
        setAvailableConsultations(result.data);
      } else {
        setError(result.error || 'Failed to load consultations.');
      }
    };
    loadConsultations();
  }, []);

  const handleSelect = (consultation: Partial<ConsultationData>) => {
    setSelectedId(consultation.id!);
    updateFormData({
      consultation_id: consultation.id,
      customer_name: consultation.name,
      customer_phone: consultation.phone,
    } as Partial<Omit<ConsultantInputData, 'id' | 'created_at'>>);
  };

  const handleDoubleClick = (consultation: Partial<ConsultationData>) => {
    handleSelect(consultation);
    onNext();
  };

  const isValid = !!selectedId;

  return (
    <FormStep
      title="Select a Customer"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {availableConsultations.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c)}
                onDoubleClick={() => handleDoubleClick(c)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedId === c.id
                    ? 'bg-blue-100 border-blue-500 shadow-lg'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">{c.phone}</div>
              </div>
            ))}
          </div>
        )}
        {errors.customer && (
          <p className="text-red-500 text-sm">{errors.customer}</p>
        )}
      </div>
    </FormStep>
  );
};

export default CustomerSelection; 