import React from 'react';
import { Star, Heart } from 'lucide-react';

interface FeedbackWelcomePageProps {
  onStart: () => void;
}

const FeedbackWelcomePage: React.FC<FeedbackWelcomePageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 30%, #ff6b6b 70%, #f093fb 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease-in-out infinite alternate'
        }}
      />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-white/20 to-pink-200/20 rounded-full animate-float-slow blur-xl" />
      <div className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-r from-rose-200/20 to-pink-300/20 rounded-full animate-float-medium blur-lg" />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-r from-red-200/20 to-pink-200/20 rounded-full animate-float-fast blur-xl" />
      <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-pink-200/20 to-rose-200/20 rounded-full animate-spin-slow blur-lg" />
      
      {/* Hero Section - 60% of viewport */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full shadow-2xl border border-white/20">
              <div className="relative">
                <Star className="w-16 h-16 text-white" />
                <Heart className="w-8 h-8 text-white absolute -top-2 -right-2" />
              </div>
            </div>
          </div>
          
          {/* Welcome Text */}
          <div className="space-y-6">
            <h1 
              className="text-5xl md:text-6xl font-bold text-white leading-tight animate-fade-in-up"
              style={{ 
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                animationDelay: '0.5s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              How was your{' '}
              <span className="bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                experience?
              </span>
            </h1>
            
            <p 
              className="text-xl md:text-2xl text-white/90 font-light animate-fade-in-up"
              style={{ 
                animationDelay: '1s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              Your feedback helps us serve you better
            </p>
            
            <p 
              className="text-lg text-white/80 font-light max-w-lg mx-auto leading-relaxed animate-fade-in-up"
              style={{ 
                animationDelay: '1.5s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              Share your thoughts about today's treatment and help us continue providing exceptional beauty services.
            </p>
          </div>
        </div>
      </div>
      
      {/* Call-to-Action Button - 20% of viewport */}
      <div className="flex items-center justify-center px-8 relative z-10">
        <button
          onClick={onStart}
          className="group relative px-12 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-full text-white font-semibold text-lg transition-all duration-500 hover:bg-white/20 hover:scale-105 hover:shadow-2xl animate-fade-in-up"
          style={{ 
            animationDelay: '2s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <span className="relative z-10">Share Your Feedback</span>
          <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse opacity-50" />
        </button>
      </div>
      
      {/* Footer Section - 20% of viewport */}
      <div className="flex items-center justify-center px-8 pb-8 relative z-10">
        <p 
          className="text-white/70 text-sm font-light animate-fade-in"
          style={{ 
            animationDelay: '2.5s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          Your feedback is valuable to us • 2-minute survey
        </p>
      </div>
      
      {/* Additional floating elements for depth */}
      <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-white/40 rounded-full animate-ping" />
      <div className="absolute bottom-1/3 right-1/5 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
      <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-white/30 rounded-full animate-bounce" />
    </div>
  );
};

export default FeedbackWelcomePage;