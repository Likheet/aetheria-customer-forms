// src/lib/decisionEngine.ts
// Covers: Moisture, Sebum, Acne (both dirs), Pores (both dirs), Texture (both dirs), Pigmentation (both dirs), Sensitivity hand-off

import type { AcneBreakoutDetail, AcneCategory } from '../types';

export type Band = 'green' | 'blue' | 'yellow' | 'red';
export type YesNo = 'Yes' | 'No';

export type Category =
  | 'Moisture'
  | 'Grease'      // your sheet labels oil/sebum "Grease" in outcomes
  | 'Acne'
  | 'Pores'
  | 'Texture'
  | 'Pigmentation'
  | 'Sensitivity';

export interface MachineAcneBreakout {
  type: string;
  severity?: string;
  category?: AcneCategory;
}

export interface MachineAcneReading {
  band?: Band;
  breakouts: MachineAcneBreakout[];
  raw?: unknown;
}

export interface MachineScanBands {
  moisture?: Band;         // from machine_analysis.moisture_band
  sebum?: Band;            // machine_analysis.sebum_band
  texture?: Band;
  pores?: Band;
  acne?: Band;
  acneDetails?: MachineAcneReading;
  pigmentation_brown?: Band; // if you split; else map from pigmentation_uv_band
  pigmentation_red?: Band;
  redness?: Band;          // optional, not used in rules below
  sensitivity?: Band;
}

export interface SelfBands {
  moisture?: Band;   // from Hydration Levels choice
  sebum?: Band;      // from Oil Levels choice
  texture?: Band;    // from Dullness / bumpy claims when present
  pores?: Band;      // from “Large pores” concern choice if user flags it
  acne_claim?: Band; // green/blue = none/mild, yellow/red = user says acne present
  pigmentation_brown_claim?: Band;
  pigmentation_red_claim?: Band;
}

export interface ContextInput {
  // optional context we can use (age, pregnancy/breastfeeding, etc.)
  dateOfBirth?: string; // YYYY-MM-DD
  pregnancyBreastfeeding?: string; // Yes/No/NA
}

export interface Question {
  id: string;                  // unique within a rule
  prompt: string;
  options: string[];           // exact options to show
  multi?: boolean;             // when "Select all that apply"
}

export interface Outcome {
  scope: Category;
  updatedBand?: Band;          // new band to set in UI (e.g., Yellow for clogged pores)
  verdict: string;             // human-readable verdict
  flags?: string[];            // internal flags for staff/system
  safety?: string[];           // referrals / pregnancy filters
  updates?: Record<string, any>; // optional structured data (e.g., Acne category)
}

export interface Rule {
  id: string;
  scope: Category;
  // decide if this rule should run based on machine vs self
  when: (m: MachineScanBands, s: SelfBands) => boolean;
  // follow-ups to ask (in order). optional if rule is auto-resolution.
  questions?: Question[];
  // compute outcome using collected answers (map: questionId -> value(s))
  decide: (answers: Record<string, string | string[]>, ctx: ContextInput) => Outcome;
}

// ---------- helpers ----------
const containsBand = (s?: string): Band | undefined => {
  if (!s) return undefined;
  const t = s.toLowerCase();
  if (/\bred\b/.test(t)) return 'red';
  if (/\byellow\b/.test(t)) return 'yellow';
  if (/\bblue\b/.test(t)) return 'blue';
  if (/\bgreen\b/.test(t)) return 'green';
  return undefined;
};

const BAND_PRIORITY: Record<Band, number> = { green: 0, blue: 1, yellow: 2, red: 3 };

const elevateBand = (current?: Band, candidate?: Band): Band | undefined => {
  if (!candidate) return current;
  if (!current) return candidate;
  return BAND_PRIORITY[candidate] > BAND_PRIORITY[current] ? candidate : current;
};

export const deriveAcneCategoryLabel = (label: string): AcneCategory | undefined => {
  const normalized = normalizeOptionLabel(label);
  if (!normalized) return undefined;
  if (normalized.includes('blackhead') || normalized.includes('whitehead')) return 'Comedonal acne';
  if (normalized.includes('large painful') || normalized.includes('cystic')) return 'Cystic acne';
  if (normalized.includes('jawline') || normalized.includes('hormonal')) return 'Hormonal acne';
  if (normalized.includes('red pimple') || normalized.includes('inflamed')) return 'Inflammatory acne';
  return undefined;
};

export const deriveAcneBandFromTypeSeverity = (type: string, severity: string): Band | undefined => {
  const acneType = normalizeOptionLabel(type);
  const acneSeverity = normalizeOptionLabel(severity);
  if (!acneType) return undefined;

  if (/(^|\b)(none|no acne)(\b|$)/.test(acneType)) {
    return 'green';
  }

  if (acneType.includes('blackhead')) {
    if (acneSeverity.includes('30+')) return 'red';
    if (acneSeverity.includes('11-30')) return 'yellow';
    if (acneSeverity.includes('<=10') || acneSeverity.includes('up to 10') || acneSeverity.includes('<10')) return 'blue';
    return 'blue';
  }

  if (acneType.includes('whitehead')) {
    if (acneSeverity.includes('20+')) return 'red';
    if (acneSeverity.includes('11-20')) return 'yellow';
    if (acneSeverity.includes('<=10') || acneSeverity.includes('<10')) return 'blue';
    return 'blue';
  }

  if (acneType.includes('red pimple') || acneType.includes('inflamed')) {
    if (acneSeverity.includes('10+')) return 'red';
    if (acneSeverity.includes('4-10')) return 'yellow';
    if (acneSeverity.includes('1-3')) return 'blue';
    return 'blue';
  }

  if (acneType.includes('cystic') || acneType.includes('large painful')) {
    if (acneSeverity.includes('4+') || acneSeverity.includes('per week 4') || acneSeverity.includes('>=4/week')) return 'red';
    if (acneSeverity.includes('1-3/week')) return 'yellow';
    if (acneSeverity.includes('rare') || acneSeverity.includes('1 in last 2 weeks')) return 'blue';
    return 'yellow';
  }

  if (acneType.includes('hormonal') || acneType.includes('jawline')) {
    if (acneSeverity.includes('strong monthly flare')) return 'red';
    if (acneSeverity.includes('clear monthly flare')) return 'yellow';
    if (acneSeverity.includes('mild monthly flare') || acneSeverity.includes('(1-3)')) return 'blue';
    return 'blue';
  }

  return undefined;
};

