import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const getSectionInfo = (step: number) => {
    if (step <= 6) return { name: 'Basic Information', color: 'from-blue-400 to-blue-500' };
    if (step <= 19) return { name: 'Facial Customization', color: 'from-rose-400 to-pink-500' };
    if (step <= 23) return { name: 'Lifestyle & Habits', color: 'from-green-400 to-emerald-500' };
    if (step <= 31) return { name: 'Hair & Scalp', color: 'from-purple-400 to-violet-500' };
    return { name: 'Final Consent', color: 'from-amber-400 to-orange-500' };
  };

  const currentSection = getSectionInfo(currentStep);

  return (
    <div className="w-full mb-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-light text-white/90">
          {currentSection.name}
        </span>
        <span className="text-sm font-light text-white/70">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 relative overflow-hidden border border-white/30">
        <div
          className={`bg-gradient-to-r ${currentSection.color} h-3 rounded-full transition-all duration-700 ease-out relative shadow-lg opacity-90`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-full"></div>
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-white/60">
        <span className={`transition-all duration-300 ${currentStep <= 6 ? 'font-medium text-blue-300 scale-110' : 'hover:text-white/80'}`}>Basic Info</span>
        <span className={`transition-all duration-300 ${currentStep > 6 && currentStep <= 19 ? 'font-medium text-rose-300 scale-110' : 'hover:text-white/80'}`}>Facial</span>
        <span className={`transition-all duration-300 ${currentStep > 19 && currentStep <= 23 ? 'font-medium text-green-300 scale-110' : 'hover:text-white/80'}`}>Lifestyle</span>
        <span className={`transition-all duration-300 ${currentStep > 23 && currentStep <= 31 ? 'font-medium text-purple-300 scale-110' : 'hover:text-white/80'}`}>Hair & Scalp</span>
        <span className={`transition-all duration-300 ${currentStep > 31 ? 'font-medium text-amber-300 scale-110' : 'hover:text-white/80'}`}>Final</span>
      </div>
    </div>
  );
};

export default ProgressBar;