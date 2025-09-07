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
      { when: 'Q2=Yes OR Q3=Yes OR Q4 includes Retinoids/Isotretinoin', updates: ['Moisture: Yellow'], verdict: 'TRUE DRY / COMPROMISED BARRIER (override machine; barrier repair focus).' },
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
      { when: 'Q1=>=3x/day AND Q2=All over AND (Q3=Yes OR Q5=Yes)', updates: ['Sebum: Red'], verdict: 'PRODUCT FILM AFFECTED; still treat as Oily only if frequent/all-over shine.' },
      { when: '(Q1=>=3x/day OR Q2=All over) AND (Q3=Yes OR Q5=Yes)', updates: ['Sebum: Yellow'], verdict: 'PRODUCT FILM AFFECTED; still treat as Oily only if frequent/all-over shine.' },
      { when: 'Q1=>=3x/day AND Q2=All over', updates: ['Sebum: Red'] },
      { when: 'Q1=>=3x/day OR Q2=All over', updates: ['Sebum: Yellow'] },
      { when: 'Q2=T-zone AND Q1=1-2x/day', updates: ['Sebum: Yellow'], verdict: 'COMBINATION.' },
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
      { when: '(Q1=Yes OR Q2=Yes) AND Q3=No', updates: ['Sebum: Red'] },
      { when: '(Q1=Yes OR Q2=Yes) AND Q3=Yes', updates: ['Sebum: Yellow'] },
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
      { id: 'Q1', prompt: 'Any new bumps in last 2 weeks?', options: ['None', '1–2', 'Several'] },
      { id: 'Q2', prompt: 'Are there red/brown spots without raised bump?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Do you get monthly breakouts around periods/jawline?', options: ['Yes', 'No', 'NA'] },
      { id: 'Q4', prompt: 'Do you frequently notice tiny bumps, blackheads, or whiteheads?', options: ['Yes', 'No'] },
    ],
    outcomes: [
      { when: 'Q1=1–2 OR Q3=Yes', updates: ['Acne: Blue'], verdict: 'ACNE – MILD (trust machine).', flags: ['acne-category:Hormonal (if Q3=Yes)'] },
      { when: 'Q2=Yes AND Q1 in {None,1–2}', updates: ['Acne: Green'], verdict: 'Post‑acne marks only; shift to pigmentation follow‑ups.' },
      { when: 'Q1=Several OR Q4=Yes', updates: ['Acne: Yellow'], flags: ['acne-category:Comedonal (if Q4=Yes)'] },
    ],
  },
  {
    id: 'acne_machineClear_customerPresence',
    category: 'Acne',
    machineInput: ['green', 'blue'],
    customerInput: ['yellow', 'red'],
    questions: [
      { id: 'Q1', prompt: 'How many inflamed (red, swollen, painful) pimples do you currently see?', options: ['None', '1-5', '6-15', '>=15'] },
      { id: 'Q2', prompt: 'Do you get deep, painful lumps or nodules under the skin?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Do you have visible blackheads/whiteheads (clogged pores, small bumps)?', options: ['None', '<10', '10-20', '>=20'] },
      { id: 'Q4', prompt: 'Do your breakouts usually flare with specific triggers (mask/sweat, periods, stress, products, etc.)?', options: ['Yes', 'No'] },
      { id: 'Q5', prompt: 'Are you currently pregnant or breastfeeding?', options: ['Yes', 'No', 'NA (male)'] },
    ],
    outcomes: [
      { when: 'Q2=Yes OR Q1=>=15', updates: ['Acne: Red'], flags: ['acne-category:Nodulocystic OR refer-derm'] },
      { when: 'Q1=6-15 AND Q2=No', updates: ['Acne: Yellow'], flags: ['acne-category:Mild inflammatory'] },
      { when: 'Q1=1-5 AND Q3=<10', updates: ['Acne: Blue'] },
      { when: 'Q1>=15 AND Q2=No', updates: ['Acne: Red'], flags: ['acne-category:Moderate inflammatory (pustular/papular after follow-up)'] },
      { when: 'Q1<5 AND Q3=>10', updates: ['Acne: Yellow'], flags: ['acne-category:Comedonal acne'] },
      { when: 'Q1<5 AND Q3<10 AND Q4=Yes', updates: ['Acne: Blue'], flags: ['acne-category:Situational acne'] },
      { when: 'Q5=Yes', updates: [], flags: ['pregnancy-filter'], verdict: 'ACNE WITH PREGNANCY SAFETY FILTER (restrict high-risk actives).' },
      { when: 'Q1=None AND Q3=<10 AND Q4=No', updates: ['Acne: Green'], verdict: 'CLEAR SKIN (machine false positive likely).' },
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
      { id: 'Q3', prompt: 'Oiliness level self‑report', options: ['Low', 'Normal', 'High'] },
    ],
    outcomes: [
      { when: 'Q1=Yes AND Q2=Yes AND Q3=High', updates: ['Pores: Yellow'] },
      { when: 'Q1=Yes OR Q2=Yes OR Q3=High', updates: ['Pores: Blue'] },
      { when: 'Q1=No AND Q2=No AND Q3 in {Low,Normal}', updates: ['Pores: Green'] },
    ],
  },
  {
    id: 'pores_machineNormal_customerConcerned',
    category: 'Pores',
    machineInput: ['green', 'blue'],
    customerInput: ['red', 'yellow'],
    questions: [
      { id: 'Q1', prompt: 'Is visibility limited to close‑up only under harsh light?', options: ['Yes', 'No'] },
      { id: 'Q2', prompt: 'Do you regularly wear heavy makeup/sunscreen and skip double‑cleanse?', options: ['Yes', 'No'] },
      { id: 'Q3', prompt: 'Blackheads present on nose/chin?', options: ['Yes', 'No'] },
    ],
    outcomes: [
      { when: 'Q2=Yes OR Q3=Yes', updates: ['Pores: Yellow'] },
      { when: 'Q1=Yes AND Q2=No AND Q3=No', updates: ['Pores: Green'] },
    ],
  },

  // Texture
  
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
      { when: 'Q1=Tiny uneven dots (not pimples) AND Q2=Forehead AND Q3=Yes', updates: [], verdict: 'Recommend scalp analysis.', flags: ['suggest:scalp-analysis'] },
      { when: 'Q1=Tiny uneven dots (not pimples) AND Q2 in {Chin, Cheeks, All over}', updates: ['Pores: Yellow'], verdict: 'Clogged pores' },
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
      { when: 'Q1 in {Chin, Cheeks, Other}', updates: ['Pores: Yellow'], verdict: 'Clogged pores' },
      { when: 'Q1=Forehead AND Q4=Yes', updates: [], verdict: 'Recommend scalp analysis.', flags: ['suggest:scalp-analysis'] },
      { when: 'Q2=Yes', updates: [], verdict: 'Acne scars present - branch to scar type.' },
      { when: 'Q1=No AND Q2=No AND Q3=Yes', updates: ['Texture: Yellow'], verdict: 'Aging care (age > 40).' },
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

export default RULE_SPECS
