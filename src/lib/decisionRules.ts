// Decision Rules Spec derived from the spreadsheet
// This file enumerates categories, machine vs customer conditions,
// precise follow-up question prompts/options, and intended outcomes/flags.
// It is a static specification (no runtime logic) to keep things source-of-truth.

export type Band = 'green' | 'blue' | 'yellow' | 'red'

export type Category =
  | 'Moisture'
  | 'Grease'      // a.k.a. Sebum/Oil
  | 'Acne'
  | 'Pores'
  | 'Texture'
  | 'Pigmentation'
  | 'Sensitivity'

export interface QuestionSpec {
  id: string
  prompt: string
  options: string[]
  multi?: boolean
}

export interface OutcomeSpec {
  // Human‑readable condition (kept textual on purpose for traceability)
  when: string
  updates?: string[] // e.g., ["Moisture: Yellow", "Grease: Red"]
  flags?: string[]   // e.g., ["acne-category:Comedonal", "refer-derm"]
  verdict?: string   // short description
}
export interface DecisionRuleSpec {
  id: string
  category: Category
  machineInput: Band[] // match bands on machine for this rule
  customerInput: Band[] // match bands on customer/self-report for this rule
  dimension?: 'brown' | 'red' // optional sub-dimension (pigmentation split)
  questions?: QuestionSpec[]
  outcomes?: OutcomeSpec[]
  notes?: string
}