export function deriveSelfBandsFromForm(form: {
  oilLevels?: string;
  hydrationLevels?: string;
  mainConcerns?: string[];
  acneType?: string;
  poresType?: string;
  pigmentationType?: string;
  textureType?: string;
}): SelfBands {
  const self: SelfBands = {};
  self.moisture = containsBand(form.hydrationLevels);
  self.sebum = containsBand(form.oilLevels);

  // Coarse claims from concerns (user says "I have X")
  // We'll treat absence of Acne concern as explicit "no acne".
  const concerns = new Set((form.mainConcerns || []).map(String));
  const acneSelected = Array.from(concerns).some(label => label.toLowerCase().includes('acne'));
  if (!acneSelected) self.acne_claim = 'green';
  if (concerns.has('Large pores')) self.pores = 'yellow';
  if (concerns.has('Dullness')) self.texture = 'yellow';
  if (concerns.has('Bumpy skin')) self.texture = 'yellow';

  // If a texture selection contains a band hint, use it
  const tBand = containsBand(form.textureType);
  if (tBand) self.texture = tBand;
  if (concerns.has('Pigmentation')) {
    // If user chose brown vs red in its follow-up, use that
    const t = (form.pigmentationType || '').toLowerCase();
    if (t.includes('pie') || t.includes('red')) self.pigmentation_red_claim = 'yellow';
    if (t.includes('pih') || t.includes('brown') || t.includes('melasma')) self.pigmentation_brown_claim = 'yellow';
  }
  return self;
}

