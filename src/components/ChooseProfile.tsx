import React, { useEffect, useState } from 'react'
import { getFillingQueue, getSessionProfile } from '../services/newConsultationService'
import UpdatedConsultForm from './UpdatedConsultForm'

type Band = 'green'|'blue'|'yellow'|'red'

type MachineScanBands = {
  moisture?: Band
  sebum?: Band
  texture?: Band
  pores?: Band
  acne?: Band
  pigmentation_brown?: Band
  pigmentation_red?: Band
}

export default function ChooseProfile() {
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

  if (selected) {
    return (
      <UpdatedConsultForm
        onBack={() => setSelected(null)}
        onComplete={() => setSelected(null)}
        machine={selected.machine}
        sessionId={selected.session_id}
        prefill={{
          name: selected.customer_name || '',
          phoneNumber: selected.customer_phone || '',
        }}
      />
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Choose a profile</h2>
      {loading ? <div>Loading…</div> : (
        <ul className="space-y-2">
          {queue.map(item => (
            <li key={item.session_id}>
              <button
                className="w-full text-left p-3 rounded border hover:bg-gray-50"
                onClick={async () => {
                  const prof = await getSessionProfile(item.session_id)
                  const ma: any = prof.metrics || {}
                  const machine: MachineScanBands = {
                    moisture: ma.moisture_band,
                    sebum: ma.sebum_band,
                    texture: ma.texture_band,
                    pores: ma.pores_band,
                    acne: ma.acne_band,
                    // split UV/brown/red: map as you prefer
                    pigmentation_brown: ma.brown_areas_band ?? ma.pigmentation_uv_band,
                    pigmentation_red: 'green', // if PIE separately stored, map here
                  }
                  setSelected({
                    session_id: item.session_id,
                    machine,
                    skin_age: ma.skin_age,
                    customer_name: prof.customer_name,
                    customer_phone: prof.customer_phone,
                  })
                }}
              >
                <div className="font-medium">{item.customer_name} <span className="text-gray-500">{item.customer_phone}</span></div>
                <div className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

