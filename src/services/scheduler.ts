import dayjs from 'dayjs'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc); dayjs.extend(tz)

import { serumKeyToTag } from './ingredientInteractions'
import { PRODUCT_DATABASE } from '../data/productDatabase'

export type RoutineStep = { step: number; label: string; product: string }
export type DayKey = 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'

const ALL_DAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export interface WeeklyPlan {
  am: RoutineStep[] // same for all days
  pmByDay: Record<DayKey, RoutineStep[]>
  warnings: string[]
  nightlyCost?: Record<DayKey, number>
  nightlyActives?: Record<DayKey, string[]>
  nightlyNotes?: Record<DayKey, string[]>
  restNights?: DayKey[]
  budget?: {
    nightlyCap: number
    requiredRestNights: number
    sensitivityScore?: number
  }
  budgetNotes?: string[]
  totalWeeklyCost?: number
}

export interface CustomerView {
  am: RoutineStep[]
  pm: RoutineStep[]
  notes: string[]
  nightlyCost?: number
  nightlyActives?: string[]
}

export interface SchedulerInput {
  cleanser: string
  coreSerumKey: string // engine key e.g. 'adapalene','vitamin-c','niacinamide',...
  coreSerumName?: string
  coreSerumRawName?: string
  secondarySerumKey?: string
  secondarySerumName?: string
  secondarySerumRawName?: string
  moisturizer: string
  sunscreen?: string
  tertiarySerumKey?: string
  tertiarySerumName?: string
  tertiarySerumRawName?: string
  additionalSerums?: Array<{
    key?: string
    name?: string
    rawName?: string
  }>
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
    sensitivityScore?: number
  }
}

function step(label: string, product: string, index: number): RoutineStep {
  return { step: index, label, product }
}

