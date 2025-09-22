import { generateRecommendations } from '../src/services/recommendationEngine';

function print(title: string, obj: any) {
  console.log(`\n=== ${title} ===`)
  console.log(JSON.stringify(obj, null, 2))
}

async function main() {
  const context: any = {
    skinType: 'Combination',
    effectiveBands: {
      moisture: 'green',
      sebum: 'yellow',
      acne: 'yellow',
      pores: 'green',
      texture: 'green',
      pigmentation: 'green',
      pigmentation_brown: 'green',
      pigmentation_red: 'green',
      sensitivity: 'red',
    },
    acneCategories: ['Inflammatory acne'],
    decisions: [],
    formData: {
      name: 'Test User',
      skinType: 'Combination',
      mainConcerns: ['Acne Management', 'Sebum Control'],
      pregnancy: 'No',
      pregnancyBreastfeeding: 'No',
      sensitivity: 'Yes',
      pigmentationType: 'None',
      recentIsotretinoin: 'No',
      severeCysticAcne: 'No',
      allergies: '',
      barrierStressHigh: 'No',
      serumComfort: '2',
    },
  }

  const reco = generateRecommendations(context)
  print('Primary', { primaryConcern: reco.primaryConcern, serumCount: reco.serumCount })
  if (reco.schedule) {
    print('AM', reco.schedule.am)
    print('PM Today', reco.schedule.customerView.pm)
    print('Warnings', reco.schedule.warnings)
  } else {
    console.log('No schedule produced')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
