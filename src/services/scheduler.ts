import dayjs from 'dayjs'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc); dayjs.extend(tz)

import { serumKeyToTag } from './ingredientInteractions'
import { PRODUCT_DATABASE } from '../data/productDatabase'

export type RoutineStep = { step: number; label: string; product: string }
export type DayKey = 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'

export interface WeeklyPlan {
  am: RoutineStep[] // same for all days
  pmByDay: Record<DayKey, RoutineStep[]>
  warnings: string[]
}

export interface CustomerView {
  am: RoutineStep[]
  pm: RoutineStep[]
  notes: string[]
}

export interface SchedulerInput {
  cleanser: string
  coreSerumKey: string // engine key e.g. 'adapalene','vitamin-c','niacinamide',...
  secondarySerumKey?: string
  moisturizer: string
  sunscreen?: string
  flags?: {
    pregnancy?: boolean
    sensitivity?: boolean
    // sensitivityBand maps to barrier stress budget (green/blue/yellow/red)
    sensitivityBand?: 'green'|'blue'|'yellow'|'red'
    serumComfort?: number // max leave-on serums per routine
    vc_form?: 'laa'|'derivative'
    core_acid_strength?: 'low'|'medium'|'high'
    secondary_acid_strength?: 'low'|'medium'|'high'
    // wash-off cleansers are assumed safe; not considered leave-on
  }
}

function step(label: string, product: string, index: number): RoutineStep {
  return { step: index, label, product }
}

function decideAMSerum(key: string | undefined, flags: SchedulerInput['flags']): string | undefined {
  if (!key) return undefined
  if (flags?.sensitivityBand === 'red') return undefined
  const tag = serumKeyToTag(key)
  const vcForm = flags?.vc_form || (key === 'vitamin-c' ? 'laa' : undefined)
  // Retinoids: never AM
  if (tag === 'retinoids') return undefined
  // LAA: prefer AM
  if (key === 'vitamin-c' && vcForm === 'laa') return key
  // Derivatives and others are flexible
  return key
}

function decidePMSerum(key: string | undefined): string | undefined {
  if (!key) return undefined
  const tag = serumKeyToTag(key)
  if (tag === 'retinoids') return key
  return key
}

function emptyPM(cleanser: string, moisturizer: string): RoutineStep[] {
  return [
    step('Cleanser', cleanser, 1),
    step('Moisturizer', moisturizer, 3),
  ]
}