function decideAMSerum(key: string | undefined, flags: SchedulerInput['flags']): string | undefined {
  if (!key) return undefined
  if (flags?.sensitivityBand === 'red') {
  const t = serumKeyToTag(key)
  // Allow only zero-irritant peptides in AM for very sensitive
  return t === 'peptides' ? key : undefined
    }
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

interface SerumMeta {
  key?: string
  name?: string
  rawName?: string
  explicitAm: boolean
  explicitPm: boolean
  tag: ReturnType<typeof serumKeyToTag>
}

function hasExplicitToken(value: string, token: 'AM' | 'PM'): boolean {
  const pattern = new RegExp(`\\b${token}\\b`, 'i')
  return pattern.test(value)
}

function buildSerumMeta(key?: string, name?: string, rawName?: string): SerumMeta {
  const reference = `${rawName || ''} ${name || ''}`.trim()
  return {
    key,
    name,
    rawName,
    explicitAm: reference ? hasExplicitToken(reference, 'AM') : false,
    explicitPm: reference ? hasExplicitToken(reference, 'PM') : false,
    tag: key ? serumKeyToTag(key) : null,
  }
}

function allowInAm(meta: SerumMeta, flags: SchedulerInput['flags']): string | undefined {
  if (!meta.key) return undefined
  if (meta.explicitPm) return undefined
  if (meta.explicitAm) return meta.key
  return decideAMSerum(meta.key, flags)
}

function allowInPm(meta: SerumMeta): string | undefined {
  if (!meta.key) return undefined
  if (meta.explicitAm) return undefined
  if (meta.explicitPm) return meta.key
  return decidePMSerum(meta.key)
}

function serumDisplayName(meta: SerumMeta, key: string): string {
  if (meta.rawName && meta.rawName.trim()) return meta.rawName.trim()
  if (meta.name && meta.name.trim()) return meta.name.trim()
  return labelFromKey(key)
}

// Very lightweight first pass scheduler that obeys key acceptance checks.
export function buildWeeklyPlan(input: SchedulerInput, timeZone = 'Asia/Kolkata'): { plan: WeeklyPlan, customerView: CustomerView } {
  const warnings: string[] = []
  // Honor user's comfort (1..3). We place at most one serum per routine,
  // but comfort determines whether we place any serum at all.
  const serumComfort = Math.max(1, Math.min(3, input.flags?.serumComfort ?? 2))
  const sensitive = !!input.flags?.sensitivity
  const pregnant = !!input.flags?.pregnancy
  const sensBand = input.flags?.sensitivityBand || (sensitive ? 'yellow' : 'green')
  const sensitivityScore = input.flags?.sensitivityScore
  const budget = sensitivityScore !== undefined
    ? { ...getNightlyBudget(Number(sensitivityScore)), sensitivityScore: Number(sensitivityScore) }
    : { ...legacyBudgetFromBand(sensBand), sensitivityScore: undefined }
  const nightlyCap = budget.maxNightlyUnits
  const requiredRestNights = budget.requiredRestNights

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

  const coreMeta = buildSerumMeta(core, input.coreSerumName, input.coreSerumRawName || input.coreSerumName)
  const secondaryMeta = buildSerumMeta(secondary, input.secondarySerumName, input.secondarySerumRawName || input.secondarySerumName)
  const tertiaryMeta = buildSerumMeta(input.tertiarySerumKey, input.tertiarySerumName, input.tertiarySerumRawName || input.tertiarySerumName)
  const additionalMetas = (input.additionalSerums || []).map(item =>
    buildSerumMeta(item.key, item.name, item.rawName || item.name)
  )

  // Build AM baseline: Cleanser -> Serum (optional) -> Moisturizer -> Sunscreen
  const amCoreKey = allowInAm(coreMeta, input.flags)
  const amSecondaryKey = allowInAm(secondaryMeta, input.flags)
  let amSelection: { key: string; meta: SerumMeta } | undefined
  if (coreMeta.explicitAm && amCoreKey) {
    amSelection = { key: amCoreKey, meta: coreMeta }
  } else if (secondaryMeta.explicitAm && amSecondaryKey) {
    amSelection = { key: amSecondaryKey, meta: secondaryMeta }
  } else if (amCoreKey) {
    amSelection = { key: amCoreKey, meta: coreMeta }
  } else if (amSecondaryKey) {
    amSelection = { key: amSecondaryKey, meta: secondaryMeta }
  }

  let am: RoutineStep[] = [
    step('Cleanser', input.cleanser, 1),
  ]
  if (amSelection && serumComfort >= 1) {
    am.push(step('Serum', serumDisplayName(amSelection.meta, amSelection.key), 2))
  }
  am.push(step('Moisturizer', input.moisturizer, 3))
  am.push(step('Sunscreen', input.sunscreen || fallbackSunscreen(), 4))

  const pmCandidatesRaw: Array<{ key?: string; meta: SerumMeta }> = []
  const corePmKey = allowInPm(coreMeta)
  if (corePmKey) pmCandidatesRaw.push({ key: corePmKey, meta: coreMeta })
  const secondaryPmKey = allowInPm(secondaryMeta)
  if (secondaryPmKey) pmCandidatesRaw.push({ key: secondaryPmKey, meta: secondaryMeta })
  const tertiaryPmKey = allowInPm(tertiaryMeta)
  if (tertiaryPmKey) pmCandidatesRaw.push({ key: tertiaryPmKey, meta: tertiaryMeta })
  for (const meta of additionalMetas) {
    if (meta.key) {
      const pmKey = allowInPm(meta)
      if (pmKey) pmCandidatesRaw.push({ key: pmKey, meta })
    } else if ((meta.rawName || meta.name) && (meta.explicitPm || (!meta.explicitAm && serumComfort >= 1))) {
      pmCandidatesRaw.push({ key: undefined, meta })
    }
  }

  const filteredCandidates = pmCandidatesRaw.filter(candidate => {
    if (pregnant && candidate.meta.tag === 'retinoids') return false
    return true
  })

  const pmActives = deriveActiveCandidates(filteredCandidates, new Set())

  const budgetPlan = generateBudgetAwarePmPlan(
    input.cleanser,
    input.moisturizer,
    pmActives,
    { nightlyCap, requiredRestNights },
    serumComfort,
    { allowOverBudgetMargin: pregnant ? 10 : 0 }
  )

  const plan: WeeklyPlan = {
    am,
    pmByDay: budgetPlan.pmByDay,
    warnings,
    nightlyCost: budgetPlan.nightlyCost,
    nightlyActives: budgetPlan.nightlyActives,
    nightlyNotes: budgetPlan.nightlyNotes,
    restNights: budgetPlan.restNights,
    budgetNotes: budgetPlan.budgetNotes,
    totalWeeklyCost: budgetPlan.totalCost,
    budget: {
      nightlyCap,
      requiredRestNights,
      sensitivityScore,
    },
  }

  plan.warnings.push(...budgetPlan.warnings)
  plan.warnings.push(`Irritation budget applied (cap ${nightlyCap}, rest nights ${requiredRestNights}).`)

  if (amHasLAA(am)) {
    const conflicting = pmActives.some(active => active.tag === 'benzoyl_peroxide' || active.tag === 'retinoids')
    if (conflicting) {
      plan.warnings.push('Separated L-ascorbic (AM) from BPO/Retinoid (PM) to avoid conflicts.')
    }
  }

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

function amHasLAA(am: RoutineStep[]): boolean {
  const s = am.find(x => x.label === 'Serum')
  if (!s) return false
  return s.product.includes('Vitamin C') // conservative
}

function buildCustomerView(plan: WeeklyPlan, timeZone: string): CustomerView {
  const today = dayKeyForTz(timeZone)
  const notes: string[] = [...plan.warnings]
  if (plan.budgetNotes) {
    for (const note of plan.budgetNotes) {
      if (!notes.includes(note)) notes.push(note)
    }
  }
  return {
    am: plan.am,
    pm: plan.pmByDay[today],
    notes,
    nightlyCost: plan.nightlyCost?.[today],
    nightlyActives: plan.nightlyActives?.[today],
  }
}

function dayKeyForTz(tzName: string): DayKey {
  const d = dayjs().tz(tzName).day() // 0-6, Sun=0
  const map: Record<number, DayKey> = { 1: 'mon', 2:'tue', 3:'wed', 4:'thu', 5:'fri', 6:'sat', 0:'sun' }
  return map[d]
}

// ---- Irritation budget helpers ----
export function getNightlyBudget(sensitivityScore: number): { maxNightlyUnits: number; requiredRestNights: number } {
  if (sensitivityScore >= 6) return { maxNightlyUnits: 0, requiredRestNights: 7 }
  if (sensitivityScore >= 4) return { maxNightlyUnits: 30, requiredRestNights: 4 }
  if (sensitivityScore >= 2) return { maxNightlyUnits: 70, requiredRestNights: 3 }
  return { maxNightlyUnits: 100, requiredRestNights: 2 }
}

function legacyBudgetFromBand(band: 'green'|'blue'|'yellow'|'red'): { maxNightlyUnits: number; requiredRestNights: number } {
  switch (band) {
    case 'green':
    case 'blue':
      return { maxNightlyUnits: 100, requiredRestNights: 2 }
    case 'yellow':
      return { maxNightlyUnits: 70, requiredRestNights: 3 }
    case 'red':
    default:
      return { maxNightlyUnits: 0, requiredRestNights: 4 }
  }
}

type ActiveCategory =
  | 'retinoid'
  | 'benzoyl_peroxide'
  | 'bha'
  | 'aha'
  | 'azelaic'
  | 'tranexamic'
  | 'vitamin_c_derivative'
  | 'vitamin_c'
  | 'niacinamide'
  | 'hyaluronic'
  | 'ceramide'
  | 'peptide'
  | 'alpha_arbutin'
  | 'unknown'

interface ActiveCostSpec {
  category: ActiveCategory
  keywords: RegExp
  cost: number
  priority: number
}

const ACTIVE_COST_SPECS: ActiveCostSpec[] = [
  { category: 'retinoid', keywords: /(retinoid|retinol|adapalene|tretinoin|differin)/i, cost: 60, priority: 100 },
  { category: 'benzoyl_peroxide', keywords: /(benzoyl\s+peroxide|\bbpo\b)/i, cost: 50, priority: 95 },
  { category: 'bha', keywords: /(bha|salicylic)/i, cost: 60, priority: 85 },
  { category: 'aha', keywords: /(aha|glycolic|lactic|mandelic)/i, cost: 60, priority: 80 },
  { category: 'azelaic', keywords: /(azelaic)/i, cost: 30, priority: 70 },
  { category: 'tranexamic', keywords: /(tranexamic)/i, cost: 20, priority: 55 },
  { category: 'vitamin_c_derivative', keywords: /(derivative|tetrahexyldecyl|ethyl ascorbic|map|sap)/i, cost: 15, priority: 50 },
  { category: 'vitamin_c', keywords: /(vitamin\s*c|ascorbic)/i, cost: 15, priority: 50 },
  { category: 'niacinamide', keywords: /(niacinamide)/i, cost: 10, priority: 45 },
  { category: 'hyaluronic', keywords: /(hyaluronic)/i, cost: 0, priority: 20 },
  { category: 'ceramide', keywords: /(ceramide|barrier\s*cream)/i, cost: 0, priority: 20 },
  { category: 'peptide', keywords: /(peptide|bakuchiol)/i, cost: 0, priority: 25 },
  { category: 'alpha_arbutin', keywords: /(alpha\s*arbutin)/i, cost: 0, priority: 25 },
]

interface ActiveCostResult {
  category: ActiveCategory
  cost: number
  priority: number
}

function costForProductName(name: string | undefined): ActiveCostResult {
  if (!name) return { category: 'unknown', cost: 0, priority: 10 }
  for (const spec of ACTIVE_COST_SPECS) {
    if (spec.keywords.test(name)) {
      return { category: spec.category, cost: spec.cost, priority: spec.priority }
    }
  }
  return { category: 'unknown', cost: 0, priority: 10 }
}

interface ActiveCandidate {
  key?: string
  displayName: string
  rawName?: string
  tag: ReturnType<typeof serumKeyToTag>
  cost: number
  priority: number
  category: ActiveCategory
}

interface ActiveGroup {
  id: string
  actives: ActiveCandidate[]
  cost: number
  exceedsBudget?: boolean
  budgetNote?: string
  maxUses?: number
}

interface BudgetPlan {
  pmByDay: Record<DayKey, RoutineStep[]>
  nightlyCost: Record<DayKey, number>
  nightlyActives: Record<DayKey, string[]>
  nightlyNotes: Record<DayKey, string[]>
  restNights: DayKey[]
  budgetNotes: string[]
  warnings: string[]
  totalCost: number
}

function deriveActiveCandidates(
  candidates: Array<{ key?: string; meta: SerumMeta }>,
  seenKeys: Set<string>
): ActiveCandidate[] {
  const list: ActiveCandidate[] = []
  for (const { key, meta } of candidates) {
    const displayName = meta.key ? serumDisplayName(meta, meta.key) : (meta.rawName || meta.name || '').trim()
    const uniqueKey = (key || displayName).toLowerCase()
    if (!uniqueKey) continue
    if (seenKeys.has(uniqueKey)) continue
    seenKeys.add(uniqueKey)
    const costMeta = costForProductName(displayName || meta.rawName)
    list.push({
      key,
      displayName: displayName || meta.rawName || 'Serum',
      rawName: meta.rawName,
      tag: meta.tag,
      cost: costMeta.cost,
      priority: Math.max(costMeta.priority, meta.tag ? priorityFromTag(meta.tag) : costMeta.priority),
      category: costMeta.category,
    })
  }
  return list
}

function priorityFromTag(tag: ReturnType<typeof serumKeyToTag>): number {
  switch (tag) {
    case 'retinoids': return 100
    case 'benzoyl_peroxide': return 95
    case 'bha': return 85
    case 'aha': return 80
    case 'azelaic': return 70
    case 'tranexamic': return 55
    case 'vitamin_c_ascorbic': return 50
    case 'vitamin_c_derivative': return 45
    case 'niacinamide': return 45
    case 'peptides': return 25
    default: return 10
  }
}

function pickRestNights(required: number): DayKey[] {
  if (required >= 7) return [...ALL_DAYS]
  const preference: DayKey[] = ['sun', 'wed', 'sat', 'tue', 'thu', 'mon', 'fri']
  return preference.slice(0, Math.min(required, preference.length))
}

function buildGroups(
  actives: ActiveCandidate[],
  nightlyCap: number,
  serumComfort: number,
  allowOverBudgetMargin: number
): { groups: ActiveGroup[]; notes: string[] } {
  const groups: ActiveGroup[] = []
  const notes: string[] = []
  const sorted = [...actives].sort((a, b) => b.priority - a.priority)

  sorted.forEach((active, index) => {
    let placed = false
    for (const group of groups) {
      if (group.actives.length >= serumComfort) continue
      const potentialCost = group.cost + active.cost
      if (potentialCost <= nightlyCap || potentialCost <= nightlyCap + allowOverBudgetMargin) {
        group.actives.push(active)
        group.cost = potentialCost
        if (potentialCost > nightlyCap) {
          group.exceedsBudget = true
        }
        placed = true
        break
      }
    }
    if (!placed) {
      const exceeds = active.cost > nightlyCap
      groups.push({
        id: `group-${index}`,
        actives: [active],
        cost: active.cost,
        exceedsBudget: exceeds,
      })
      if (exceeds && nightlyCap > 0) {
        notes.push(`${active.displayName} alone exceeds nightly budget; reducing frequency.`)
      }
    }
  })

  groups.forEach(group => {
    if (group.exceedsBudget) {
      group.maxUses = 3
    }
  })

  return { groups, notes }
}

function trimGroupsByBudget(
  baseActives: ActiveCandidate[],
  nightlyCap: number,
  serumComfort: number,
  allowOverBudgetMargin: number,
  activeNightsAllowed: number
): { groups: ActiveGroup[]; removed: ActiveCandidate[]; notes: string[] } {
  const removed: ActiveCandidate[] = []
  let candidates = [...baseActives].sort((a, b) => b.priority - a.priority)
  let notes: string[] = []
  while (candidates.length) {
    const { groups, notes: groupNotes } = buildGroups(candidates, nightlyCap, serumComfort, allowOverBudgetMargin)
    notes = groupNotes
    if (groups.length <= Math.max(activeNightsAllowed, 1)) {
      return { groups, removed, notes }
    }
    const removedActive = candidates.pop()
    if (removedActive) {
      removed.push(removedActive)
    } else {
      break
    }
  }
  return { groups: [], removed, notes }
}

function generateBudgetAwarePmPlan(
  cleanser: string,
  moisturizer: string,
  actives: ActiveCandidate[],
  budget: { nightlyCap: number; requiredRestNights: number },
  serumComfort: number,
  options: { allowOverBudgetMargin: number }
): BudgetPlan {
  const nightlyCost: Record<DayKey, number> = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
  const nightlyActives: Record<DayKey, string[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
  const nightlyNotes: Record<DayKey, string[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
  const pmByDay: Record<DayKey, RoutineStep[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
  const warnings: string[] = []
  const budgetNotes: string[] = []
  const restNights = new Set<DayKey>(pickRestNights(budget.requiredRestNights))
  const activeNightsAllowed = Math.max(0, ALL_DAYS.length - budget.requiredRestNights)

  if (budget.nightlyCap === 0 || activeNightsAllowed === 0 || actives.length === 0) {
    // All rest nights barrier focus
    ALL_DAYS.forEach(day => {
      pmByDay[day] = emptyPM(cleanser, moisturizer)
      nightlyNotes[day].push('Rest night (barrier repair only)')
    })
    if (budget.nightlyCap === 0) {
      budgetNotes.push('Focus on barrier repair due to very high sensitivity.')
    }
    return {
      pmByDay,
      nightlyCost,
      nightlyActives,
      nightlyNotes,
      restNights: ALL_DAYS,
      budgetNotes,
      warnings,
      totalCost: 0,
    }
  }

  const { groups, removed, notes } = trimGroupsByBudget(
    actives,
    budget.nightlyCap,
    serumComfort,
    options.allowOverBudgetMargin,
    activeNightsAllowed
  )

  if (removed.length) {
    budgetNotes.push(
      `Removed lower-priority actives to meet nightly budget: ${removed
        .map(a => a.displayName)
        .join(', ')}`
    )
  }
  budgetNotes.push(`Nightly irritation cap: ${budget.nightlyCap} units. Required rest nights: ${budget.requiredRestNights}.`)
  budgetNotes.push(...notes)

  const usageCounts = new Map<string, number>()
  const usageLimits = new Map<string, number>()

  groups.forEach(group => {
    usageCounts.set(group.id, 0)
    usageLimits.set(group.id, group.maxUses ?? activeNightsAllowed)
    if (group.exceedsBudget) {
      budgetNotes.push('Alternating high-cost actives to respect sensitivity budget.')
    }
  })

  let totalCost = 0
  const activeSlots = ALL_DAYS.filter(day => !restNights.has(day))
  let groupIndex = 0
  let assignedActiveNights = 0

  for (const day of activeSlots) {
    if (!groups.length || assignedActiveNights >= activeNightsAllowed) {
      restNights.add(day)
      pmByDay[day] = emptyPM(cleanser, moisturizer)
      nightlyNotes[day].push('Rest night (budget allocation).')
      continue
    }

    let selected: ActiveGroup | undefined
    let attempts = 0
    while (attempts < groups.length) {
      const candidate = groups[groupIndex % groups.length]
      groupIndex += 1
      attempts += 1
      const used = usageCounts.get(candidate.id) || 0
      const limit = usageLimits.get(candidate.id) || activeNightsAllowed
      if (used < limit) {
        selected = candidate
        break
      }
    }

    if (!selected) {
      restNights.add(day)
      pmByDay[day] = emptyPM(cleanser, moisturizer)
      nightlyNotes[day].push('Rest night (budget allocation).')
      continue
    }

    usageCounts.set(selected.id, (usageCounts.get(selected.id) || 0) + 1)
    assignedActiveNights += 1

    const activeNames = selected.actives.map(active => active.displayName)
    nightlyActives[day] = activeNames
    nightlyCost[day] = selected.cost
    totalCost += selected.cost

    const steps: RoutineStep[] = []
    steps.push(step('Cleanser', cleanser, 1))
    let nextStepIndex = 2
    selected.actives.forEach((active, idx) => {
      const label = selected.actives.length > 1 ? `Serum ${idx + 1}` : 'Serum'
      steps.push(step(label, active.displayName, nextStepIndex))
      nextStepIndex += 1
    })
    steps.push(step('Moisturizer', moisturizer, nextStepIndex))
    pmByDay[day] = steps
    if (selected.exceedsBudget) {
      nightlyNotes[day].push('Using reduced frequency due to sensitivity (single active exceeds nightly cap).')
    } else if (selected.cost > budget.nightlyCap) {
      nightlyNotes[day].push('Allowed slight budget overage to keep safe pregnancy routine.')
    }
  }

  // Remaining rest nights (including pre-selected ones)
  ALL_DAYS.forEach(day => {
    if (restNights.has(day)) {
      pmByDay[day] = pmByDay[day].length ? pmByDay[day] : emptyPM(cleanser, moisturizer)
      nightlyCost[day] = nightlyCost[day] || 0
      nightlyNotes[day].push('Rest night (cleanser + moisturizer only).')
    }
  })

  return {
    pmByDay,
    nightlyCost,
    nightlyActives,
    nightlyNotes,
    restNights: Array.from(restNights),
    budgetNotes,
    warnings,
    totalCost,
  }
}

