import { AcneSubtypeKey } from '../types';
import type { Band4 } from './decisionEngine';

export type AcneFlowQuestion = {
  id: string;
  prompt: string;
  options: string[];
  multi?: boolean;
  prefill?: string;
};

export interface AcneFlowEvaluationResult {
  band?: Band4;
  subtype: AcneSubtypeKey;
  flags: string[];
  remarks: string[];
  referDerm?: boolean;
  situational?: boolean;
  pregnancySafe?: boolean;
  error?: string;
}

export interface AcneFlowContext {
  pregnancy?: string;
  pregnancyBreastfeeding?: string;
}

export const CUSTOM_ACNE_RULE_PREFIX = 'acne-subtype-';

const normalizeAnswer = (value?: string) => String(value ?? '').trim().toLowerCase();

const mapCountBucket = (value?: string): number => {
  const normalized = normalizeAnswer(value);
  if (!normalized || normalized === 'na') return 0;
  if (normalized.includes('none') || normalized === '0' || normalized.includes('no pimples')) return 0;

  const rangeMatch = normalized.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
  if (rangeMatch) {
    const low = parseInt(rangeMatch[1], 10);
    const high = parseInt(rangeMatch[2], 10);
    if (!Number.isNaN(low) && !Number.isNaN(high)) {
      return Math.round((low + high) / 2);
    }
  }

  const numericMatch = normalized.match(/\d+/);
  if (numericMatch) {
    let count = parseInt(numericMatch[0], 10);
    if (normalized.includes('+') || normalized.includes('>')) {
      count = Math.max(count, count + 1);
    }
    return Number.isNaN(count) ? 0 : count;
  }

  if (normalized.includes('few') || normalized.includes('couple')) return 3;
  if (normalized.includes('handful')) return 5;
  if (normalized.includes('several') || normalized.includes('moderate')) return 8;
  if (normalized.includes('many') || normalized.includes('numerous')) return 18;
  return 0;
};

const yesLike = (value?: string) => {
  const v = normalizeAnswer(value);
  return v === 'yes' || v === 'y' || v === 'true';
};

const evaluateComedonalFlow = (answers: Record<string, string>): AcneFlowEvaluationResult => {
  const noticed = yesLike(answers.Q1);
  const comedoneCount = mapCountBucket(answers.Q2);
  const q3Raw = answers.Q3 || '';
  const inflamedNote = normalizeAnswer(q3Raw);

  let band: Band4 = 'green';
  if (comedoneCount > 20) band = 'red';
  else if (comedoneCount >= 10) band = 'yellow';
  else if (comedoneCount >= 1) band = 'blue';

  const remarks: string[] = [];
  if (!noticed && comedoneCount > 0) {
    remarks.push('Machine detected congestion even though customer did not notice bumps.');
  }
  if (inflamedNote && inflamedNote !== 'none') {
    remarks.push(`Comedonal acne with inflammatory component (reported inflamed lesions: ${q3Raw}).`);
  }

  return {
    band,
    subtype: 'Comedonal',
    flags: ['acne-subtype:Comedonal', 'acne-category:Comedonal'],
    remarks,
  };
};

const evaluateInflammatoryFlow = (
  answers: Record<string, string>,
  context: AcneFlowContext,
): AcneFlowEvaluationResult => {
  const lesions = mapCountBucket(answers.Q1);
  const hasNodules = yesLike(answers.Q2);
  const comedoneCount = mapCountBucket(answers.Q3);
  const triggers = yesLike(answers.Q4);
  const pregnancy =
    yesLike(context.pregnancy) ||
    yesLike(context.pregnancyBreastfeeding) ||
    yesLike(answers.Q5);

  let band: Band4 = 'blue';
  let referDerm = false;

  if (lesions > 15 || hasNodules) {
    band = 'red';
    referDerm = true;
  } else if (lesions >= 6) {
    band = 'red';
  } else if (lesions >= 1) {
    band = 'yellow';
  }

  const flags = ['acne-subtype:Inflammatory', 'acne-category:Inflammatory'];
  const remarks: string[] = [];

  if (referDerm) {
    flags.push('refer-derm');
    remarks.push('Severe inflammatory acne - dermatologist referral recommended.');
  }

  if (comedoneCount > 20) {
    remarks.push('Inflammatory acne with severe comedonal component.');
  } else if (comedoneCount >= 10) {
    remarks.push('Inflammatory acne with moderate comedonal component.');
  } else if (comedoneCount >= 1) {
    remarks.push('Inflammatory acne with mild comedonal component.');
  }

  if (triggers) {
    flags.push('acne-category:Situational acne');
    remarks.push('Situational triggers identified - guide added.');
  }

  if (pregnancy) {
    flags.push('pregnancy-filter');
    remarks.push('Pregnancy safety considerations active.');
  }

  return {
    band,
    subtype: 'Inflammatory',
    flags,
    remarks,
    referDerm,
    situational: triggers,
    pregnancySafe: pregnancy,
  };
};

