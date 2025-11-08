import React from 'react';

interface TreatmentTypeSelectionProps {
  onSelect: (treatmentType: 'Skin Only' | 'Hair Only' | 'Both') => void;
  onBack: () => void;
}

const TreatmentTypeSelection: React.FC<TreatmentTypeSelectionProps> = ({ onSelect, onBack }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Select Treatment Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onSelect('Skin Only')}
          className="p-4 border rounded-lg hover:bg-gray-100"
        >
          Skin Only
        </button>
        <button
          onClick={() => onSelect('Hair Only')}
          className="p-4 border rounded-lg hover:bg-gray-100"
        >
          Hair Only
        </button>
        <button
          onClick={() => onSelect('Both')}
          className="p-4 border rounded-lg hover:bg-gray-100"
        >
          Both
        </button>
      </div>
      <button onClick={onBack} className="mt-4 text-sm text-gray-600">
        Back
      </button>
    </div>
  );
};

export default React.memo(TreatmentTypeSelection); 