// Very lightweight first pass scheduler that obeys key acceptance checks.
export function buildWeeklyPlan(input: SchedulerInput, timeZone = 'Asia/Kolkata'): { plan: WeeklyPlan, customerView: CustomerView } {
  const warnings: string[] = []
  const serumComfort = (input.flags?.sensitivityBand === 'red') ? 0 : Math.max(1, Math.min(2, input.flags?.serumComfort ?? 2))
  const sensitive = !!input.flags?.sensitivity
  const pregnant = !!input.flags?.pregnancy
  const sensBand = input.flags?.sensitivityBand || (sensitive ? 'yellow' : 'green')
  const { nightlyCap, minRestNights } = budgetFromSensitivityBand(sensBand)

  // Pregnancy filter
  const coreTag = serumKeyToTag(input.coreSerumKey)
  const secondaryTag = serumKeyToTag(input.secondarySerumKey)
  let core: string | undefined = input.coreSerumKey
  let secondary: string | undefined = input.secondarySerumKey
  if (pregnant) {
    if (coreTag === 'retinoids') { warnings.push('Removed retinoid due to pregnancy'); core = undefined }
    if (secondaryTag === 'retinoids') { warnings.push('Removed retinoid secondary due to pregnancy'); secondary = undefined }
    // Strong salicylic as leave-on would be removed if we tracked acid strength at SKU level
  }

  // Deduplicate duplicate families (keep core)
  if (core && secondary && serumKeyToTag(core) === serumKeyToTag(secondary)) {
    warnings.push(`Dropped duplicate active '${secondary}' (same family as core)`)
    secondary = undefined
  }

  // Build AM baseline: Cleanser → Serum (optional) → Moisturizer → Sunscreen
  const amSerum = decideAMSerum(core, input.flags) || decideAMSerum(secondary, input.flags)
  let am: RoutineStep[] = [
    step('Cleanser', input.cleanser, 1),
  ]
  if (amSerum && serumComfort >= 1) am.push(step('Serum', labelFromKey(amSerum), 2))
  am.push(step('Moisturizer', input.moisturizer, 3))
  am.push(step('Sunscreen', input.sunscreen || fallbackSunscreen(), 4))

  // Build PM scaffold, enforce non-conflicts
  // Default strategy: place retinoid on Mon/Thu nights; place leave-on AHA/BHA on Tue/Sat nights (non-retinoid), else azelaic/niacinamide on remaining nights.
  const pmByDay: Record<DayKey, RoutineStep[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
  const retinoidNights: DayKey[] = ['mon','thu']
  const exfoliantNights: DayKey[] = sensitive ? ['tue'] : (isHighStrength(input) ? ['tue','sat'] : ['tue','sat'])

  for (const d of Object.keys(pmByDay) as DayKey[]) {
    // Default PM is cleanser + moisturizer
    let pm = emptyPM(input.cleanser, input.moisturizer)
    // Try to place core first
    const corePm = decidePMSerum(core)
    const secPm = decidePMSerum(secondary)
    let chosen: string | undefined
    if (retinoidNights.includes(d) && serumKeyToTag(corePm) === 'retinoids') {
      chosen = corePm
    } else if (exfoliantNights.includes(d) && (isExfoliant(corePm) || isExfoliant(secPm))) {
      chosen = isExfoliant(corePm) ? corePm : (isExfoliant(secPm) ? secPm : undefined)
      // Ensure not retinoid night
      if (serumKeyToTag(chosen) === 'retinoids') chosen = undefined
    } else {
      // Fill with non-conflict flexible active
  chosen = pickFlexible(corePm, secPm)
    }

    if (chosen && serumComfort >= 1) {
      pm = [ step('Cleanser', input.cleanser, 1), step('Serum', labelFromKey(chosen), 2), step('Moisturizer', input.moisturizer, 3) ]
    }
    pmByDay[d] = pm
  }

  // Conflicts between AM and PM of the same day: ensure LAA and BPO/retinoid separation
  if (amHasLAA(am)) {
    for (const d of Object.keys(pmByDay) as DayKey[]) {
      const pm = pmByDay[d]
      if (pmSerumTag(pm) === 'benzoyl_peroxide' || pmSerumTag(pm) === 'retinoids') {
        warnings.push('Separated L-ascorbic (AM) and BPO/Retinoid (PM)')
      }
    }
  }

  // Final pass: enforce serumComfort
  // (We only schedule max 1 serum per routine in this v1)

  const plan: WeeklyPlan = { am, pmByDay, warnings }
  // Enforce irritation budget post-pass on PM plan
  enforceIrritationBudget(plan, nightlyCap, minRestNights)
  const customerView = buildCustomerView(plan, timeZone)
  return { plan, customerView }
}

function labelFromKey(key: string): string {
  // Map engine keys to display labels
  const map: Record<string,string> = {
    'adapalene': 'Adapalene 0.1%',
    'retinol': 'Retinol',
    'vitamin-c': 'Vitamin C',
    'niacinamide': 'Niacinamide',
    'salicylic-acid': '2% Salicylic Acid',
    'lactic-acid': 'Lactic Acid',
    'azelaic-acid': '10% Azelaic Acid',
    'alpha-arbutin': 'Alpha Arbutin',
    'tranexamic-acid': 'Tranexamic Acid',
    'benzoyl-peroxide': 'Benzoyl Peroxide 2.5%',
    'peptides': 'Peptides',
  }
  return map[key] || key
}

function fallbackSunscreen(): string {
  const spf = PRODUCT_DATABASE.sunscreen['general'][0]
  return `${spf.name} (${spf.brand})`
}

function isExfoliant(key?: string): boolean {
  const tag = serumKeyToTag(key)
  return tag === 'aha' || tag === 'bha'
}

function isHighStrength(input: SchedulerInput): boolean {
  const cs = input.flags?.core_acid_strength
  const ss = input.flags?.secondary_acid_strength
  const norm = (s?: string) => (s || 'high') // unknown treated as high (stricter)
  return norm(cs) === 'high' || norm(ss) === 'high'
}

function pmSerumTag(steps: RoutineStep[]): ReturnType<typeof serumKeyToTag> {
  const s = steps.find(x => x.label === 'Serum')
  if (!s) return null
  return serumKeyToTag(REVERSE_LABEL_KEY_MAP[s.product] || '')
}

function amHasLAA(am: RoutineStep[]): boolean {
  const s = am.find(x => x.label === 'Serum')
  if (!s) return false
  return s.product.includes('Vitamin C') // conservative
}

function buildCustomerView(plan: WeeklyPlan, timeZone: string): CustomerView {
  const today = dayKeyForTz(timeZone)
  return {
    am: plan.am,
    pm: plan.pmByDay[today],
    notes: plan.warnings,
  }
}

function dayKeyForTz(tzName: string): DayKey {
  const d = dayjs().tz(tzName).day() // 0-6, Sun=0
  const map: Record<number, DayKey> = { 1: 'mon', 2:'tue', 3:'wed', 4:'thu', 5:'fri', 6:'sat', 0:'sun' }
  return map[d]
}

function pickFlexible(a?: string, b?: string): string | undefined {
  // Prefer non-retinoid, non-exfoliant helpers first (niacinamide, azelaic, peptides)
  const pref = ['niacinamide','azelaic-acid','peptides','alpha-arbutin','tranexamic-acid','vitamin-c']
  const list = [a, b].filter(Boolean) as string[]
  for (const k of pref) if (list.includes(k)) return k
  return list[0]
}

// ---- Irritation budget helpers ----
const REVERSE_LABEL_KEY_MAP: Record<string,string> = {
  'Adapalene 0.1%': 'adapalene',
  'Retinol': 'retinol',
  'Vitamin C': 'vitamin-c',
  'Niacinamide': 'niacinamide',
  '2% Salicylic Acid': 'salicylic-acid',
  'Lactic Acid': 'lactic-acid',
  '10% Azelaic Acid': 'azelaic-acid',
  'Alpha Arbutin': 'alpha-arbutin',
  'Tranexamic Acid': 'tranexamic-acid',
  'Benzoyl Peroxide 2.5%': 'benzoyl-peroxide',
  'Peptides': 'peptides',
}

function budgetFromSensitivityBand(band: 'green'|'blue'|'yellow'|'red'): { nightlyCap: number; minRestNights: number } {
  switch (band) {
    case 'green':
    case 'blue':
      return { nightlyCap: 100, minRestNights: 2 }
    case 'yellow':
      return { nightlyCap: 70, minRestNights: 3 }
    case 'red':
    default:
      return { nightlyCap: 0, minRestNights: 4 }
  }
}

function tagCost(tag: ReturnType<typeof serumKeyToTag>): number {
  switch (tag) {
    case 'retinoids': return 60
    case 'benzoyl_peroxide': return 50
    case 'aha': return 60
    case 'bha': return 60
    case 'vitamin_c_ascorbic': return 25
    case 'tranexamic': return 20
    case 'azelaic': return 30
    case 'niacinamide': return 10
    case 'peptides': return 0
    default: return 0
  }
}

function replacePmSerum(plan: WeeklyPlan, day: DayKey, newKey?: string) {
  // Replace or remove the Serum step for a day's PM routine
  const steps = plan.pmByDay[day]
  const withoutSerum = steps.filter(s => s.label !== 'Serum')
  if (!newKey) {
    plan.pmByDay[day] = withoutSerum
    return
  }
  const label = labelFromKey(newKey)
  const serumStep: RoutineStep = step('Serum', label, 2)
  // Rebuild: Cleanser, Serum, Moisturizer (ensure order)
  const cleanser = steps.find(s => s.label === 'Cleanser')
  const moisturizer = steps.find(s => s.label === 'Moisturizer')
  plan.pmByDay[day] = [cleanser || step('Cleanser', '', 1), serumStep, moisturizer || step('Moisturizer', '', 3)]
}

function enforceIrritationBudget(plan: WeeklyPlan, nightlyCap: number, minRestNights: number) {
  const warnings = plan.warnings
  warnings.push(`Irritation budget: cap ${nightlyCap}, min rest nights ${minRestNights}`)

  // Count current serum nights and sort days by priority (keep harder actives by default)
  const dayOrder: DayKey[] = ['mon','tue','wed','thu','fri','sat','sun']
  const keepPriority = (tag: ReturnType<typeof serumKeyToTag>): number => {
    switch (tag) {
      case 'retinoids': return 100
      case 'benzoyl_peroxide': return 90
      case 'aha':
      case 'bha': return 80
      case 'azelaic': return 60
      case 'vitamin_c_ascorbic': return 50
      case 'niacinamide': return 40
      case 'peptides': return 30
      default: return 0
    }
  }

  const daysWithSerum = dayOrder.filter(d => plan.pmByDay[d].some(s => s.label === 'Serum'))
  const targetSerumNights = Math.max(0, 7 - minRestNights)
  if (daysWithSerum.length > targetSerumNights) {
    // Build list with tags and priority
    const annotated = daysWithSerum.map(d => {
      const tag = pmSerumTag(plan.pmByDay[d])
      return { day: d, tag, priority: keepPriority(tag) }
    })
    // Drop lowest priority nights first until target reached
    annotated.sort((a, b) => a.priority - b.priority)
    const toDrop = annotated.slice(0, daysWithSerum.length - targetSerumNights)
    for (const drop of toDrop) {
      replacePmSerum(plan, drop.day, undefined)
      warnings.push(`Set rest night on ${drop.day.toUpperCase()} (min rest nights policy)`) 
    }
  }

  // Enforce nightly cap by downgrading or resting
  for (const d of dayOrder) {
    const tag = pmSerumTag(plan.pmByDay[d])
    if (!tag) continue
    const cost = tagCost(tag)
    if (cost <= nightlyCap) continue

    // Try downgrades: retinoid/BPO/exfoliant → azelaic → niacinamide; vitC → niacinamide
    const downgrade = ((): string | undefined => {
      if (nightlyCap >= tagCost('azelaic')) return 'azelaic-acid'
      if (nightlyCap >= tagCost('niacinamide')) return 'niacinamide'
      return undefined
    })()

    if (downgrade) {
      replacePmSerum(plan, d, downgrade)
      warnings.push(`Downgraded PM serum on ${d.toUpperCase()} to ${labelFromKey(downgrade)} to meet irritation cap`)
    } else {
      replacePmSerum(plan, d, undefined)
      warnings.push(`Removed PM serum on ${d.toUpperCase()} to meet irritation cap`)
    }
  }
}
