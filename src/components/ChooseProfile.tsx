import { useEffect, useState } from 'react'
import { getFillingQueue, getSessionProfile } from '../services/newConsultationService'
import UpdatedConsultForm from './UpdatedConsultForm'
import { User, Search, Clock, ArrowRight, Phone, Calendar } from 'lucide-react'
import type { MachineScanBands } from '../lib/decisionEngine'

export default function ChooseProfile({ onBack }: { onBack: () => void }) {
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<null | {
    session_id: string
    machine: MachineScanBands
    skin_age?: number
    customer_name?: string
    customer_phone?: string
  }>(null)

  useEffect(() => {
    (async () => {
      try {
        const q = await getFillingQueue()
        setQueue(q)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filteredQueue = queue.filter(item =>
    item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer_phone.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  if (selected) {
    return (
      <UpdatedConsultForm
        onBack={() => setSelected(null)}
        onComplete={() => setSelected(null)}
        machine={selected.machine}
        machineRaw={(queue.find(q => q.session_id === selected.session_id) as any)?.metrics || undefined}
        sessionId={selected.session_id}
        prefill={{
          name: selected.customer_name || '',
          phoneNumber: selected.customer_phone || '',
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-amber-200/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4 shadow-lg">
              <User className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Choose a Profile
            </h1>
            <p className="text-gray-600 text-lg font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Select a customer to continue their consultation
            </p>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-6 py-6 bg-white/30">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-amber-200 rounded-xl focus:ring-3 focus:ring-amber-200 focus:border-amber-400 transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-amber-400 shadow-lg hover:shadow-xl"
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
                <p className="text-amber-600 mt-4 font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Loading profiles...
                </p>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6 shadow-lg">
                  <User className="w-10 h-10 text-amber-400" />
                </div>
                <p className="text-gray-700 text-lg mb-2 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {searchTerm ? 'No profiles found' : 'No profiles in queue'}
                </p>
                <p className="text-amber-500 font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Waiting for new customer profiles'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredQueue.map(item => (
                  <div
                    key={item.session_id}
                    onClick={async () => {
                      const prof = await getSessionProfile(item.session_id)
                      const ma: any = prof.metrics || {}
                      const machine: MachineScanBands = {
                        moisture: ma.moisture_band,
                        sebum: ma.sebum_band,
                        texture: ma.texture_band,
                        pores: ma.pores_band,
                        acne: ma.acne_band,
                        acneDetails: ma.acne_details ?? undefined,
                        // split UV/brown/red:
                        // - Brown maps from brown_areas_band when present, else fall back to pigmentation_uv_band
                        // - Red (PIE) mapped from redness_band when available (documented proxy)
                        pigmentation_brown: ma.brown_areas_band ?? ma.pigmentation_uv_band,
                        pigmentation_red: ma.redness_band ?? undefined,
                        sensitivity: ma.sensitivity_band ?? undefined,
                      }
                      // stash metrics on the item so we can pass to form as machineRaw
                      ;(item as any).metrics = ma
                      setSelected({
                        session_id: item.session_id,
                        machine,
                        skin_age: ma.skin_age,
                        customer_name: prof.customer_name,
                        customer_phone: prof.customer_phone,
                      })
                    }}
                    className="group bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50 cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 hover:scale-[1.02] shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-gray-900 font-semibold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {item.customer_name}
                          </h3>
                          <div className="flex items-center text-amber-600 text-sm font-light mt-1">
                            <Phone className="w-4 h-4 mr-1" />
                            {item.customer_phone}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 font-light">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 font-light">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(item.created_at).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full text-amber-700 text-xs font-medium shadow-sm">
                          In Queue
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 rounded-full text-green-700 text-xs font-medium shadow-sm">
                          Ready for Consultation
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 bg-white/90 backdrop-blur-sm border-t border-amber-200/50 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:from-gray-700 hover:to-gray-800 hover:shadow-lg"
            >
              ← Back to Staff Portal
            </button>
            <p className="text-amber-600 font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Select a profile to begin the consultation process
            </p>
            <div className="w-40"></div> {/* Spacer for centering */}
          </div>
        </footer>
      </div>
    </div>
  )
}
