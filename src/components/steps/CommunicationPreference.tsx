import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const CommunicationPreference: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const isValid = formData.communicationPreference && formData.dataConsent;

  return (
    <FormStep
      title="How would you like to receive your consultation results?"
      onNext={onNext}
      onBack={onBack}
      isValid={Boolean(isValid)}
      nextLabel="Complete Consultation"
    >
      <div className="space-y-6">
        <div>
          <p className="text-white/75 text-center mb-6 text-sm font-medium">
            Choose how you'd like to receive your personalized recommendations
          </p>
          
          <div className="space-y-3">
            <div className="relative">
              <input
                type="radio"
                id="whatsapp"
                name="communication"
                value="whatsapp"
                checked={formData.communicationPreference === 'whatsapp'}
                onChange={(e) => updateFormData({ communicationPreference: e.target.value })}
                className="sr-only"
              />
              <label
                htmlFor="whatsapp"
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.communicationPreference === 'whatsapp'
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <div className="font-medium text-white">WhatsApp</div>
                      <div className="text-sm text-white/70">Instant messaging with quick responses</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    formData.communicationPreference === 'whatsapp'
                      ? 'border-white bg-white'
                      : 'border-white/50'
                  }`}>
                    {formData.communicationPreference === 'whatsapp' && (
                      <div className="w-2 h-2 bg-rose-400 rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <div className="relative">
              <input
                type="radio"
                id="email"
                name="communication"
                value="email"
                checked={formData.communicationPreference === 'email'}
                onChange={(e) => updateFormData({ communicationPreference: e.target.value })}
                className="sr-only"
              />
              <label
                htmlFor="email"
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.communicationPreference === 'email'
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <div className="font-medium text-white">Email</div>
                      <div className="text-sm text-white/70">Detailed report with recommendations</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    formData.communicationPreference === 'email'
                      ? 'border-white bg-white'
                      : 'border-white/50'
                  }`}>
                    {formData.communicationPreference === 'email' && (
                      <div className="w-2 h-2 bg-rose-400 rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <div className="relative">
              <input
                type="radio"
                id="both"
                name="communication"
                value="both"
                checked={formData.communicationPreference === 'both'}
                onChange={(e) => updateFormData({ communicationPreference: e.target.value })}
                className="sr-only"
              />
              <label
                htmlFor="both"
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.communicationPreference === 'both'
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱📧</span>
                    <div>
                      <div className="font-medium text-white">Both WhatsApp & Email</div>
                      <div className="text-sm text-white/70">Get the best of both options</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    formData.communicationPreference === 'both'
                      ? 'border-white bg-white'
                      : 'border-white/50'
                  }`}>
                    {formData.communicationPreference === 'both' && (
                      <div className="w-2 h-2 bg-rose-400 rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <div className="relative">
              <input
                type="radio"
                id="no"
                name="communication"
                value="no"
                checked={formData.communicationPreference === 'no'}
                onChange={(e) => updateFormData({ communicationPreference: e.target.value })}
                className="sr-only"
              />
              <label
                htmlFor="no"
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.communicationPreference === 'no'
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚫</span>
                    <div>
                      <div className="font-medium text-white">No</div>
                      <div className="text-sm text-white/70">I don't want to receive recommendations</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    formData.communicationPreference === 'no'
                      ? 'border-white bg-white'
                      : 'border-white/50'
                  }`}>
                    {formData.communicationPreference === 'no' && (
                      <div className="w-2 h-2 bg-rose-400 rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {errors.communicationPreference && (
            <p className="text-red-500 text-sm text-center mt-2">{errors.communicationPreference}</p>
          )}
        </div>

      </div>
    </FormStep>
  );
};

export default CommunicationPreference;