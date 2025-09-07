import RULE_SPECS, { DecisionRuleSpec, QuestionSpec, Band, Category } from './decisionRules'

export type MachineBands = {
  moisture?: Band
  sebum?: Band
  texture?: Band
  pores?: Band
  acne?: Band
  pigmentation_brown?: Band
  pigmentation_red?: Band
}

export type SelfBands = {
  moisture?: Band
  sebum?: Band
  texture?: Band
  pores?: Band
  acne?: Band
  pigmentation_brown?: Band
  pigmentation_red?: Band
}

export type Context = {
  dateOfBirth?: string // YYYY-MM-DD
  age?: number // optional direct age override
}

export type RuleQuestionSet = {
  ruleId: string
  category: Category
  dimension?: 'brown' | 'red'
  questions: QuestionSpec[]
}

export type BandUpdates = Partial<MachineBands>

function getCategoryMachineBand(cat: Category, machine: MachineBands, dim?: 'brown' | 'red'): Band | undefined {
  switch (cat) {
    case 'Moisture': return machine.moisture
    case 'Grease': return machine.sebum
    case 'Texture': return machine.texture
    case 'Pores': return machine.pores
    case 'Acne': return machine.acne
    case 'Pigmentation':
      return dim === 'red' ? machine.pigmentation_red : machine.pigmentation_brown
    case 'Sensitivity':
      return undefined
  }
}

function getCategorySelfBand(cat: Category, self: SelfBands, dim?: 'brown' | 'red'): Band | undefined {
  switch (cat) {
    case 'Moisture': return self.moisture
    case 'Grease': return self.sebum
    case 'Texture': return self.texture
    case 'Pores': return self.pores
    case 'Acne': return self.acne
    case 'Pigmentation':
      return dim === 'red' ? self.pigmentation_red : self.pigmentation_brown
    case 'Sensitivity':
      return undefined
  }
}

export function getFollowUpQuestions(machine: MachineBands, self: SelfBands): RuleQuestionSet[] {
  // Return all matching rules (with or without questions). The caller/UI can decide
  // to render only those having questions, while the engine may auto-apply no-question ones.
  const results: RuleQuestionSet[] = []
  for (const rule of RULE_SPECS) {
    const mBand = getCategoryMachineBand(rule.category, machine, rule.dimension)
    const cBand = getCategorySelfBand(rule.category, self, rule.dimension)
    if (!mBand || !cBand) continue
    if (!rule.machineInput.includes(mBand)) continue
    if (!rule.customerInput.includes(cBand)) continue
    results.push({
      ruleId: rule.id,
      category: rule.category,
      dimension: rule.dimension,
      questions: rule.questions || [],
    })
  }
  return results
}

// -------------- Outcome evaluation (lightweight string matcher) --------------

function ageFromDOB(dob?: string): number | undefined {
  if (!dob) return undefined
  const d = new Date(dob + 'T00:00:00')
  if (isNaN(d.getTime())) return undefined
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

function normalize(str: string): string {
  return str.trim().toLowerCase()
}

function includesAny(hay: string, needles: string[]): boolean {
  const H = normalize(hay)
  return needles.some(n => H.includes(normalize(n)))
}

// Map certain ordinal answers to numeric approximations for comparisons
function mapOrdinal(value: string): number | undefined {
  const v = normalize(value)
  if (v === 'never') return 0
  if (v.includes('1–2x') || v.includes('1-2x')) return 2
  if (v.includes('>=3x') || v.includes('≥3x') || v.includes('3x')) return 3
  // comedone counts
  if (v === 'none') return 0
  if (v.startsWith('<10')) return 5
  if (v.includes('10–20') || v.includes('10-20')) return 15
  if (v.startsWith('>=20') || v.startsWith('≥20')) return 20
  // inflamed pimples buckets
  if (v === '1–5' || v === '1-5') return 5
  if (v === '6–15' || v === '6-15') return 15
  if (v === '>=15' || v === '≥15') return 15
  if (v === 'several') return 6 // rough bucket
  return undefined
}

function compareValue(ans: string | string[] | undefined, op: string, rhsRaw: string): boolean {
  if (ans === undefined) return false
  if (Array.isArray(ans)) {
    // for includes/excludes
    const arr = ans.map(String)
    if (op === 'includes') {
      const tokens = rhsRaw.split('/').map(s => s.trim()).filter(Boolean)
      return arr.some(a => includesAny(a, tokens))
    }
    if (op === 'excludes') {
      const tokens = rhsRaw.split('/').map(s => s.trim()).filter(Boolean)
      return !arr.some(a => includesAny(a, tokens))
    }
    // equality on array: true if any matches
    if (op === '=') {
      const rhs = rhsRaw
      return arr.some(a => normalize(a) === normalize(rhs))
    }
    return false
  }
  const lhs = String(ans)
  const lhsN = mapOrdinal(lhs)
  const rhs = rhsRaw.trim()
  const rhsN = /^[<>]=?\s*\d+/.test(rhs) ? parseInt(rhs.replace(/[^0-9-]/g, ''), 10) : mapOrdinal(rhs)

  switch (op) {
    case '=':
      return normalize(lhs) === normalize(rhs)
    case '>=':
      if (lhsN !== undefined && rhsN !== undefined) return lhsN >= rhsN
      return normalize(lhs) === normalize(rhs)
    case '<=':
      if (lhsN !== undefined && rhsN !== undefined) return lhsN <= rhsN
      return normalize(lhs) === normalize(rhs)
    case '>':
      if (lhsN !== undefined && rhsN !== undefined) return lhsN > rhsN
      return false
    case '<':
      if (lhsN !== undefined && rhsN !== undefined) return lhsN < rhsN
      // also support textual like '<10'
      return normalize(lhs).startsWith(normalize(rhs))
    case 'includes':
      return includesAny(lhs, rhs.split('/').map(s => s.trim()))
    case 'excludes':
      return !includesAny(lhs, rhs.split('/').map(s => s.trim()))
    default:
      return false
  }
}

function evalClause(answers: Record<string, string | string[]>, clause: string, ctx?: Context): boolean {
  const s = clause.trim()
  if (s === '—' || s === '-' || s.toLowerCase() === 'true') return true
  // age conditions e.g., 'age > 35'
  const ageMatch = s.match(/^age\s*([<>]=?)\s*(\d+)$/i)
  if (ageMatch) {
    const op = ageMatch[1] || '>'
    const n = parseInt(ageMatch[2], 10)
    const age = ctx?.age ?? ageFromDOB(ctx?.dateOfBirth) ?? 0
    switch (op) {
      case '>=': return age >= n
      case '<=': return age <= n
      case '>': return age > n
      case '<': return age < n
      default: return age > n
    }
  }
  // patterns like Q2=Yes, Q1 in {A,B}, Q4 includes X/Y
  const inMatch = s.match(/^(Q\d+)\s+in\s+\{([^}]+)\}$/i)
  if (inMatch) {
    const q = inMatch[1]
    const set = inMatch[2].split(',').map(t => t.trim())
    const a = answers[q]
    if (Array.isArray(a)) return a.some(v => set.some(x => normalize(v) === normalize(x)))
    if (typeof a === 'string') return set.some(x => normalize(a) === normalize(x))
    return false
  }
  const incMatch = s.match(/^(Q\d+)\s+(includes|excludes)\s+(.+)$/i)
  if (incMatch) {
    const q = incMatch[1]
    const op = incMatch[2].toLowerCase()
    const rhs = incMatch[3].trim()
    return compareValue(answers[q], op, rhs)
  }
  const cmpMatch = s.match(/^(Q\d+)\s*(>=|<=|=|>|<)\s*(.+)$/i)
  if (cmpMatch) {
    const q = cmpMatch[1]
    const op = cmpMatch[2]
    const rhs = cmpMatch[3]
    return compareValue(answers[q], op, rhs)
  }
  return false
}

