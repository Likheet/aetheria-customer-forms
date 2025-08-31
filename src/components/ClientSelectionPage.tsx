import React, { useState, useEffect } from 'react';
import { User, Search, Clock, ArrowRight } from 'lucide-react';
import { getRecentConsultationSessions } from '../services/newConsultationService';

// Updated interface for new consultation structure
interface ConsultationSession {
  session_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  location?: string;
  answers?: any;
}

interface ClientSelectionPageProps {
  onSelectClient: (consultation: ConsultationSession) => void;
  onBack: () => void;
}

const ClientSelectionPage: React.FC<ClientSelectionPageProps> = ({ onSelectClient, onBack }) => {
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRecentConsultationSessions();
      if (result.success && result.data) {
        // Sort by most recent first
        const sortedData = result.data.sort((a: ConsultationSession, b: ConsultationSession) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        setConsultations(sortedData);
      } else {
        setError(result.error || 'Failed to load consultations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(consultation =>
    consultation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.customer_phone.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
              <User className="w-6 h-6 text-slate-600" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Select Client
            </h1>
            <p className="text-slate-600 text-lg font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Choose a client to collect feedback for
            </p>
          </div>
        </header>
        
        {/* Search Bar */}
        <div className="px-6 py-6 bg-white/30">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-200 rounded-xl focus:ring-3 focus:ring-slate-200 focus:border-slate-400 transition-all duration-200 bg-white/90 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-lg hover:shadow-xl"
            />
          </div>
        </div>
        
        {/* Content */}
        <main className="flex-1 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400"></div>
                <p className="text-slate-600 mt-4 font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Loading consultations...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50/80 backdrop-blur-sm rounded-xl p-6 border border-red-200 max-w-md mx-auto shadow-lg">
                  <p className="text-red-800 font-medium mb-2">Error Loading Data</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={loadConsultations}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-700 text-lg mb-2 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {searchTerm ? 'No clients found' : 'No consultations available'}
                </p>
                <p className="text-slate-500 font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Complete a consultation first to collect feedback'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredConsultations.map((consultation) => (
                  <div
                    key={consultation.session_id}
                    onClick={() => onSelectClient(consultation)}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 font-semibold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {consultation.customer_name}
                          </h3>
                          <p className="text-slate-600 text-sm font-light">{consultation.customer_phone}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-slate-600 font-light">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatDate(consultation.created_at || '')}</span>
                      </div>
                      <div className="text-slate-600 font-light">
                        <span className="font-medium">Phone:</span> {consultation.customer_phone}
                      </div>
                      {consultation.location && (
                        <div className="text-slate-600 font-light">
                          <span className="font-medium">Location:</span> {consultation.location}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full text-slate-700 text-xs font-medium shadow-sm">
                          Recent Consultation
                        </span>
                        {consultation.answers && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 rounded-full text-green-700 text-xs font-medium shadow-sm">
                            Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        
        {/* Back Button */}
        <footer className="px-6 py-4 bg-white/80 backdrop-blur-sm border-t border-slate-200/50 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              ← Back to Staff Portal
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ClientSelectionPage;