const ageFromDOB = (dob?: string): number | undefined => {
  if (!dob) return;
  const d = new Date(dob + 'T00:00:00');
  if (isNaN(d.getTime())) return;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

// mini utils
const includesAny = (arr: string[], needles: string[]) =>
  needles.some(n => arr.some(a => a.toLowerCase().includes(n)));

// ---------- RULES IMPLEMENTATION (exactly per your sheet) ----------
const RULES: Rule[] = [
  // Moisture — Machine dry vs Customer normal → set Blue (note: keep oil-control if all-day shine)
  {
    id: 'moisture_MDry_CNormal',
    scope: 'Moisture',
    when: (m, s) => (m.moisture === 'yellow' || m.moisture === 'red') && (s.moisture === 'green' || s.moisture === 'blue'),
    decide: () => ({
      scope: 'Moisture',
      verdict: 'Machine says dry, user feels normal → treat as Normal hydration (but do not remove oil-control if persistent shine).',
      updatedBand: 'blue',
      flags: ['prefer-machine-for-hydration', 'keep-oil-control-if-all-day-shine'],
    }),
  },

  // Moisture — Machine hydrated vs Customer dry → ask Q2/Q3/Q4
  {
    id: 'moisture_MHydrated_CDry',
    scope: 'Moisture',
    when: (m, s) => (m.moisture === 'green' || m.moisture === 'blue') && (s.moisture === 'yellow' || s.moisture === 'red'),
    questions: [
      { id: 'q2', prompt: 'Does skin feel tight all day even after moisturizer?', options: ['Yes', 'No'] },
      { id: 'q3', prompt: 'Do you have visible flaking/rough patches?', options: ['Yes', 'No'] },
      { id: 'q4', prompt: 'Current actives/meds in last 4 weeks?', options: ['Retinoids', 'Isotretinoin', 'BPO', 'AHA/BHA', 'Adapalene', 'None'], multi: true },
    ],
    decide: (a) => {
      const yes2 = a.q2 === 'Yes';
      const yes3 = a.q3 === 'Yes';
      const meds = Array.isArray(a.q4) ? a.q4 as string[] : [];
      const hasRetinoid = includesAny(meds, ['retinoid', 'adapalene', 'isotretinoin']);

      if (yes2 && yes3) {
        return {
          scope: 'Moisture',
          verdict: 'TRUE DRY / COMPROMISED BARRIER (tight + flaking).',
          updatedBand: 'red',
          flags: ['barrier-repair'],
        };
      }
      if (yes2 || yes3 || hasRetinoid) {
        return {
          scope: 'Moisture',
          verdict: 'TRUE DRY / COMPROMISED BARRIER.',
          updatedBand: 'yellow',
          flags: ['barrier-repair'],
        };
      }
      return {
        scope: 'Moisture',
        verdict: 'NORMAL HYDRATION (trust machine).',
        updatedBand: 'blue',
        flags: ['machine-reading-trusted'],
      };
    },
  },

  // Sebum — Machine normal vs Customer oily
  {
    id: 'sebum_MNormal_COily',
    scope: 'Grease',
    when: (m, s) => (m.sebum === 'green' || m.sebum === 'blue') && (s.sebum === 'yellow' || s.sebum === 'red'),
    questions: [
      { id: 'q1', prompt: 'How often do you blot/wash face due to oil?', options: ['Never', '1–2x/day', '≥3x/day'] },
      { id: 'q2', prompt: 'Is shine localized to T-zone?', options: ['T-zone', 'All over', 'No shine'] },
      { id: 'q3', prompt: 'Used mattifying products, clay masks or oil-absorbing sheets within last 24h?', options: ['Yes', 'No'] },
      { id: 'q5', prompt: 'Any mattifying primer/powder used in last 8h?', options: ['Yes', 'No'] },
    ],
    decide: (a) => {
      const q1 = String(a.q1);
      const q2 = String(a.q2);
      const q3 = String(a.q3);
      const q5 = String(a.q5);

      const productFilm = q3 === 'Yes' || q5 === 'Yes';
      const trueOily = q1 === '≥3x/day' || q2 === 'All over';
      if (trueOily) {
        return { scope: 'Grease', verdict: 'TRUE OILY (override machine).', updatedBand: q1 === '≥3x/day' && q2 === 'All over' ? 'red' : 'yellow' };
      }
      if (q2 === 'T-zone' && q1 === '1–2x/day') {
        return { scope: 'Grease', verdict: 'COMBINATION T-zone.', updatedBand: 'yellow' };
      }
      if (productFilm) {
        return { scope: 'Grease', verdict: 'PRODUCT FILM AFFECTED; treat as oily only if very frequent shine.', flags: ['product-film'] };
      }
      // default: keep machine normal
      return { scope: 'Grease', verdict: 'Normal oil per machine; user not consistently oily.', updatedBand: 'blue' };
    },
  },

  // Sebum — Machine oily vs Customer normal
  {
    id: 'sebum_MOily_CNormal',
    scope: 'Grease',
    when: (m, s) => (m.sebum === 'yellow' || m.sebum === 'red') && (s.sebum === 'green' || s.sebum === 'blue'),
    questions: [
      { id: 'q1', prompt: 'Do you see visible shine within 2–4h after cleansing?', options: ['Yes', 'No'] },
      { id: 'q2', prompt: 'Do you get frequent blackheads/whiteheads?', options: ['Yes', 'No'] },
      { id: 'q3', prompt: 'Using heavy creams/oils/sunscreens?', options: ['Yes', 'No'] },
    ],
    decide: (a) => {
      const yes1 = a.q1 === 'Yes';
      const yes2 = a.q2 === 'Yes';
      const yes3 = a.q3 === 'Yes';
      if ((yes1 || yes2) && !yes3) {
        return { scope: 'Grease', verdict: 'OILY (trust machine).', updatedBand: 'red' };
      }
      if ((yes1 || yes2) && yes3) {
        return { scope: 'Grease', verdict: 'Combination — product choices adding shine.', updatedBand: 'yellow', flags: ['optimize-products'] };
      }
      if (!yes1 && !yes2 && yes3) {
        return { scope: 'Grease', verdict: 'TEMPORARY PRODUCT-INDUCED SHINE — keep normal.', updatedBand: 'blue', flags: ['optimize-products'] };
      }
      return { scope: 'Grease', verdict: 'NORMAL (override machine; possible lighting artifact).', updatedBand: 'green' };
    },
  },

  // Acne — Machine acne vs Customer none
  {
    id: 'acne_MAcne_CNone',
    scope: 'Acne',
    when: (m, s) => (m.acne === 'yellow' || m.acne === 'red') && (!s.acne_claim || s.acne_claim === 'green' || s.acne_claim === 'blue'),
    questions: [
      { id: 'q1', prompt: 'Any new bumps in last 2 weeks?', options: ['None', '1–2', 'Several'] },
      { id: 'q2', prompt: 'Are there red/brown spots without raised bump?', options: ['Yes', 'No'] },
      { id: 'q3', prompt: 'Do you get monthly breakouts around periods/jawline?', options: ['Yes', 'No', 'NA'] },
      { id: 'q4', prompt: 'Do you frequently notice tiny bumps/blackheads/whiteheads?', options: ['Yes', 'No'] },
    ],
    decide: (a) => {
      const q1 = String(a.q1);
      const q2 = String(a.q2);
      const q3 = String(a.q3);
      const q4 = String(a.q4);

      if (q1 === '1–2' || q3 === 'Yes') {
        return { scope: 'Acne', verdict: 'ACNE – MILD (trust machine).', updatedBand: 'blue', flags: q3 === 'Yes' ? ['acne-category:Hormonal'] : [] };
      }
      if (q2 === 'Yes' && (q1 === 'None' || q1 === '1–2')) {
        return { scope: 'Acne', verdict: 'POST-ACNE MARKS ONLY (no active acne).', updatedBand: 'green', flags: ['shift-focus-to-PIH/PIE'] };
      }
      if (q1 === 'Several' || q4 === 'Yes') {
        return { scope: 'Acne', verdict: 'Comedonal or inflammatory acne.', updatedBand: 'yellow', flags: q4 === 'Yes' ? ['acne-category:Comedonal'] : [] };
      }
      return { scope: 'Acne', verdict: 'No clear activity.', updatedBand: 'green' };
    },
  },

  // Acne — Machine clear vs Customer moderate–severe
  {
    id: 'acne_MClear_CModerateSevere',
    scope: 'Acne',
    when: (m, s) => (m.acne === 'green' || m.acne === 'blue') && (s.acne_claim === 'yellow' || s.acne_claim === 'red'),
    questions: [
      { id: 'q1', prompt: 'How many inflamed (red, swollen, painful) pimples do you currently see?', options: ['None', '1–5', '6–15', '>=15'] },
      { id: 'q2', prompt: 'Do you get deep, painful lumps or nodules under the skin?', options: ['Yes', 'No'] },
      { id: 'q3', prompt: 'Do you have visible blackheads/whiteheads?', options: ['None', '<10', '10–20', '>=20'] },
      { id: 'q4', prompt: 'Do your breakouts flare with mask/sweat, periods, stress, products?', options: ['Yes', 'No'] },
      { id: 'q5', prompt: 'Are you currently pregnant or breastfeeding?', options: ['Yes', 'No', 'NA (male)'] },
    ],
    decide: (a, ctx) => {
      const q1 = String(a.q1);
      const q2 = String(a.q2);
      const q3 = String(a.q3);
      const q4 = String(a.q4);
      const q5 = String(a.q5);

      if (q2 === 'Yes' || q1 === '>=15') {
        return { scope: 'Acne', verdict: 'MODERATE–SEVERE ACNE — refer to dermatologist.', updatedBand: 'red', flags: ['refer-derm'], safety: ['nodulocystic-suspect'] };
      }
      if (q1 === '6–15' && q2 === 'No') {
        return { scope: 'Acne', verdict: 'MILD–MODERATE ACNE — start actives, follow up in 4 weeks.', updatedBand: 'yellow', flags: ['acne-category:Mild-Inflammatory'] };
      }
      if (q1 === '1–5' && (q3 === 'None' || q3 === '<10')) {
        return { scope: 'Acne', verdict: 'MILD ACNE — gentle active routine.', updatedBand: 'blue' };
      }
      if ((q1 === 'None' || q1 === '1–5') && (q3 === '10–20' || q3 === '>=20')) {
        return { scope: 'Acne', verdict: 'COMEDONAL ACNE — exfoliation focus (BHA/AHA).', updatedBand: 'yellow', flags: ['acne-category:Comedonal'] };
      }
      if ((q1 === 'None' || q1 === '1–5') && (q3 === 'None' || q3 === '<10') && q4 === 'Yes') {
        return { scope: 'Acne', verdict: 'SITUATIONAL ACNE — triggers control + targeted routine.', updatedBand: 'blue', flags: ['acne-category:Situational'] };
      }
      if (q5 === 'Yes' || (ctx.pregnancyBreastfeeding && /yes/i.test(ctx.pregnancyBreastfeeding))) {
        return { scope: 'Acne', verdict: 'ACNE WITH PREGNANCY SAFETY FILTER — restrict high-risk actives.', updatedBand: 'blue', safety: ['pregnancy-filter'] };
      }
      return { scope: 'Acne', verdict: 'CLEAR SKIN — machine false positive possible; confirm later.', updatedBand: 'green' };
    },
  },

  // Sensitivity — hand off to your 7Q block (already in form)
  {
    id: 'sensitivity_hand_off',
    scope: 'Sensitivity',
    when: () => false, // your form already injects 7 questions when user selects the concern
    decide: () => ({ scope: 'Sensitivity', verdict: 'Handled by built-in 7Q sensitivity block.' }),
  },

  // Pores — Machine enlarged vs Customer not concerned
  {
    id: 'pores_MEnlarged_CNotConcerned',
    scope: 'Pores',
    when: (m, s) => (m.pores === 'yellow' || m.pores === 'red') && (!s.pores || s.pores === 'green' || s.pores === 'blue'),
    questions: [
      { id: 'q1', prompt: 'Are pores visible at arm\'s length in a mirror?', options: ['Yes', 'No'] },
      { id: 'q2', prompt: 'Do you get frequent blackheads on nose/cheeks?', options: ['Yes', 'No'] },
      { id: 'q3', prompt: 'Oiliness level self-report', options: ['Low', 'Normal', 'High'] },
    ],
    decide: (a) => {
      const yes1 = a.q1 === 'Yes';
      const yes2 = a.q2 === 'Yes';
      const high3 = a.q3 === 'High';
      if (yes1 && yes2 && high3) return { scope: 'Pores', verdict: 'ENLARGED/CLOGGED (trust machine).', updatedBand: 'yellow' };
      if (yes1 || yes2 || high3) return { scope: 'Pores', verdict: 'CLOGGING/ENLARGED (trust machine).', updatedBand: 'blue' };
      return { scope: 'Pores', verdict: 'COSMETIC ONLY — deprioritize.', updatedBand: 'green' };
    },
  },

  // Pores — Machine normal vs Customer concerned
  {
    id: 'pores_MNormal_CConcerned',
    scope: 'Pores',
    when: (m, s) => (m.pores === 'green' || m.pores === 'blue') && (s.pores === 'yellow' || s.pores === 'red'),
    questions: [
      { id: 'q1', prompt: 'Is visibility limited to close-up only under harsh light?', options: ['Yes', 'No'] },
      { id: 'q2', prompt: 'Do you regularly wear heavy makeup/sunscreen and skip double-cleanse?', options: ['Yes', 'No'] },
      { id: 'q3', prompt: 'Blackheads present on nose/chin?', options: ['Yes', 'No'] },
    ],
    decide: (a) => {
      const yes2 = a.q2 === 'Yes';
      const yes3 = a.q3 === 'Yes';
      if (yes2 || yes3) return { scope: 'Pores', verdict: 'CLOGGING TENDENCY — add pore care.', updatedBand: 'yellow' };
      if (a.q1 === 'Yes' && !yes2 && !yes3) return { scope: 'Pores', verdict: 'NORMAL (set expectations).', updatedBand: 'green' };
      return { scope: 'Pores', verdict: 'Mild pore care only.', updatedBand: 'blue' };
    },
  },

  // Texture — Machine smooth vs Customer aging
  {
    id: 'texture_MSmooth_CAging',
    scope: 'Texture',
    when: (m, s) => (m.texture === 'green' || m.texture === 'blue') && (s.texture === 'yellow' || s.texture === 'red'), // uses “Dullness/aging” signal as present
    decide: (_a, ctx) => {
      const age = ageFromDOB(ctx.dateOfBirth);
      if (typeof age === 'number' && age > 35) {
        return { scope: 'Texture', verdict: 'Age-related concern — start anti-aging routine.', updatedBand: 'yellow' };
      }
      return { scope: 'Texture', verdict: 'No aging indication by age gate; mild brightening ok.', updatedBand: 'blue' };
    },
  },

  // Texture — Machine smooth vs Customer bumpy
  {
    id: 'texture_MSmooth_CBumpy',
    scope: 'Texture',
    when: (m, _s) => (m.texture === 'green' || m.texture === 'blue'), // customer will answer "bumpy" specifics below
    questions: [
      { id: 'q1', prompt: 'When you say “bumpy,” do you mean:', options: ['Pimples / breakouts', 'Tiny uneven dots (not pimples)', 'Just feels uneven to touch'] },
      { id: 'q2', prompt: 'Where do you notice this most?', options: ['Forehead', 'Chin', 'Cheeks', 'All over'] },
    ],
    decide: (a) => {
      const q1 = String(a.q1);
      const q2 = String(a.q2);
      if (q1.startsWith('Pimples')) {
        return { scope: 'Texture', verdict: 'Route to ACNE questions.', flags: ['route:acne'] };
      }
      if (q1.startsWith('Tiny') && q2 === 'Forehead') {
        return { scope: 'Texture', verdict: 'Possible scalp-origin bumps — consider scalp analysis.', flags: ['suggest:scalp-analysis'] };
      }
      if (q1.startsWith('Tiny') && (q2 === 'Chin' || q2 === 'Cheeks' || q2 === 'All over')) {
        return { scope: 'Texture', verdict: 'Oil-related bumps (clogged pores).', updatedBand: 'yellow', flags: ['clogged-pores'] };
      }
      return { scope: 'Texture', verdict: 'Mild unevenness — texture polish only.', updatedBand: 'blue' };
    },
  },

  // Texture — Machine rough/bumpy vs Customer says smooth
  {
    id: 'texture_MRough_CSmooth',
    scope: 'Texture',
    when: (m, _s) => (m.texture === 'yellow' || m.texture === 'red'),
    questions: [
      { id: 'q1', prompt: 'Do you notice any unevenness in particular areas (tiny bumps)?', options: ['Cheeks', 'Chin', 'Forehead', 'Other', 'No'] },
      { id: 'q2', prompt: 'Do you have any old acne scars or marks that haven’t faded yet?', options: ['Yes', 'No'] },
      { id: 'q3', prompt: 'Is your age above 40?', options: ['Yes', 'No'] },
    ],
    decide: (a) => {
      const q1 = String(a.q1);
      const q2 = String(a.q2);
      const q3 = String(a.q3);

      if (q1 === 'Forehead') return { scope: 'Texture', verdict: 'Check dandruff/oily scalp → scalp analysis.', flags: ['suggest:scalp-analysis'] };
      if (q1 === 'Cheeks' || q1 === 'Chin' || q1 === 'Other') {
        return { scope: 'Texture', verdict: 'Oil-related bumps (clogged pores).', updatedBand: 'yellow', flags: ['clogged-pores'] };
      }
      if (q2 === 'Yes') return { scope: 'Texture', verdict: 'Acne scars present — branch to scar type.', flags: ['followup:scar-type'] };
      if (q1 === 'No' && q2 === 'No' && q3 === 'Yes') {
        return { scope: 'Texture', verdict: 'Anti-aging routine.', updatedBand: 'yellow' };
      }
      return { scope: 'Texture', verdict: 'No texture action needed.', updatedBand: 'green' };
    },
  },

  // Pigmentation — Machine says pigmentation, customer says no
  {
    id: 'pigment_MYes_CNo',
    scope: 'Pigmentation',
    when: (m, s) => {
      const brown = m.pigmentation_brown === 'yellow' || m.pigmentation_brown === 'red';
      const red = m.pigmentation_red === 'yellow' || m.pigmentation_red === 'red';
      const userDenies = !s.pigmentation_brown_claim && !s.pigmentation_red_claim;
      return (brown || red) && userDenies;
    },
    decide: () => ({ scope: 'Pigmentation', verdict: 'Pigmentation present — set Brown to Yellow and educate (color-press test).', updatedBand: 'yellow', flags: ['educate:color-press-test'] }),
  },

  // Pigmentation — Machine none, customer marked brown
  {
    id: 'pigment_MNone_CBrown',
    scope: 'Pigmentation',
    when: (m, s) => (m.pigmentation_brown === 'green' || m.pigmentation_brown === 'blue') && (s.pigmentation_brown_claim === 'yellow' || s.pigmentation_brown_claim === 'red'),
    decide: () => ({ scope: 'Pigmentation', verdict: 'User perceives Brown pigmentation — set Yellow and support.', updatedBand: 'yellow' }),
  },

  // Pigmentation — Machine none, customer marked red
  {
    id: 'pigment_MNone_CRed',
    scope: 'Pigmentation',
    when: (m, s) => (m.pigmentation_red === 'green' || m.pigmentation_red === 'blue') && (s.pigmentation_red_claim === 'yellow' || s.pigmentation_red_claim === 'red'),
    decide: () => ({ scope: 'Pigmentation', verdict: 'User perceives Red pigmentation — set Yellow and support.', updatedBand: 'yellow' }),
  },
];

// ---------- engine runtime ----------
export interface Session {
  machine: MachineScanBands;
  self: SelfBands;
  ctx: ContextInput;
  pending: Rule[];                              // rules to run in order
  current?: { rule: Rule; answers: Record<string, string | string[]> };
  decided: Outcome[];                           // collected outcomes
}

export function startSession(machine: MachineScanBands, self: SelfBands, ctx: ContextInput = {}): Session {
  const pending = RULES.filter(r => r.when(machine, self));
  return { machine, self, ctx, pending, decided: [] };
}

export function getNextQuestion(session: Session): Question | null {
  if (!session.current) {
    const rule = session.pending[0];
    if (!rule) return null;
    session.current = { rule, answers: {} };
  }
  const { rule, answers } = session.current;
  const qs = rule.questions || [];
  const next = qs.find(q => !(q.id in answers));
  return next || null;
}

export function answer(session: Session, questionId: string, value: string | string[]): { done: boolean; outcome?: Outcome } {
  if (!session.current) throw new Error('No active rule');
  const { rule, answers } = session.current;
  answers[questionId] = value;

  const allAnswered = (rule.questions || []).every(q => q.id in answers);
  if (allAnswered) {
    const outcome = rule.decide(answers, session.ctx);
    session.decided.push(outcome);
    // move to next rule
    session.pending.shift();
    session.current = undefined;
    return { done: true, outcome };
  }
  return { done: false };
}

export function isComplete(session: Session): boolean {
  return session.pending.length === 0 && !session.current;
}

// ==================== Thin runtime around RULE_SPECS ====================
// Exposes: deriveSelfBands, getFollowUpQuestions, decideBandUpdates,
// decideAllBandUpdates, mergeBands, normalizeOptionLabel

import { RULE_SPECS } from './decisionRules'
import { getFollowUpQuestions as specGetFollowUps, decideBandUpdates as specDecide } from './decisionRulesUtil'

// Canonical band ordering (worst-wins)
export type Band4 = 'green' | 'blue' | 'yellow' | 'red'
const BAND_ORDER: Record<Band4, number> = { green: 0, blue: 1, yellow: 2, red: 3 }

export type RuntimeMachineBands = {
  moisture?: Band4
  sebum?: Band4
  texture?: Band4
  pores?: Band4
  acne?: Band4
  pigmentation_brown?: Band4
  pigmentation_red?: Band4
  sensitivity?: Band4
}

export type RuntimeSelfBands = RuntimeMachineBands

export type RuntimeContext = {
  dateOfBirth?: string
  age?: number
  pregnancyBreastfeeding?: string
}

export type FollowUp = {
  ruleId: string
  category: 'Moisture' | 'Grease' | 'Acne' | 'Pores' | 'Texture' | 'Pigmentation' | 'Sensitivity'
  dimension?: 'brown' | 'red'
  questions: { id: string; prompt: string; options: string[]; multi?: boolean }[]
}

export type Decision = {
  ruleId: string
  updates: Partial<RuntimeMachineBands>
  verdict?: string
  flags?: string[]
  safety?: string[]
  decidedAt: string
  specVersion: string
}

export function normalizeOptionLabel(str: string): string {
  if (!str) return ''
  // replace various dashes and comparison signs; collapse whitespace; lowercase
  return String(str)
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-') // dashes to '-'
    .replace(/[\u2265]/g, '>=') // ≥
    .replace(/[\u2264]/g, '<=') // ≤
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// Helper: map common band-like labels to canonical bands
function toBand(val?: string): Band4 | undefined {
  if (!val) return undefined
  const t = normalizeOptionLabel(val)
  if (/(^|\b)red(\b|$)/.test(t)) return 'red'
  if (/(^|\b)yellow(\b|$)/.test(t)) return 'yellow'
  if (/(^|\b)blue(\b|$)/.test(t)) return 'blue'
  if (/(^|\b)green(\b|$)/.test(t)) return 'green'
  return undefined
}

// ---- deriveSelfBands(formAnswers, ctx)
// Adapts UpdatedConsultData-like answers into standard bands
export function deriveSelfBands(form: any, ctx: RuntimeContext = {}): RuntimeSelfBands {
  const self: RuntimeSelfBands = {}

  // Sebum (oil) mapping from single-question prompt or band value
  const oil = normalizeOptionLabel(form?.oilLevels || form?.oilLevel || form?.oil || '')
  self.sebum = toBand(oil) || (
    oil.includes('very greasy') || oil.includes('across face') || oil.includes('frequent blotting') ? 'red' :
    oil.includes('noticeable shine') || oil.includes('multiple areas') ? 'yellow' :
    oil.includes('slight shine') || oil.includes('t-zone') ? 'blue' :
    oil ? 'green' : undefined
  )

  // Moisture (hydration)
  const hyd = normalizeOptionLabel(form?.hydrationLevels || form?.hydration || '')
  self.moisture = toBand(hyd) || (
    hyd.includes('always very tight') || hyd.includes('itchy') || hyd.includes('cracks') || hyd.includes('peels') ? 'red' :
    hyd.includes('often feels tight') || hyd.includes('rough') || hyd.includes('flaky') ? 'yellow' :
    hyd.includes('slight tightness') || hyd.includes('occasional dryness') ? 'blue' :
    hyd ? 'green' : undefined
  )

  // Concerns list to seed baseline intent
  const concerns: string[] = Array.isArray(form?.mainConcerns) ? form.mainConcerns : []
  const has = (label: string) => concerns.some((c) => normalizeOptionLabel(c).includes(normalizeOptionLabel(label)))

  // Acne baseline: only explicit "no acne" if concern absent
  if (!has('acne')) self.acne = 'green'

  // Pores baseline
  const poresType = normalizeOptionLabel(form?.poresType || '')
  if (poresType) {
    self.pores = toBand(poresType) || (
      poresType.includes('visible from a distance') ? 'red' :
      poresType.includes('several zones') ? 'yellow' :
      poresType.includes('near nose') || poresType.includes('close inspection') ? 'blue' : 'green'
    )
  } else if (has('pores')) {
    self.pores = 'yellow'
  }

  // Texture baseline from wrinkles/aging and bumpy-skin concern
  const wrinklesType = normalizeOptionLabel(form?.wrinklesType || form?.textureType || '')
  if (wrinklesType) {
    self.texture = toBand(wrinklesType) || (
      wrinklesType.includes('deep wrinkles') || wrinklesType.includes('obvious sagging') ? 'red' :
      wrinklesType.includes('wrinkles') || wrinklesType.includes('sagging in several areas') ? 'yellow' :
      wrinklesType.includes('few fine lines') || wrinklesType.includes('slight looseness') ? 'blue' : 'green'
    )
  } else if (has('texture') || has('dullness') || has('bumpy skin') || has('wrinkles')) {
    self.texture = 'yellow'
  }

  // Pigmentation baseline from user-selected type/severity
  const pigType = normalizeOptionLabel(form?.pigmentationType || '')
  const pigSeverity = normalizeOptionLabel(form?.pigmentationSeverity || '')
  const sevToBand = (s: string): Band4 | undefined => (
    s.includes('bright') || s.includes('deep') || s.includes('widespread') ? 'red' :
    s.includes('moderate') || s.includes('several') ? 'yellow' :
    s.includes('light') || s.includes('small') ? 'blue' : undefined
  )
  if (pigType.includes('red') || pigType.includes('pie')) {
    self.pigmentation_red = sevToBand(pigSeverity) || 'yellow'
  }
  if (pigType.includes('brown') || pigType.includes('pih') || pigType.includes('melasma')) {
    self.pigmentation_brown = sevToBand(pigSeverity) || 'yellow'
  }
  // Dullness priority nudges brown at least Yellow
  if (has('dullness')) {
    self.pigmentation_brown = mergeBands({ pigmentation_brown: self.pigmentation_brown }, { pigmentation_brown: 'yellow' }).pigmentation_brown
  }

  // Acne severity ladder based on multiple subtype selections
  const acneEntries: AcneBreakoutDetail[] = Array.isArray(form?.acneBreakouts)
    ? form.acneBreakouts
    : []
  if (acneEntries.length) {
    let derivedBand = self.acne
    for (const entry of acneEntries) {
      const band = deriveAcneBandFromTypeSeverity(entry?.type, entry?.severity)
      derivedBand = elevateBand(derivedBand, band)
    }
    if (!derivedBand) {
      // Legacy fallback: treat presence of acne concern as at least yellow
      derivedBand = has('acne') ? 'yellow' : undefined
    }
    if (derivedBand) {
      self.acne = derivedBand
    }
  } else {
    // Legacy support for scalar acneType/acneSeverity
    const legacyBand = deriveAcneBandFromTypeSeverity(
      form?.acneType || form?.acneSubtype || '',
      form?.acneSeverity || ''
    )
    if (legacyBand) {
      self.acne = legacyBand
    }
  }

  // Sensitivity (optional; only if present)
  const sens = normalizeOptionLabel(form?.sensitivity || '')
  if (sens) {
    self.sensitivity = toBand(sens) || (sens.includes('high') ? 'red' : sens.includes('medium') ? 'yellow' : sens.includes('low') ? 'blue' : 'green')
  }

  return self
}

// ---- computeSensitivityFromForm(form, ctx)
// Computes a numeric sensitivity score from yes/no prompts and maps to a band.
// Scoring (additive):
// +2: History of redness/burning/stinging from products (sensitivityRedness === 'Yes')
// +3: Diagnosed sensitive skin / rosacea / eczema (sensitivityDiagnosis === 'Yes')
// +1: Environmental sensitivity to sun/heat/wind/pollution (sensitivitySun === 'Yes')
// +1: Reacts to common actives (Vitamin C, AHAs, Niacinamide, Retinoids) (sensitivityProducts === 'Yes')
// +1: Visible broken capillaries or flushing (sensitivityCapillaries === 'Yes')
// +0.5: Age < 20 (either via explicit yes/no answer if present, or derived from DOB)
// +1: Very dry skin baseline (mapped here to sensitivityCleansing === 'Yes')
// Final tiers:
//  0–1   => Low       => band: green
//  2–3   => Moderate  => band: blue
//  4–5   => High      => band: yellow
//  6+    => Very High => band: red
export function computeSensitivityFromForm(
  form: any,
  ctx: RuntimeContext = {}
): { score: number; tier: 'Low' | 'Moderate' | 'High' | 'Very High'; band: Band4; remark: string } {
  const yn = (v: any) => String(v || '').trim().toLowerCase() === 'yes'
  let score = 0
  if (yn(form?.sensitivityRedness)) score += 2
  if (yn(form?.sensitivityDiagnosis)) score += 3
  if (yn(form?.sensitivitySun)) score += 1
  if (yn(form?.sensitivityProducts)) score += 1
  if (yn(form?.sensitivityCapillaries)) score += 1

  // Age < 20: prefer explicit yes/no if captured (we reuse sensitivitySeasonal)
  let ageUnder20 = yn(form?.sensitivitySeasonal)
  if (!ageUnder20) {
    const dob = form?.dateOfBirth || ctx.dateOfBirth
    if (dob) {
      const d = new Date(String(dob) + 'T00:00:00')
      if (!isNaN(d.getTime())) {
        const now = new Date()
        let age = now.getFullYear() - d.getFullYear()
        const m = now.getMonth() - d.getMonth()
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
        if (age < 20) ageUnder20 = true
      }
    }
  }
  if (ageUnder20) score += 0.5

  // Very dry baseline (mapped to sensitivityCleansing in current form wiring)
  if (yn(form?.sensitivityCleansing)) score += 1

  let tier: 'Low' | 'Moderate' | 'High' | 'Very High'
  let band: Band4
  let remark = ''
  if (score <= 1) {
    tier = 'Low'; band = 'green'; remark = 'Resilient skin'
  } else if (score <= 3) {
    tier = 'Moderate'; band = 'blue'; remark = 'Can tolerate most, but not all'
  } else if (score <= 5) {
    tier = 'High'; band = 'yellow'; remark = 'Only gentle actives, barrier focus first'
  } else {
    tier = 'Very High'; band = 'red'; remark = 'Use only barrier repair, hydration, sunscreen; avoid strong actives'
  }

  return { score, tier, band, remark }
}

// ---- getFollowUpQuestions(machine, self)
export function getFollowUpQuestions(machine: RuntimeMachineBands, self: RuntimeSelfBands): FollowUp[] {
  // Delegate matching to util built on RULE_SPECS
  const qsets = specGetFollowUps(machine as any, self as any)
  return qsets.map(q => ({ ruleId: q.ruleId, category: q.category, dimension: q.dimension, questions: q.questions }))
}

// ---- decideBandUpdates(ruleId, answersByQid, ctx)
export function decideBandUpdates(ruleId: string, answers: Record<string, string | string[]>, ctx: RuntimeContext = {}): { updates: Partial<RuntimeMachineBands>; verdict?: string; flags?: string[]; safety?: string[] } {
  const out = specDecide(ruleId, answers, ctx as any)
  const rawFlags = out?.flags || []
  const flags: string[] = []
  const safety: string[] = []
  for (const f of rawFlags) {
    // Split composite flags like "acne-category:Nodulocystic OR refer-derm"
    const parts = String(f).split(/\s+OR\s+/i)
    for (const p of parts) {
      const n = normalizeOptionLabel(p)
      if (n.includes('refer-derm') || n.includes('pregnancy-filter')) {
        safety.push(p.trim())
      } else {
        flags.push(p.trim())
      }
    }
  }
  return { updates: (out?.updates || {}) as Partial<RuntimeMachineBands>, verdict: out?.verdict, flags, safety }
}

// ---- mergeBands(base, updates) worst-wins
export function mergeBands(base: Partial<RuntimeMachineBands>, updates: Partial<RuntimeMachineBands>): Partial<RuntimeMachineBands> {
  const out: Partial<RuntimeMachineBands> = { ...base }
  for (const k of Object.keys(updates) as (keyof RuntimeMachineBands)[]) {
    const ub = updates[k]
    const bb = out[k]
    if (!bb) {
      out[k] = ub
    } else if (ub && BAND_ORDER[ub] > BAND_ORDER[bb]) {
      out[k] = ub
    }
  }
  return out
}

// ---- decideAllBandUpdates: evaluate answered rules and merge with machine (worst-wins)
export function decideAllBandUpdates(
  machine: RuntimeMachineBands,
  self: RuntimeSelfBands,
  answersByRuleId: Record<string, Record<string, string | string[]>>,
  ctx: RuntimeContext = {}
): { effectiveBands: RuntimeMachineBands; decisions: Decision[] } {
  const followUps = getFollowUpQuestions(machine, self)
  const decisions: Decision[] = []
  let merged: Partial<RuntimeMachineBands> = {}

  const specVersion = shortSpecVersion()

  for (const f of followUps) {
    const ans = answersByRuleId[f.ruleId]
    if (!ans) continue
    const d = decideBandUpdates(f.ruleId, ans, ctx)
    const decidedAt = new Date().toISOString()
    decisions.push({ ruleId: f.ruleId, updates: d.updates || {}, verdict: d.verdict, flags: d.flags || [], safety: d.safety || [], decidedAt, specVersion })
    merged = mergeBands(merged, d.updates || {})
  }

  // Apply decided updates over machine bands (override as per rule decision)
  const effective: RuntimeMachineBands = { ...machine }
  for (const key of Object.keys(merged) as (keyof RuntimeMachineBands)[]) {
    const u = merged[key]
    if (u) effective[key] = u
  }

  return { effectiveBands: effective, decisions }
}

function shortSpecVersion(): string {
  // simple deterministic hash of rule IDs + outcome strings
  try {
    const src = RULE_SPECS.map(r => r.id + '|' + (r.outcomes || []).map(o => o.when + ':' + (o.updates || []).join(',')).join(';')).join('#')
    let h = 0
    for (let i = 0; i < src.length; i++) h = ((h << 5) - h + src.charCodeAt(i)) | 0
    return 'spec-' + (Math.abs(h) % 1000000).toString(36)
  } catch {
    return 'spec-unk'
  }
}

