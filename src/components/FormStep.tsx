import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormStepProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  showNext?: boolean;
  showBack?: boolean;
  nextLabel?: string;
  isValid?: boolean;
}

const FormStep: React.FC<FormStepProps> = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  showNext = true,
  showBack = true,
  nextLabel = 'Next',
  isValid = true,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 mb-6 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
        {/* Glass morphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 via-transparent to-white/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-light mb-8 text-center leading-relaxed max-w-2xl mx-auto">
            {title}
          </h2>
          {subtitle && <div className="text-lg text-gray-400 mb-6 text-center">{subtitle}</div>}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full space-y-4">
            {children}
          </div>
        </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center px-4">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            <ArrowLeft size={22} />
            <span className="font-medium">Back</span>
          </button>
        ) : (
          <div />
        )}
        
        {showNext && onNext && (
          <button
            onClick={onNext}
            disabled={!isValid}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl hover:from-rose-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-medium"
          >
            <span className="font-medium">{nextLabel}</span>
            <ArrowRight size={22} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FormStep;