import React from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #581c87 30%, #7c2d12 70%, #0f172a 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease-in-out infinite alternate'
        }}
      />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-rose-400/20 to-pink-400/20 rounded-full animate-float-slow blur-xl" />
      <div className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full animate-float-medium blur-lg" />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full animate-float-fast blur-xl" />
      <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full animate-spin-slow blur-lg" />
      
      {/* Hero Section - 60% of viewport */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full shadow-2xl border border-white/20">
              <Sparkles className="w-16 h-16 text-white" />
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
              Welcome to{' '}
              <span className="bg-gradient-to-r from-rose-300 to-pink-300 bg-clip-text text-transparent">
                Aetheria Beauty
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
              Your personalized beauty consultation awaits
            </p>
            
            <p 
              className="text-lg text-white/80 font-light max-w-lg mx-auto leading-relaxed animate-fade-in-up"
              style={{ 
                animationDelay: '1.5s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              In just a few minutes, we'll create a customized treatment plan tailored specifically for your skin and hair needs.
            </p>
          </div>
        </div>
      </div>
      
      {/* Call-to-Action Button - 20% of viewport */}
      <div className="flex items-center justify-center px-8 relative z-10">
        <button
          onClick={onStart}
          className="group relative px-12 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-full text-white font-semibold text-lg transition-all duration-500 hover:bg-gradient-to-r hover:from-rose-400/30 hover:to-pink-400/30 hover:scale-105 hover:shadow-2xl animate-fade-in-up"
          style={{ 
            animationDelay: '2s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <span className="relative z-10">Begin Your Beauty Journey</span>
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-pink-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
          Trusted by 1000+ clients • 5-minute consultation
        </p>
      </div>
      
      {/* Additional floating elements for depth */}
      <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-white/40 rounded-full animate-ping" />
      <div className="absolute bottom-1/3 right-1/5 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
      <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-white/30 rounded-full animate-bounce" />
    </div>
  );
};

export default WelcomePage;