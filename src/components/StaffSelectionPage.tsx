import React from 'react';
import { Star, Sparkles, Clipboard, FileEdit } from 'lucide-react';

interface StaffSelectionPageProps {
  onSelectFeedback: () => void;
  onSelectConsultantInput: () => void;
  onSelectUpdatedConsult: () => void;
}

const StaffSelectionPage: React.FC<StaffSelectionPageProps> = ({
  onSelectFeedback,
  onSelectConsultantInput,
  onSelectUpdatedConsult
}) => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === '1') {
      onSelectFeedback();
    } else if (event.key === '2') {
      onSelectConsultantInput();
    } else if (event.key === '3') {
      onSelectUpdatedConsult();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #581c87 30%, #7c2d12 70%, #0f172a 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 4s ease-in-out infinite alternate'
        }}
      />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-rose-400/15 to-pink-400/15 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/15 to-violet-400/15 rounded-full blur-xl animate-float-medium"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-amber-400/15 to-orange-400/15 rounded-full blur-xl animate-float-fast"></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-xl animate-spin-slow"></div>

      {/* Header Section */}
      <div className="relative z-10 text-center py-8 px-8">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1
          className="text-4xl md:text-5xl font-bold text-white leading-tight animate-fade-in-up mb-2"
          style={{
            fontFamily: "'Poppins', sans-serif",
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animationDelay: '0.1s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <span className="bg-gradient-to-r from-rose-300 to-pink-300 bg-clip-text text-transparent">
            Aetheria Beauty
          </span>
        </h1>

        <p
          className="text-xl text-white/80 font-light animate-fade-in-up"
          style={{
            fontFamily: "'Poppins', sans-serif",
            animationDelay: '0.2s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          Select an option to continue
        </p>
      </div>

      {/* Main Selection Area */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12">

            {/* Card 1 - Feedback Collection */}
            <div
              onClick={onSelectFeedback}
              className="staff-card group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                animationDelay: '0.3s',
                opacity: 0,
                animationFillMode: 'forwards',
                minHeight: '200px'
              }}
            >
              <div className="flex flex-col items-center text-center h-full justify-center space-y-4">
                <div className="relative">
                  <Star
                    className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
                  />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Client Feedback
                  </h3>
                  <p className="text-white/90 text-lg font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Collect client feedback after service
                  </p>
                </div>

                <div className="text-white/70 text-sm font-medium">
                  Press <kbd className="px-2 py-1 bg-white/20 rounded text-white">1</kbd>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Card 2 - Consultant Input */}
            <div
              onClick={onSelectConsultantInput}
              className="staff-card group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                animationDelay: '0.4s',
                opacity: 0,
                animationFillMode: 'forwards',
                minHeight: '200px'
              }}
            >
              <div className="flex flex-col items-center text-center h-full justify-center space-y-4">
                <div className="relative">
                  <Clipboard
                    className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
                  />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Consultant Input
                  </h3>
                  <p className="text-white/90 text-lg font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Add professional analysis
                  </p>
                </div>

                <div className="text-white/70 text-sm font-medium">
                  Press <kbd className="px-2 py-1 bg-white/20 rounded text-white">2</kbd>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Card 3 - Updated Client Consult */}
            <div
              onClick={onSelectUpdatedConsult}
              className="staff-card group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                animationDelay: '0.5s',
                opacity: 0,
                animationFillMode: 'forwards',
                minHeight: '200px'
              }}
            >
              <div className="flex flex-col items-center text-center h-full justify-center space-y-4">
                <div className="relative">
                  <FileEdit
                    className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
                  />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Updated Client Consult
                  </h3>
                  <p className="text-white/90 text-lg font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Follow-up consultation form
                  </p>
                </div>

                <div className="text-white/70 text-sm font-medium">
                  Press <kbd className="px-2 py-1 bg-white/20 rounded text-white">3</kbd>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="relative z-10 text-center py-6 px-8">
        <div
          className="animate-fade-in"
          style={{
            animationDelay: '0.7s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <p className="text-white/70 text-sm font-light mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Professional beauty consultation system
          </p>
          <p className="text-white/60 text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Use keyboard shortcuts or click to navigate · Press ESC to return
          </p>
        </div>
      </div>

      {/* Additional floating elements for depth */}
      <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/5 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
      <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-white/30 rounded-full animate-bounce"></div>
    </div>
  );
};

export default StaffSelectionPage;
