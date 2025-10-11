import fs from 'node:fs';
import path from 'node:path';

import type {
  BandColor,
  ConcernKey,
  MatrixEntry,
  MatrixProduct,
  ProductSlot,
  SkinTypeKey,
} from '../src/data/concernMatrix';
import { getProductInfo, listSubtypes, lookupMatrixEntry } from '../src/data/concernMatrix';
import {
  IngredientTag,
  pairCompatibility,
} from '../src/services/ingredientInteractions';

const CONCERNS: ConcernKey[] = ['acne', 'pigmentation', 'pores', 'texture', 'sebum', 'acnescars'];
const SKIN_TYPES: SkinTypeKey[] = ['Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'];
const BAND_ORDER: BandColor[] = ['blue', 'yellow', 'red', 'green'];
const BAND_LABEL: Record<BandColor, string> = {
  blue: 'Blue',
  yellow: 'Yellow',
  red: 'Red',
  green: 'Green',
};

interface CoverageCell {
  key: string;
  entry?: MatrixEntry;
}

type CoverageTable = Record<ConcernKey, Record<string, Record<SkinTypeKey, Record<BandColor, CoverageCell>>>>;

const coverageTable: CoverageTable = Object.create(null);
const entries: MatrixEntry[] = [];
const entryMap = new Map<string, MatrixEntry>();
const missingCombos: Array<{ concern: ConcernKey; subtype: string; skinType: SkinTypeKey; band: BandColor }>
  = [];
const coverageStats = new Map<ConcernKey, { expected: number; actual: number }>();

for (const concern of CONCERNS) {
  const subtypes = listSubtypes(concern).sort((a, b) => a.localeCompare(b));
  const expectedCombosForConcern = subtypes.length * SKIN_TYPES.length * BAND_ORDER.length;
  let actualCombos = 0;

  coverageTable[concern] = coverageTable[concern] || Object.create(null);

  for (const subtype of subtypes) {
    coverageTable[concern][subtype] = coverageTable[concern][subtype] || Object.create(null);

    for (const skinType of SKIN_TYPES) {
      coverageTable[concern][subtype][skinType] = coverageTable[concern][subtype][skinType] || Object.create(null);

      for (const band of BAND_ORDER) {
        const key = `${concern}|${subtype}|${skinType}|${band}`;
        const entry = lookupMatrixEntry({ concern, subtype, skinType, band });
        if (entry) {
          coverageTable[concern][subtype][skinType][band] = { key, entry };
          if (!entryMap.has(key)) {
            entries.push(entry);
            entryMap.set(key, entry);
          }
          actualCombos += 1;
        } else {
          coverageTable[concern][subtype][skinType][band] = { key };
          missingCombos.push({ concern, subtype, skinType, band });
        }
      }
    }
  }

  coverageStats.set(concern, {
    expected: expectedCombosForConcern,
    actual: actualCombos,
  });
}

interface FieldIssue {
  entryKey: string;
  field: ProductSlot | 'coreSerum' | 'secondarySerum';
  message: string;
}

const fieldIssues: FieldIssue[] = [];

function checkProductField(entry: MatrixEntry, product: MatrixProduct | null, slot: ProductSlot) {
  const value = product?.name?.trim();
  const rawValue = product?.rawName?.trim();
  if (!value || value.toLowerCase() === 'undefined' || value.toLowerCase() === 'na') {
    fieldIssues.push({
      entryKey: buildEntryLabel(entry),
      field: slot,
      message: `${slot} has missing or placeholder name ("${rawValue ?? ''}")`,
    });
  }
  if (rawValue && /undefined|tbd|todo|\[.*\]/i.test(rawValue)) {
    fieldIssues.push({
      entryKey: buildEntryLabel(entry),
      field: slot,
      message: `${slot} uses placeholder value ("${rawValue}")`,
    });
  }
}

for (const entry of entries) {
  checkProductField(entry, entry.cleanser, 'cleanser');
  checkProductField(entry, entry.coreSerum, 'coreSerum');
  checkProductField(entry, entry.moisturizer, 'moisturizer');
  checkProductField(entry, entry.sunscreen, 'sunscreen');
}

