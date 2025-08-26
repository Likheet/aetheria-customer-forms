import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const BasicInfo: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors, field }) => {

  const handleInputChange = (value: string) => {
    updateFormData({ [field!]: value });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (isValid()) {
        onNext();
      }
    }
  };

  const getTitle = () => {
    switch (field) {
      case 'name': return "What's your full name?";
      case 'phone': return "What's your phone number?";
      case 'email': return "What's your email address?";
      case 'age': return "How old are you?";
      case 'gender': return "What's your gender?";
      case 'visitFrequency': return "How often do you visit a salon?";
      default: return "Let's get started";
    }
  };

  const renderInput = () => {
    switch (field) {
      case 'name':
        return (
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 text-lg border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 text-center bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl font-light text-white placeholder-white/60"
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-center">{errors.name}</p>}
          </div>
        );
      
      case 'phone':
        return (
          <div>
            <p className="text-white/60 text-sm mb-3 text-center">
              Enter your 10-digit mobile number
            </p>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 text-lg border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 text-center bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl font-light text-white placeholder-white/60"
              placeholder="9876543210"
              maxLength={10}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-2 text-center">{errors.phone}</p>}
          </div>
        );
      
      case 'email':
        return (
          <div>
            <p className="text-white/60 text-sm mb-3 text-center">
              Use Gmail, Yahoo, Outlook, or Hotmail
            </p>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 text-lg border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 text-center bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl font-light text-white placeholder-white/60"
              placeholder="yourname@gmail.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-2 text-center">{errors.email}</p>}
          </div>
        );
      
      case 'age':
        return (
          <div>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 text-lg border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 text-center bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl font-light text-white placeholder-white/60"
              placeholder="25"
              min="16"
              max="100"
            />
            {errors.age && <p className="text-red-500 text-sm mt-2 text-center">{errors.age}</p>}
          </div>
        );
      
      case 'gender':
        const genderOptions = [
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
          { value: 'non-binary', label: 'Non-binary' },
          { value: 'prefer-not-to-say', label: 'Prefer not to say' }
        ];
        
        return (
          <div className="space-y-3">
            {genderOptions.map((option) => (
              <div key={option.value} className="relative">
                <input
                  type="radio"
                  id={option.value}
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor={option.value}
                  className={`block w-full p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 text-center font-light shadow-lg hover:shadow-xl backdrop-blur-sm ${
                    formData.gender === option.value
                      ? 'border-rose-400 bg-gradient-to-r from-rose-400/20 to-pink-400/20 text-white shadow-rose-200/50'
                      : 'border-white/30 hover:border-rose-300 hover:bg-white/20 bg-white/10 text-white/90'
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
            {errors.gender && <p className="text-red-500 text-sm mt-2 text-center">{errors.gender}</p>}
          </div>
        );
      
      case 'visitFrequency':
        const frequencyOptions = [
          { value: 'weekly', label: 'Weekly' },
          { value: 'bi-weekly', label: 'Bi-weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'rarely', label: 'Rarely' }
        ];
        
        return (
          <div className="space-y-3">
            {frequencyOptions.map((option) => (
              <div key={option.value} className="relative">
                <input
                  type="radio"
                  id={option.value}
                  name="visitFrequency"
                  value={option.value}
                  checked={formData.visitFrequency === option.value}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor={option.value}
                  className={`block w-full p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 text-center font-light shadow-lg hover:shadow-xl backdrop-blur-sm ${
                    formData.visitFrequency === option.value
                      ? 'border-rose-400 bg-gradient-to-r from-rose-400/20 to-pink-400/20 text-white shadow-rose-200/50'
                      : 'border-white/30 hover:border-rose-300 hover:bg-white/20 bg-white/10 text-white/90'
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
            {errors.visitFrequency && <p className="text-red-500 text-sm mt-2 text-center">{errors.visitFrequency}</p>}
          </div>
        );
      
      default:
        return null;
    }
  };

  const isValid = () => {
    switch (field) {
      case 'name': return !!formData.name;
      case 'phone': return !!formData.phone;
      case 'email': return !!formData.email;
      case 'age': return !!formData.age;
      case 'gender': return !!formData.gender;
      case 'visitFrequency': return !!formData.visitFrequency;
      default: return true;
    }
  };

  return (
    <FormStep
      title={getTitle()}
      onNext={onNext}
      onBack={onBack}
      showBack={field !== 'name'}
      isValid={isValid()}
    >
      {renderInput()}
    </FormStep>
  );
};

export default BasicInfo;