function evalWhenExpr(expr: string, answers: Record<string, string | string[]>, ctx?: Context): boolean {
  // Support AND/OR with left-to-right eval and AND precedence over OR
  const orParts = expr.split(/\s+OR\s+/i)
  for (const orPart of orParts) {
    const andParts = orPart.split(/\s+AND\s+/i)
    const allAnd = andParts.every(p => evalClause(answers, p, ctx))
    if (allAnd) return true
  }
  return false
}

function parseUpdateToken(token: string): { key: keyof MachineBands; band: Band } | null {
  const [left, right] = token.split(':').map(s => s.trim())
  if (!left || !right) return null
  const band = right.toLowerCase() as Band
  const k = left.toLowerCase()
  if (k.startsWith('moisture')) return { key: 'moisture', band }
  if (k.startsWith('grease') || k.startsWith('sebum') || k.startsWith('oil')) return { key: 'sebum', band }
  if (k.startsWith('texture')) return { key: 'texture', band }
  if (k.startsWith('pores')) return { key: 'pores', band }
  if (k.startsWith('acne')) return { key: 'acne', band }
  if (k.includes('pigmentation') && k.includes('brown')) return { key: 'pigmentation_brown', band }
  if (k.includes('pigmentation') && k.includes('red')) return { key: 'pigmentation_red', band }
  return null
}

export function decideBandUpdates(ruleId: string, answers: Record<string, string | string[]>, ctx?: Context): { updates: BandUpdates; verdict?: string; flags?: string[] } | null {
  const rule = RULE_SPECS.find(r => r.id === ruleId)
  if (!rule) return null
  const outs = rule.outcomes || []
  for (const out of outs) {
    const w = out.when || '—'
    if (evalWhenExpr(w, answers, ctx)) {
      const updates: BandUpdates = {}
      for (const u of (out.updates || [])) {
        const parsed = parseUpdateToken(u)
        if (parsed) updates[parsed.key] = parsed.band
      }
      return { updates, verdict: out.verdict, flags: out.flags }
    }
  }
  return null
}

// Convenience: run decision per all matching rules, aggregating updates
export function decideAllBandUpdates(
  machine: MachineBands,
  self: SelfBands,
  answersByRuleId: Record<string, Record<string, string | string[]>>,
  ctx?: Context
): { updates: BandUpdates; perRule: Record<string, { updates: BandUpdates; verdict?: string; flags?: string[] } | null> } {
  const questions = getFollowUpQuestions(machine, self)
  const perRule: Record<string, { updates: BandUpdates; verdict?: string; flags?: string[] } | null> = {}
  const updates: BandUpdates = {}
  for (const qset of questions) {
    const decision = decideBandUpdates(qset.ruleId, answersByRuleId[qset.ruleId] || {}, ctx)
    perRule[qset.ruleId] = decision
    if (decision?.updates) {
      Object.assign(updates, decision.updates)
    }
  }
  return { updates, perRule }
}