const totalEntries = entries.length;
const entriesWithFieldIssues = new Set(fieldIssues.map((issue) => issue.entryKey));
const completeEntries = totalEntries - entriesWithFieldIssues.size;

interface NamingIssue {
  productType: ProductSlot;
  normalized: string;
  variants: Set<string>;
}

const normalizedNames = new Map<string, NamingIssue>();
const rawNamesBySlot = {
  cleanser: new Set<string>(),
  coreSerum: new Set<string>(),
  secondarySerum: new Set<string>(),
  moisturizer: new Set<string>(),
  sunscreen: new Set<string>(),
};

function normalizeName(name: string) {
  return name.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function collectProductNames(entry: MatrixEntry, product: MatrixProduct | null, slot: ProductSlot) {
  if (!product) return;
  rawNamesBySlot[slot].add(product.rawName);
  const normalized = normalizeName(product.rawName);
  if (!normalizedNames.has(`${slot}:${normalized}`)) {
    normalizedNames.set(`${slot}:${normalized}`, {
      productType: slot,
      normalized,
      variants: new Set([product.rawName]),
    });
  } else {
    normalizedNames.get(`${slot}:${normalized}`)!.variants.add(product.rawName);
  }
}

for (const entry of entries) {
  collectProductNames(entry, entry.cleanser, 'cleanser');
  collectProductNames(entry, entry.coreSerum, 'coreSerum');
  if (entry.secondarySerum) {
    collectProductNames(entry, entry.secondarySerum, 'secondarySerum');
  }
  collectProductNames(entry, entry.moisturizer, 'moisturizer');
  collectProductNames(entry, entry.sunscreen, 'sunscreen');
}

const inconsistentNaming: string[] = [];
for (const issue of normalizedNames.values()) {
  if (issue.variants.size > 1) {
    inconsistentNaming.push(
      `${issue.productType}: ${Array.from(issue.variants).join(' vs ')}`,
    );
  }
}

const amMarkerIssues: string[] = [];
const pmMarkerIssues: string[] = [];

for (const [slot, rawNames] of Object.entries(rawNamesBySlot) as Array<[ProductSlot, Set<string>]>) {
  for (const rawName of rawNames) {
    const lower = rawName.toLowerCase();
    if (lower.includes('benzoyl peroxide') && !/\b(am)\b/i.test(rawName)) {
      amMarkerIssues.push(`${slot}: "${rawName}" missing AM marker`);
    }
    if ((lower.includes('adapalene') || lower.includes('retinol')) && !/\b(pm)\b/i.test(rawName)) {
      pmMarkerIssues.push(`${slot}: "${rawName}" missing PM marker`);
    }
  }
}

const missingIngredientTags = new Map<string, Set<string>>();

function recordTagIssue(product: MatrixProduct | null, entry: MatrixEntry, slot: ProductSlot) {
  if (!product) return;
  if (product.isReferral) return;
  if (!product.ingredientTags || product.ingredientTags.length === 0) {
    const key = product.name;
    if (!missingIngredientTags.has(key)) {
      missingIngredientTags.set(key, new Set());
    }
    missingIngredientTags.get(key)!.add(buildEntryLabel(entry, slot));
  }
  if (product.rawName && !getProductInfo(product.rawName)) {
    const key = `Unregistered product: ${product.rawName}`;
    if (!missingIngredientTags.has(key)) {
      missingIngredientTags.set(key, new Set());
    }
    missingIngredientTags.get(key)!.add(buildEntryLabel(entry, slot));
  }
}

for (const entry of entries) {
  recordTagIssue(entry.coreSerum, entry, 'coreSerum');
  recordTagIssue(entry.secondarySerum ?? null, entry, 'secondarySerum');
}

const missingGeneralFallback: ConcernKey[] = CONCERNS.filter(
  (concern) => !listSubtypes(concern).some((subtype) => subtype.toLowerCase() === 'general'),
);

const missingNormalFallback: string[] = [];
const blueFallbackGaps: string[] = [];

for (const concern of CONCERNS) {
  const subtypes = listSubtypes(concern);
  for (const subtype of subtypes) {
    let hasNormal = false;
    for (const band of BAND_ORDER) {
      const entry = lookupMatrixEntry({ concern, subtype, skinType: 'Normal', band });
      if (entry) {
        hasNormal = true;
        break;
      }
    }
    if (!hasNormal) {
      missingNormalFallback.push(`${formatConcern(concern)} ${subtype}`);
    }

    for (const skinType of SKIN_TYPES) {
      const blueEntry = lookupMatrixEntry({ concern, subtype, skinType, band: 'blue' });
      const yellowEntry = lookupMatrixEntry({ concern, subtype, skinType, band: 'yellow' });
      const redEntry = lookupMatrixEntry({ concern, subtype, skinType, band: 'red' });
      const missingSeverity = [] as string[];
      if (!yellowEntry) missingSeverity.push('Yellow');
      if (!redEntry) missingSeverity.push('Red');
      if (missingSeverity.length > 0 && !blueEntry) {
        blueFallbackGaps.push(
          `${formatConcern(concern)} ${subtype} ${skinType} missing ${missingSeverity.join(' & ')} without Blue fallback`,
        );
      }
    }
  }
}

interface PregnancyMapping {
  concern: ConcernKey;
  subtype: string;
  skinType: SkinTypeKey;
}

const pregnancyUnsafeEntries: PregnancyMapping[] = [];
const pregnancySafeLookup = new Map<ConcernKey, Set<SkinTypeKey>>();

for (const entry of entries) {
  const hasUnsafe = Boolean(
    entry.coreSerum?.pregnancyUnsafe ||
      entry.secondarySerum?.pregnancyUnsafe ||
      entry.cleanser?.pregnancyUnsafe ||
      entry.moisturizer?.pregnancyUnsafe,
  );
  if (hasUnsafe) {
    pregnancyUnsafeEntries.push({
      concern: entry.concern,
      subtype: entry.subtype,
      skinType: entry.skinType,
    });
  }
  if (entry.subtype.toLowerCase().includes('pregnancy')) {
    if (!pregnancySafeLookup.has(entry.concern)) {
      pregnancySafeLookup.set(entry.concern, new Set());
    }
    pregnancySafeLookup.get(entry.concern)!.add(entry.skinType);
  }
}

const pregnancyGaps: string[] = [];
for (const unsafe of pregnancyUnsafeEntries) {
  const safeSet = pregnancySafeLookup.get(unsafe.concern);
  if (!safeSet || !safeSet.has(unsafe.skinType)) {
    pregnancyGaps.push(
      `${formatConcern(unsafe.concern)} ${unsafe.subtype} ${unsafe.skinType} lacks pregnancy-safe alternative for same skin type`,
    );
  }
}

const disallowedIngredientCombos: string[] = [];
const customConflicts: string[] = [];

function formatProduct(product: MatrixProduct | null) {
  if (!product) return '—';
  return `${product.name}${product.defaultUsage ? ` (${product.defaultUsage.toUpperCase()})` : ''}`;
}

for (const entry of entries) {
  const { coreSerum, secondarySerum } = entry;
  if (coreSerum && secondarySerum) {
    for (const tagA of coreSerum.ingredientTags) {
      for (const tagB of secondarySerum.ingredientTags) {
        const compatibility = pairCompatibility(tagA, tagB);
        if (compatibility === 'disallow') {
          disallowedIngredientCombos.push(
            `${buildEntryLabel(entry)} combines ${tagA} (${formatProduct(coreSerum)}) with ${tagB} (${formatProduct(secondarySerum)})`,
          );
        }
        if (
          (tagA === 'benzoyl_peroxide' && tagB === 'aha') ||
          (tagA === 'aha' && tagB === 'benzoyl_peroxide')
        ) {
          customConflicts.push(
            `${buildEntryLabel(entry)} combines BPO with AHA (${formatProduct(coreSerum)} + ${formatProduct(secondarySerum)})`,
          );
        }
        if (tagA === 'retinoids' && tagB === 'retinoids') {
          customConflicts.push(
            `${buildEntryLabel(entry)} combines multiple retinoids (${formatProduct(coreSerum)} + ${formatProduct(secondarySerum)})`,
          );
        }
      }
    }
  }
}

const highPriorityCombos = [
  { concern: 'acne' as ConcernKey, subtype: 'Inflammatory', skinType: 'Sensitive' as SkinTypeKey, band: 'red' as BandColor, label: 'Acne Inflammatory Red Sensitive' },
  { concern: 'pigmentation' as ConcernKey, subtype: 'PIH', skinType: 'Sensitive' as SkinTypeKey, band: 'yellow' as BandColor, label: 'Pigmentation PIH Yellow Sensitive' },
];

const mediumPriorityCombos = [
  { concern: 'texture' as ConcernKey, subtype: 'Fine Lines', skinType: 'Dry' as SkinTypeKey, band: 'green' as BandColor, label: 'Texture Fine Lines Green Dry' },
];

const lowPriorityCombos = [
  { concern: 'pores' as ConcernKey, subtype: 'Enlarged', skinType: 'Sensitive' as SkinTypeKey, band: 'green' as BandColor, label: 'Pores Enlarged Green Sensitive' },
];

interface PriorityGap {
  level: 'High' | 'Medium' | 'Low';
  label: string;
  exists: boolean;
}

function evaluatePriorityCombos(list: typeof highPriorityCombos, level: PriorityGap['level']): PriorityGap[] {
  return list.map(({ concern, subtype, skinType, band, label }) => {
    const entry = lookupMatrixEntry({ concern, subtype, skinType, band });
    return { level, label, exists: Boolean(entry) };
  });
}

const priorityGaps: PriorityGap[] = [
  ...evaluatePriorityCombos(highPriorityCombos, 'High'),
  ...evaluatePriorityCombos(mediumPriorityCombos, 'Medium'),
  ...evaluatePriorityCombos(lowPriorityCombos, 'Low'),
];

function buildEntryLabel(entry: MatrixEntry, slot?: ProductSlot) {
  const base = `${formatConcern(entry.concern)} ${entry.subtype} ${entry.skinType} ${BAND_LABEL[entry.band]}`;
  if (slot) {
    return `${base} (${slot})`;
  }
  return base;
}

function formatConcern(concern: ConcernKey): string {
  switch (concern) {
    case 'acne':
      return 'Acne';
    case 'pigmentation':
      return 'Pigmentation';
    case 'pores':
      return 'Pores';
    case 'texture':
      return 'Texture';
    case 'sebum':
      return 'Sebum';
    case 'acnescars':
      return 'AcneScars';
    default:
      return concern;
  }
}

function formatCoverageTree(): string {
  const lines: string[] = [];
  for (const concern of CONCERNS) {
    lines.push(`${formatConcern(concern)} Coverage:`);
    const subtypes = Object.keys(coverageTable[concern] || {}).sort((a, b) => a.localeCompare(b));
    subtypes.forEach((subtype, subtypeIndex) => {
      const subPrefix = subtypeIndex === subtypes.length - 1 ? '└─' : '├─';
      lines.push(`${subPrefix} ${subtype}`);
      const skinTypes = SKIN_TYPES;
      skinTypes.forEach((skinType, skinIndex) => {
        const skinPrefix = skinIndex === skinTypes.length - 1 ? '   └─' : '   ├─';
        const bandCells = BAND_ORDER.map((band) => {
          const cell = coverageTable[concern][subtype][skinType][band];
          const hasEntry = Boolean(cell?.entry);
          const icon = hasEntry ? '✅' : '❌';
          return `${icon} ${BAND_LABEL[band]}`;
        }).join(' ');
        lines.push(`${skinPrefix} ${skinType}: ${bandCells}`);
      });
    });
    lines.push('');
  }
  return lines.join('\n');
}

const coverageTree = formatCoverageTree();
const totalExpected = Array.from(coverageStats.values()).reduce((sum, stat) => sum + stat.expected, 0);
const totalActual = Array.from(coverageStats.values()).reduce((sum, stat) => sum + stat.actual, 0);

function formatCoverageSummary(): string {
  const lines: string[] = [];
  lines.push('Coverage by Concern:');
  for (const concern of CONCERNS) {
    const stat = coverageStats.get(concern)!;
    const percent = stat.expected === 0 ? 100 : Math.round((stat.actual / stat.expected) * 100);
    lines.push(
      `${formatConcern(concern)}: ${percent}% (${stat.actual}/${stat.expected} combinations)`,
    );
  }
  return lines.join('\n');
}

const coverageSummary = formatCoverageSummary();

const summaryStatistics = [
  `Total Matrix Entries: ${totalEntries}`,
  `Complete Entries: ${completeEntries} (${totalEntries === 0 ? 0 : Math.round((completeEntries / totalEntries) * 100)}%)`,
  `Missing Required Fields: ${fieldIssues.length}`,
  `Incomplete Coverage: ${missingCombos.length} combinations`,
].join('\n');

const criticalIssues = new Set<string>();
const warningIssues = new Set<string>();

for (const gap of missingCombos) {
  const label = `${formatConcern(gap.concern)} ${gap.subtype} ${gap.skinType} ${BAND_LABEL[gap.band]}`;
  if (gap.band === 'red' || gap.band === 'yellow') {
    criticalIssues.add(`Missing: ${label}`);
  } else {
    warningIssues.add(`Missing: ${label}`);
  }
}

fieldIssues.forEach((issue) => criticalIssues.add(`Undefined product: ${issue.entryKey} -> ${issue.message}`));

pregnancyGaps.forEach((gap) => criticalIssues.add(`No pregnancy-safe fallback: ${gap}`));
blueFallbackGaps.forEach((gap) => criticalIssues.add(`No fallback: ${gap}`));
missingGeneralFallback.forEach((concern) => criticalIssues.add(`No general subtype fallback for ${formatConcern(concern)}`));

inconsistentNaming.forEach((issue) => warningIssues.add(`Inconsistent naming: ${issue}`));
amMarkerIssues.forEach((issue) => warningIssues.add(`Missing AM marker: ${issue}`));
pmMarkerIssues.forEach((issue) => warningIssues.add(`Missing PM marker: ${issue}`));
missingIngredientTags.forEach((contexts, product) => {
  warningIssues.add(`Missing ingredient metadata for ${product} in ${Array.from(contexts).join(', ')}`);
});
customConflicts.forEach((conflict) => warningIssues.add(`Potential conflict: ${conflict}`));
disallowedIngredientCombos.forEach((conflict) => warningIssues.add(`Disallowed tags: ${conflict}`));

const priorityCoverageGaps = priorityGaps.filter((gap) => !gap.exists);

function formatIssuesSet(set: Set<string>): string {
  if (set.size === 0) return '(none)';
  return Array.from(set).sort().join('\n');
}

function formatPriorityGaps(): string {
  if (priorityCoverageGaps.length === 0) {
    return '(none)';
  }
  const lines: string[] = [];
  for (const gap of priorityCoverageGaps) {
    lines.push(`${gap.level} Priority: ${gap.label}`);
  }
  return lines.join('\n');
}

const reportSections = [
  '### Summary Statistics',
  summaryStatistics,
  '',
  '### Coverage by Concern',
  coverageSummary,
  '',
  '### Coverage Matrix',
  coverageTree,
  '',
  '### Critical Issues (Must Fix)',
  formatIssuesSet(criticalIssues),
  '',
  '### Warnings (Should Fix)',
  formatIssuesSet(warningIssues),
  '',
  '### Coverage Gaps by Priority',
  formatPriorityGaps(),
];

const reportText = reportSections.join('\n');

console.log(reportText);

const docsDir = path.resolve(process.cwd(), 'docs');
const outputPath = path.join(docsDir, 'matrix-audit-report.md');

try {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, `# Product Matrix Audit\n\n${reportText}\n`);
  console.log(`\nReport saved to ${path.relative(process.cwd(), outputPath)}`);
} catch (error) {
  console.error('Failed to write report:', error);
}
