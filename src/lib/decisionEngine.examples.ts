// Lightweight, unit-style examples for the RULE_SPECS runtime
// These are illustrative and can be executed from a dev script or a demo page.

import { deriveSelfBands, getFollowUpQuestions, decideBandUpdates, decideAllBandUpdates, RuntimeMachineBands, RuntimeSelfBands } from './decisionEngine'

function exampleSebumMismatch() {
  // machine says oily; user says normal (Green)
  const machine: RuntimeMachineBands = { sebum: 'red', moisture: 'blue', texture: 'blue', pores: 'blue', acne: 'green', pigmentation_brown: 'green', pigmentation_red: 'green' }
  const self: RuntimeSelfBands = { sebum: 'green' }
  const followUps = getFollowUpQuestions(machine, self)
  const sebumRule = followUps.find(f => f.ruleId === 'sebum_machineOily_customerNormal' || f.ruleId === 'sebum_MOily_CNormal')
  const answers = { Q1: 'Yes', Q2: 'Yes', Q3: 'No' } // (Q1=Yes OR Q2=Yes) AND Q3=No => Grease: Red
  const decision = sebumRule ? decideBandUpdates(sebumRule.ruleId, answers) : null
  const { effectiveBands } = decideAllBandUpdates(machine, self, sebumRule ? { [sebumRule.ruleId]: answers } : {})
  return { followUps, decision, effectiveBands }
}

function exampleTextureRoughVsCustomerSmooth() {
  const machine: RuntimeMachineBands = { texture: 'yellow' }
  const self: RuntimeSelfBands = { texture: 'green' }
  const followUps = getFollowUpQuestions(machine, self)
  const txRule = followUps.find(f => f.ruleId === 'texture_machineBumpy_customerSmooth' || f.ruleId === 'texture_MRough_CSmooth')
  const answers = { Q1: 'Cheeks', Q2: 'No', Q3: 'No' } // => Texture: Yellow
  const decision = txRule ? decideBandUpdates(txRule.ruleId, answers) : null
  const { effectiveBands } = decideAllBandUpdates(machine, self, txRule ? { [txRule.ruleId]: answers } : {})
  return { followUps, decision, effectiveBands }
}

function exampleAcneClearVsUserSevere() {
  const machine: RuntimeMachineBands = { acne: 'green' }
  const self: RuntimeSelfBands = { acne: 'red' }
  const followUps = getFollowUpQuestions(machine, self)
  const acneRule = followUps.find(f => f.ruleId === 'acne_machineClear_customerModerateSevere' || f.ruleId === 'acne_MClear_CModerateSevere')
  const answers = { Q1: '>=15', Q2: 'Yes', Q3: '>=20', Q4: 'No', Q5: 'No' } // => Acne: Red, refer-derm
  const decision = acneRule ? decideBandUpdates(acneRule.ruleId, answers) : null
  const { effectiveBands } = decideAllBandUpdates(machine, self, acneRule ? { [acneRule.ruleId]: answers } : {})
  return { followUps, decision, effectiveBands }
}

function examplePigmentationNoneVsUserBrown() {
  const machine: RuntimeMachineBands = { pigmentation_brown: 'blue' }
  const self: RuntimeSelfBands = { pigmentation_brown: 'yellow' }
  const followUps = getFollowUpQuestions(machine, self)
  const rule = followUps.find(f => f.ruleId === 'pigmentation_machineNormal_customerHigh_brown' || f.ruleId === 'pigmentation_machineNormal_customerHigh_brown')
  const answers = {} as Record<string, string>
  const decision = rule ? decideBandUpdates(rule.ruleId, answers) : null
  const { effectiveBands } = decideAllBandUpdates(machine, self, rule ? { [rule.ruleId]: answers } : {})
  return { followUps, decision, effectiveBands }
}

export function runExamples() {
  return {
    sebumMismatch: exampleSebumMismatch(),
    textureRoughVsSmooth: exampleTextureRoughVsCustomerSmooth(),
    acneClearVsSevere: exampleAcneClearVsUserSevere(),
    pigmentationNoneVsUserBrown: examplePigmentationNoneVsUserBrown(),
  }
}