export const RULE_SPECS: DecisionRuleSpec[] = [
  // Moisture
  {
    id: 'moisture_machineLow_customerNormal',
    category: 'Moisture',
    machineInput: ['red', 'yellow'],
    customerInput: ['green', 'blue'],
    outcomes: [
      { when: '—', updates: ['Moisture: Blue'], verdict: 'Machine dry vs user normal → treat as Normal hydration.' }
    ],
  },
  {
    id: 'moisture_machineNormal_customerDry',
    category: 'Moisture',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    questions: [
      { id: 'Q2', prompt: 'Does skin feel tight all day even after moisturizer?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Do you have visible flaking/rough patches?', options: ['Yes', 'No'] },
      {
        id: 'Q4',
        prompt: 'Current actives/meds in last 4 weeks?',
        options: ['Retinoids', 'BPO', 'AHA/BHA', 'Adapalene', 'Isotretinoin', 'None'],
        multi: true,
      },
    ],
    outcomes: [
      { when: 'Q2=Yes AND Q3=Yes', updates: ['Moisture: Red'], verdict: 'TRUE DRY / COMPROMISED BARRIER (override machine; barrier repair focus).' },
      { when: 'Q2=Yes OR Q3=Yes OR Q4 includes Retinoids/Isotretinoin/Adapalene', updates: ['Moisture: Yellow'], verdict: 'TRUE DRY / COMPROMISED BARRIER (override machine; barrier repair focus).' },
      { when: 'Q2=No AND Q3=No AND Q4 excludes Retinoids/Isotretinoin', updates: ['Moisture: Blue'], verdict: 'NORMAL HYDRATION (trust machine).' },
    ],
  },

  // Sebum / Grease
  {
    id: 'sebum_machineNormal_customerOily',
    category: 'Grease',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    questions: [
      { id: 'Q1', prompt: 'How often do you blot/wash face due to oil?', options: ['Never', '1-2x/day', '>=3x/day'] },
      { id: 'Q2', prompt: 'Is shine localized to T-zone?', options: ['T-zone', 'All over', 'No shine'] },
      { id: 'Q3', prompt: 'Used mattifying products, clay masks or oil-absorbing sheets within last 24h?', options: ['Yes', 'No'] },
      { id: 'Q5', prompt: 'Any mattifying primer/powder used in last 8h?', options: ['Yes', 'No'] },
    ],
    outcomes: [
      { when: 'Q1=>=3x/day AND Q2=All over', updates: ['Sebum: Red'], verdict: 'TRUE OILY (override machine reading).' },
      { when: 'Q2=T-zone AND Q1=1-2x/day', updates: ['Sebum: Yellow'], verdict: 'COMBINATION (T-zone oil).', flags: ['combination-skin'] },
      { when: 'Q1=>=3x/day OR Q2=All over', updates: ['Sebum: Yellow'], verdict: 'OILY TENDENCY (treat as oily despite normal machine).' },
      { when: 'Q3=Yes OR Q5=Yes', updates: ['Sebum: Blue'], verdict: 'PRODUCT FILM AFFECTED; reset routine then reassess.', flags: ['product-film'] },
      { when: '-', updates: ['Sebum: Blue'], verdict: 'Normal oil levels per machine; customer perception likely transient.' },
    ],
  },
  {
    id: 'sebum_machineOily_customerNormal',
    category: 'Grease',
    machineInput: ['yellow', 'red'],
    customerInput: ['green', 'blue'],
    questions: [
      { id: 'Q1', prompt: 'Do you see visible shine within 2-4h after cleansing?', options: ['Yes', 'No'] },
      { id: 'Q2', prompt: 'Do you get frequent blackheads/whiteheads?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Using heavy creams/oils/sunscreens?', options: ['Yes', 'No'] },
    ],
    outcomes: [
      { when: 'Q1=Yes AND Q2=Yes AND Q3=No', updates: ['Sebum: Red'], verdict: 'CONFIRMED OILY SKIN - machine under-reporting.' },
      { when: '(Q1=Yes OR Q2=Yes) AND Q3=Yes', updates: ['Sebum: Yellow'], verdict: 'OILINESS + RICH PRODUCTS (optimize textures).' },
      { when: '(Q1=Yes XOR Q2=Yes) AND Q3=No', updates: ['Sebum: Yellow'], verdict: 'OILINESS PRESENT - monitor closely.' },
      { when: 'Q1=No AND Q2=No AND Q3=Yes', updates: ['Sebum: Blue'], verdict: 'PRODUCT-INDUCED SHINE.' },
      { when: 'Q1=No AND Q2=No AND Q3=No', updates: ['Sebum: Green'], verdict: 'NORMAL (possible lighting artifact).' },
    ],
  },

  // Acne – Presence
  {
    id: 'acne_machinePresence_customerNone',
    category: 'Acne',
    machineInput: ['yellow', 'red'],
    customerInput: ['green', 'blue'],
    questions: [
      { id: 'Q1', prompt: 'Any new bumps in last 2 weeks?', options: ['None', '1-2', 'Several'] },
      { id: 'Q2', prompt: 'Any red/brown spots without a raised bump?', options: ['Yes', 'No'] },
      { id: 'Q2a', prompt: 'If yes, are the spots red or brown?', options: ['Red', 'Brown'] },
      { id: 'Q3', prompt: 'Do you get monthly breakouts around periods/jawline?', options: ['Yes', 'No', 'NA'] },
      { id: 'Q4', prompt: 'Do you frequently notice tiny bumps, blackheads, or whiteheads?', options: ['Yes', 'No'] },
      { id: 'Q5', prompt: 'Do you have any inflamed pimples now?', options: ['None', '1-5', '6-15', '>15'] },
    ],
    outcomes: [
      { when: 'Q2=Yes AND Q2a=Red AND Q5 in {>15}', updates: ['Acne: Red', 'Pigmentation (Red): Yellow'], verdict: 'POST-ACNE MARKS WITH SEVERE INFLAMMATION - refer dermatologist.', flags: ['acne-category:Inflammatory', 'refer-derm'] },
      { when: 'Q2=Yes AND Q2a=Brown AND Q5 in {>15}', updates: ['Acne: Red', 'Pigmentation (Brown): Yellow'], verdict: 'POST-ACNE MARKS WITH SEVERE INFLAMMATION - refer dermatologist.', flags: ['acne-category:Inflammatory', 'refer-derm'] },
      { when: 'Q2=Yes AND Q5 in {>15}', updates: ['Acne: Red'], verdict: 'POST-ACNE MARKS WITH SEVERE INFLAMMATION - refer dermatologist.', flags: ['acne-category:Inflammatory', 'refer-derm'] },
      { when: 'Q2=Yes AND Q2a=Red AND Q5=6-15', updates: ['Acne: Red', 'Pigmentation (Red): Yellow'], verdict: 'POST-ACNE MARKS + ACTIVE INFLAMMATORY ACNE.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q2=Yes AND Q2a=Brown AND Q5=6-15', updates: ['Acne: Red', 'Pigmentation (Brown): Yellow'], verdict: 'POST-ACNE MARKS + ACTIVE INFLAMMATORY ACNE.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q2=Yes AND Q5=6-15', updates: ['Acne: Red'], verdict: 'POST-ACNE MARKS + ACTIVE INFLAMMATORY ACNE.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q2=Yes AND Q2a=Red AND Q5=1-5', updates: ['Acne: Yellow', 'Pigmentation (Red): Yellow'], verdict: 'POST-ACNE MARKS + MILD INFLAMMATION.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q2=Yes AND Q2a=Brown AND Q5=1-5', updates: ['Acne: Yellow', 'Pigmentation (Brown): Yellow'], verdict: 'POST-ACNE MARKS + MILD INFLAMMATION.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q2=Yes AND Q5=1-5', updates: ['Acne: Yellow'], verdict: 'POST-ACNE MARKS + MILD INFLAMMATION.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q2=Yes AND Q2a=Red AND Q1 in {None,1-2} AND Q5=None', updates: ['Acne: Green', 'Pigmentation (Red): Yellow'], verdict: 'POST-ACNE PIGMENTATION ONLY - route to pigmentation follow-ups.', flags: ['shift-focus-to-PIH/PIE', 'pigmentation:red'] },
      { when: 'Q2=Yes AND Q2a=Brown AND Q1 in {None,1-2} AND Q5=None', updates: ['Acne: Green', 'Pigmentation (Brown): Yellow'], verdict: 'POST-ACNE PIGMENTATION ONLY - route to pigmentation follow-ups.', flags: ['shift-focus-to-PIH/PIE', 'pigmentation:brown'] },
      { when: 'Q2=Yes AND Q1 in {None,1-2} AND Q5=None', updates: ['Acne: Green'], verdict: 'POST-ACNE PIGMENTATION ONLY - route to pigmentation follow-ups.', flags: ['shift-focus-to-PIH/PIE'] },
      { when: 'Q5 in {>15}', updates: ['Acne: Red'], verdict: 'SEVERE INFLAMMATORY ACNE - escalate care.', flags: ['acne-category:Inflammatory', 'refer-derm'] },
      { when: 'Q5=6-15', updates: ['Acne: Red'], verdict: 'ACTIVE INFLAMMATORY ACNE (unreported by customer).', flags: ['acne-category:Inflammatory'] },
      { when: 'Q5=1-5', updates: ['Acne: Yellow'], verdict: 'MILD INFLAMMATORY ACNE PRESENT.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q1=Several', updates: ['Acne: Yellow'], verdict: 'VISIBLE ACTIVE ACNE - machine reading trusted.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q4=Yes', updates: ['Acne: Yellow'], verdict: 'ACTIVE COMEDONAL ACNE - educate on congestion care.', flags: ['acne-category:Comedonal'] },
  { when: 'Q5=None AND Q3=Yes', updates: ['Acne: Blue'], verdict: 'HORMONAL FLARES PRESENT - monitor pattern and balance routine.', flags: ['acne-category:Hormonal'] },
      { when: 'Q5=None AND Q1=1-2', updates: ['Acne: Blue'], verdict: 'MILD/FLUCTUATING ACNE - monitor.', flags: ['acne-category:Inflammatory'] },
      { when: '-', updates: ['Acne: Green'], verdict: 'FALSE POSITIVE - appear clear upon follow-up.' },
    ],
  },
  {
    id: 'acne_machineClear_customerPresence',
    category: 'Acne',
    machineInput: ['green', 'blue'],
    customerInput: ['yellow', 'red'],
    questions: [
      { id: 'Q1', prompt: 'How many inflamed (red, swollen, painful) pimples do you currently see?', options: ['None', '1-5', '6-15', '>15'] },
      { id: 'Q2', prompt: 'Do you get deep, painful lumps or nodules under the skin?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Do you have visible blackheads/whiteheads alongside these breakouts?', options: ['None', '<10', '10-20', '>20'] },
      { id: 'Q4', prompt: 'Do your breakouts flare with specific triggers (mask/sweat/stress/products)?', options: ['Yes', 'No'] },
      { id: 'Q5', prompt: 'Are you currently pregnant or breastfeeding?', options: ['Yes', 'No', 'NA'] },
    ],
    outcomes: [
      { when: 'Q5=Yes AND (Q2=Yes OR Q1 in {>15,>=15})', updates: ['Acne: Red'], verdict: 'Deep, painful lesions with pregnancy — escalate carefully and refer.', flags: ['acne-category:Nodulocystic', 'refer-derm', 'pregnancy-filter'] },
      { when: 'Q2=Yes OR Q1 in {>15,>=15}', updates: ['Acne: Red'], verdict: 'Deep, painful lesions — dermatologist referral required.', flags: ['acne-category:Nodulocystic', 'refer-derm'] },
      { when: 'Q5=Yes AND Q1=6-15', updates: ['Acne: Blue'], verdict: 'Moderate inflammatory acne with pregnancy — use gentle, safe routine.', flags: ['acne-category:Inflammatory', 'pregnancy-filter'] },
      { when: 'Q1=6-15', updates: ['Acne: Red'], verdict: 'Moderate inflammatory acne confirmed.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q5=Yes AND Q3 in {>=20,>20}', updates: ['Acne: Blue'], verdict: 'Severe congestion during pregnancy — restrict to safe exfoliation.', flags: ['acne-category:Comedonal', 'pregnancy-filter'] },
      { when: 'Q3 in {>=20,>20}', updates: ['Acne: Red'], verdict: 'Severe comedonal congestion detected.', flags: ['acne-category:Comedonal'] },
      { when: 'Q5=Yes AND Q3=10-20', updates: ['Acne: Blue'], verdict: 'Moderate congestion during pregnancy — gentle decongestion plan.', flags: ['acne-category:Comedonal', 'pregnancy-filter'] },
      { when: 'Q3=10-20', updates: ['Acne: Yellow'], verdict: 'Comedonal congestion present — treat with exfoliation.', flags: ['acne-category:Comedonal'] },
      { when: 'Q5=Yes AND Q4=Yes AND Q1 in {None,1-5} AND Q3 in {None,<10}', updates: ['Acne: Blue'], verdict: 'Situational flare with pregnancy — coach on trigger control + safe care.', flags: ['acne-category:Situational acne', 'pregnancy-filter'] },
      { when: 'Q4=Yes AND Q1 in {None,1-5} AND Q3 in {None,<10}', updates: ['Acne: Blue'], verdict: 'Situational flare — manage triggers first.', flags: ['acne-category:Situational acne'] },
      { when: 'Q5=Yes AND Q1=1-5', updates: ['Acne: Blue'], verdict: 'Mild inflammatory acne during pregnancy — keep routine gentle.', flags: ['acne-category:Inflammatory', 'pregnancy-filter'] },
      { when: 'Q1=1-5', updates: ['Acne: Yellow'], verdict: 'Mild inflammatory acne present.', flags: ['acne-category:Inflammatory'] },
      { when: 'Q5=Yes AND Q3 in {None,<10}', updates: ['Acne: Blue'], verdict: 'Light congestion with pregnancy — maintain gentle maintenance routine.', flags: ['acne-category:Comedonal', 'pregnancy-filter'] },
      { when: 'Q3 in {None,<10}', updates: ['Acne: Blue'], verdict: 'Light congestion detected — maintain gentle maintenance routine.', flags: ['acne-category:Comedonal'] },
      { when: 'Q5=Yes', updates: ['Acne: Blue'], verdict: 'Pregnancy safety filter engaged.', flags: ['pregnancy-filter'] },
      { when: '-', updates: ['Acne: Green'], verdict: 'Clear skin on follow-up — reassure and monitor.' },
    ],
  },

  // Sensitivity (placeholder per sheet)
  {
    id: 'sensitivity_placeholder',
    category: 'Sensitivity',
    machineInput: ['green', 'blue', 'yellow', 'red'],
    customerInput: ['green', 'blue', 'yellow', 'red'],
    notes: 'Refer to sensitivity questions and index.',
  },

  // Pores
  {
    id: 'pores_machineHigh_customerNormal',
    category: 'Pores',
    machineInput: ['red', 'yellow'],
    customerInput: ['green', 'blue'],
    questions: [
      { id: 'Q1', prompt: 'Are pores visible at arm\'s length in a mirror?', options: ['Yes', 'No'] },
      { id: 'Q2', prompt: 'Do you get frequent blackheads on nose/cheeks?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Oiliness level self-report', options: ['Low', 'Normal', 'High'] },
    ],
    outcomes: [
      { when: 'Q1=No AND Q2=Yes', updates: ['Pores: Blue'], verdict: 'Hidden congestion - route to comedonal follow-up.', flags: ['followup:acne-comedonal'] },
      { when: 'Q1=Yes AND Q3=High', updates: ['Pores: Yellow'], verdict: 'ENLARGED/CLOGGED - machine reading trusted.' },
      { when: 'Q1=Yes OR Q3=High', updates: ['Pores: Blue'], verdict: 'VISIBLE/SHINY - mild pore support recommended.' },
      { when: 'Q1=No AND Q2=No AND Q3 in {Low,Normal}', updates: ['Pores: Green'], verdict: 'COSMETIC ONLY - reassure customer.' },
    ],
  },
  {
    id: 'pores_machineNormal_customerConcerned',
    category: 'Pores',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    questions: [
      { id: 'Q1', prompt: 'Is visibility limited to close-up only under harsh light?', options: ['Yes', 'No'] },
      { id: 'Q2', prompt: 'Do you regularly wear heavy makeup/sunscreen and skip double-cleanse?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Blackheads present on nose/chin?', options: ['Yes', 'No'] },
    ],
    outcomes: [
      { when: 'Q1=No AND Q2=Yes', updates: ['Pores: Red'], verdict: 'PORE CONCERNS VALIDATED - intensify cleansing.' },
      { when: 'Q1=No AND Q2=No AND Q3=Yes', updates: ['Pores: Yellow'], verdict: 'BLACKHEAD-LED CONCERN - route to comedonal follow-up.', flags: ['followup:acne-comedonal'] },
      { when: 'Q1=No AND Q2=No', updates: ['Pores: Green'], verdict: 'PORES MINIMAL - set expectations.' },
      { when: 'Q1=Yes AND Q2=No AND Q3=Yes', updates: ['Pores: Yellow'], verdict: 'BLACKHEADS PRESENT - maintain pore care.' },
      { when: 'Q1=Yes AND Q2=No AND Q3=No', updates: ['Pores: Blue'], verdict: 'VISIBLE ONLY UNDER HARSH LIGHT - gentle maintenance.' },
      { when: 'Q1=No OR Q2=Yes', updates: ['Pores: Yellow'], verdict: 'PORE MANAGEMENT ADVISED.' },
    ],
  },

  // Texture
  {
    id: 'texture_machineSmooth_customerAging',
    category: 'Texture',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    outcomes: [
      { when: 'age > 35', updates: ['Texture: Yellow'], verdict: 'Age-related texture concerns - introduce anti-aging routine.' },
      { when: '-', updates: ['Texture: Blue'], verdict: 'No age-based escalation needed; focus on brightening/polish.' },
    ],
  },
  {
    id: 'texture_machineSmooth_customerBumpy',
    category: 'Texture',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    questions: [
      { id: 'Q1', prompt: 'When you say "bumpy," do you mean:', options: ['Pimples / breakouts', 'Tiny uneven dots (not pimples)', 'Just feels uneven to touch'] },
      { id: 'Q2', prompt: 'Where do you notice this most?', options: ['Forehead', 'Chin', 'Cheeks', 'All over'] },
      { id: 'Q3', prompt: 'Do you have dandruff or an oily scalp?', options: ['Yes', 'No'] },
    ],
    outcomes: [
      { when: 'Q1=Pimples / breakouts', updates: [], verdict: 'Route to ACNE questions.', flags: ['route:acne'] },
      { when: 'Q1=Tiny uneven dots (not pimples) AND Q2=Forehead AND Q3=Yes', updates: ['Texture: Blue'], verdict: 'Possible scalp-triggered congestion - check scalp health.', flags: ['suggest:scalp-analysis'] },
      { when: 'Q1=Tiny uneven dots (not pimples) AND Q2=Forehead AND Q3=No', updates: ['Texture: Blue'], verdict: 'Localized uneven texture - gentle polish recommended.' },
      { when: 'Q1=Tiny uneven dots (not pimples) AND Q2 in {Chin, Cheeks, All over}', updates: ['Pores: Yellow'], verdict: 'Comedonal acne - treat congestion.' },
      { when: 'Q1=Just feels uneven to touch AND Q2=Forehead', updates: ['Texture: Blue'], verdict: 'Check for dandruff or scalp issues.', flags: ['suggest:scalp-analysis'] },
      { when: 'Q1=Just feels uneven to touch AND Q2 in {Chin, Cheeks, All over}', updates: ['Texture: Yellow'], verdict: 'Bumpy skin texture - smoothing routine recommended.' },
    ],
  },
  {
    id: 'texture_machineBumpy_customerSmooth',
    category: 'Texture',
    machineInput: ['red', 'yellow'],
    customerInput: ['green', 'blue'],
    questions: [
      { id: 'Q1', prompt: 'Do you notice any unevenness in texture in particular areas (tiny bumps)?', options: ['Cheeks', 'Chin', 'Forehead', 'Other', 'No'] },
      { id: 'Q2', prompt: "Do you have any old acne scars or marks that haven't faded yet?", options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Is your age above 40?', options: ['Yes', 'No'] },
      { id: 'Q4', prompt: 'Do you have dandruff or an oily scalp?', options: ['Yes', 'No'] },
    ],
    outcomes: [
      { when: 'Q1=Forehead AND Q4=Yes', updates: ['Texture: Blue'], verdict: 'Scalp link suspected - recommend scalp analysis.', flags: ['suggest:scalp-analysis'] },
      { when: 'Q1 in {Chin, Cheeks, Other}', updates: ['Pores: Yellow'], verdict: 'Oil-related bumps (comedonal)' },
      { when: 'Q2=Yes', updates: ['Texture: Blue'], verdict: 'Acne scars present - branch to scar type.', flags: ['followup:scar-type'] },
      { when: 'Q1=No AND Q2=No AND Q3=Yes', updates: ['Texture: Yellow'], verdict: 'Age-related texture - introduce anti-aging routine.' },
      { when: '-', updates: ['Texture: Green'], verdict: 'No textural action needed - monitor.' },
    ],
  },

  // Pigmentation
  {
    id: 'pigmentation_machineHigh_customerNormal_brown',
    category: 'Pigmentation',
    machineInput: ['red', 'yellow'],
    customerInput: ['green', 'blue'],
    dimension: 'brown',
    outcomes: [
      { when: '—', updates: ['Pigmentation (Brown): Yellow'] },
    ],
  },
  {
    id: 'pigmentation_machineNormal_customerHigh_brown',
    category: 'Pigmentation',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    dimension: 'brown',
    outcomes: [
      { when: '—', updates: ['Pigmentation (Brown): Yellow'] },
    ],
  },
  {
    id: 'pigmentation_machineNormal_customerHigh_red',
    category: 'Pigmentation',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    dimension: 'red',
    outcomes: [
      { when: '—', updates: ['Pigmentation (Red): Yellow'] },
    ],
  },
]