const evaluateHormonalFlow = (
  answers: Record<string, string>,
  context: AcneFlowContext,
): AcneFlowEvaluationResult => {
  const monthly = yesLike(answers.Q1);
  const jawline = yesLike(answers.Q2);
  const cycleChange = yesLike(answers.Q3);
  const lesions = mapCountBucket(answers.Q4);
  const pregnancy =
    yesLike(context.pregnancy) ||
    yesLike(context.pregnancyBreastfeeding) ||
    yesLike(answers.Q5);

  if (!monthly) {
    return {
      error: "Your answers don't match hormonal acne patterns. Please re-select your breakout type.",
      subtype: 'Hormonal',
      flags: [],
      remarks: [],
    };
  }

  let band: Band4 = 'blue';
  let subtype: AcneSubtypeKey = 'Hormonal';
  const flags: string[] = ['acne-subtype:Hormonal', 'acne-category:Hormonal'];
  const remarks: string[] = [];
  let referDerm = false;

  if (lesions > 15) {
    band = 'red';
    referDerm = true;
    remarks.push('Severe hormonal acne - dermatologist referral recommended.');
  } else if (lesions >= 6) {
    band = 'red';
  } else if (lesions >= 1) {
    band = 'yellow';
  }

  if (monthly && jawline) {
    if (lesions >= 1 && lesions <= 5 && !referDerm) {
      remarks.push('Hormonal timing with mild inflammatory lesions - medical consultation recommended.');
    } else if (!referDerm) {
      remarks.push('Hormonal pattern confirmed - medical consultation recommended.');
    }
  } else {
    subtype = 'Inflammatory';
    flags[0] = 'acne-subtype:Inflammatory';
    if (!flags.includes('acne-category:Inflammatory')) {
      flags.push('acne-category:Inflammatory');
    }
    flags.push('medical-consult');
    remarks.push('Responses align more with inflammatory acne than classic hormonal patterns.');
  }

  if (cycleChange && !remarks.some(r => r.toLowerCase().includes('hormonal'))) {
    remarks.push('Hormonal shifts noted - medical consultation recommended.');
  }

  if (pregnancy) {
    flags.push('pregnancy-filter');
    remarks.push('Pregnancy safety considerations active.');
  }
  if (referDerm) {
    flags.push('refer-derm');
  }

  return {
    band,
    subtype,
    flags,
    remarks,
    referDerm,
    pregnancySafe: pregnancy,
  };
};

export const buildAcneSubtypeQuestions = (
  subtype: AcneSubtypeKey,
  context: AcneFlowContext,
): AcneFlowQuestion[] => {
  const pregnancyPrefill =
    context.pregnancy && context.pregnancy.trim()
      ? context.pregnancy
      : context.pregnancyBreastfeeding && context.pregnancyBreastfeeding.trim()
        ? context.pregnancyBreastfeeding
        : undefined;

  switch (subtype) {
    case 'Comedonal':
      return [
        {
          id: 'Q1',
          prompt: 'Do you notice tiny bumps, blackheads or whiteheads (especially around the nose, chin, or forehead)?',
          options: ['Yes', 'No'],
        },
        {
          id: 'Q2',
          prompt: 'Roughly how many clogged pores/comedones do you see right now?',
          options: ['None', '<10', '10-20', '>20'],
        },
        {
          id: 'Q3',
          prompt: 'Do you also have inflamed pimples right now?',
          options: ['None', '1-5', '6-15', '>15'],
        },
      ];
    case 'Inflammatory':
      return [
        {
          id: 'Q1',
          prompt: 'How many inflamed (red, swollen, painful) pimples do you currently see?',
          options: ['None', '1-5', '6-15', '>15'],
        },
        {
          id: 'Q2',
          prompt: 'Do you have deep, painful lumps or nodules under the skin?',
          options: ['Yes', 'No'],
        },
        {
          id: 'Q3',
          prompt: 'Do you have visible blackheads/whiteheads alongside these breakouts?',
          options: ['None', '<10', '10-20', '>20'],
        },
        {
          id: 'Q4',
          prompt: 'Do your breakouts flare with specific triggers (mask/sweat/stress/products)?',
          options: ['Yes', 'No'],
        },
        {
          id: 'Q5',
          prompt: 'Are you currently pregnant or breastfeeding?',
          options: ['Yes', 'No', 'NA'],
          prefill: pregnancyPrefill,
        },
      ];
    case 'Hormonal':
      return [
        {
          id: 'Q1',
          prompt: 'Do you get breakouts monthly or around your period?',
          options: ['Yes', 'No'],
        },
        {
          id: 'Q2',
          prompt: 'Are the breakouts mainly on the lower face or jawline?',
          options: ['Yes', 'No'],
        },
        {
          id: 'Q3',
          prompt: 'Have you noticed changes with birth control or menstrual cycle affecting breakouts?',
          options: ['Yes', 'No', 'NA'],
        },
        {
          id: 'Q4',
          prompt: 'How many inflamed lesions do you currently have?',
          options: ['None', '1-5', '6-15', '>15'],
        },
        {
          id: 'Q5',
          prompt: 'Are you currently pregnant or breastfeeding?',
          options: ['Yes', 'No', 'NA'],
          prefill: pregnancyPrefill,
        },
      ];
    default:
      return [];
  }
};

export const evaluateAcneSubtypeFlow = (
  subtype: AcneSubtypeKey,
  answers: Record<string, string>,
  context: AcneFlowContext,
): AcneFlowEvaluationResult => {
  switch (subtype) {
    case 'Comedonal':
      return evaluateComedonalFlow(answers);
    case 'Inflammatory':
      return evaluateInflammatoryFlow(answers, context);
    case 'Hormonal':
      return evaluateHormonalFlow(answers, context);
    default:
      return {
        band: undefined,
        subtype,
        flags: [],
        remarks: [],
      };
  }
};
