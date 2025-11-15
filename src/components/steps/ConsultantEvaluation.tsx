import React from 'react';
import { StepProps } from '../../types';
import { FormStep } from '../form/FormStep';

interface EvaluationSection {
  title: string;
  checkboxes: { id: string; label: string }[];
  classification: { id: string; label: string }[];
}

const ConsultantEvaluation: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const sections: EvaluationSection[] = [
    {
      title: "Acne Evaluation",
      checkboxes: [
        { id: "acne_occasional", label: "1–2 occasional pimples only" },
        { id: "acne_multiple", label: "3+ visible active pimples" },
        { id: "acne_whiteheads", label: "Pus-filled acne (whiteheads)" },
        { id: "acne_papules", label: "Red bumps (papules)" },
        { id: "acne_cysts", label: "Deep, painful acne (cysts)" },
        { id: "acne_fungal", label: "Small itchy bumps = possible fungal acne" }
      ],
      classification: [
        { id: "acne_mild", label: "Mild" },
        { id: "acne_moderate", label: "Moderate" },
        { id: "acne_cystic", label: "Cystic" },
        { id: "acne_fungal", label: "Fungal" }
      ]
    },
    {
      title: "Pigmentation",
      checkboxes: [
        { id: "pig_brown", label: "Brown patches/spots" },
        { id: "pig_pih", label: "Redness left after acne" },
        { id: "pig_rosacea", label: "Flushed cheeks (possible rosacea)" }
      ],
      classification: [
        { id: "pig_class_brown", label: "Brown" },
        { id: "pig_class_red", label: "Red" },
        { id: "pig_class_mixed", label: "Mixed" }
      ]
    },
    {
      title: "Texture",
      checkboxes: [
        { id: "texture_bumpy", label: "Bumpy skin" },
        { id: "texture_uneven", label: "Uneven tone" },
        { id: "texture_rough", label: "Rough/dry feel" },
        { id: "texture_aging", label: "Aging lines" },
        { id: "texture_buildup", label: "Visible product buildup" }
      ],
      classification: [
        { id: "texture_class_bumpy", label: "Bumpy" },
        { id: "texture_class_aging", label: "Aging texture" },
        { id: "texture_class_barrier", label: "Barrier texture" }
      ]
    },
    {
      title: "Sensitivity / Redness",
      checkboxes: [
        { id: "sens_reactive", label: "Reactive to facials or actives" },
        { id: "sens_red", label: "Skin red, warm, itchy" },
        { id: "sens_thin", label: "Thin skin / history of barrier damage" },
        { id: "sens_rosacea", label: "Red cheeks or nose (possibly rosacea)" }
      ],
      classification: [
        { id: "sens_class_sensitive", label: "Sensitive" },
        { id: "sens_class_reactive", label: "Redness/Reactive" },
        { id: "sens_class_barrier", label: "Barrier Damage" }
      ]
    }
  ];

  const unsuitableProducts = [
    { id: "unsuitable_niacinamide", label: "Niacinamide" },
    { id: "unsuitable_vitaminc", label: "Vitamin C" },
    { id: "unsuitable_sa", label: "Salicylic Acid" },
    { id: "unsuitable_ga", label: "Glycolic Acid" },
    { id: "unsuitable_la", label: "Lactic Acid" },
    { id: "unsuitable_retinol", label: "Retinol / Adapalene" },
    { id: "unsuitable_aa", label: "Azelaic Acid" },
    { id: "unsuitable_ka", label: "Kojic Acid" },
    { id: "unsuitable_peptides", label: "Peptides" }
  ];

  const handleCheckboxChange = (sectionId: string, checkboxId: string, checked: boolean) => {
    const currentChecked = formData.evaluation?.[sectionId]?.checked || [];
    const newChecked = checked
      ? [...currentChecked, checkboxId]
      : currentChecked.filter((id: string) => id !== checkboxId);

    updateFormData({
      evaluation: {
        ...formData.evaluation,
        [sectionId]: {
          ...formData.evaluation?.[sectionId],
          checked: newChecked
        }
      }
    });
  };

  const handleClassificationChange = (sectionId: string, classificationId: string) => {
    updateFormData({
      evaluation: {
        ...formData.evaluation,
        [sectionId]: {
          ...formData.evaluation?.[sectionId],
          classification: classificationId
        }
      }
    });
  };
  const handleUnsuitableProductChange = (productId: string, checked: boolean) => {
    const currentProducts = formData.evaluation?.unsuitable_products || [];
    const newProducts = checked
      ? [...currentProducts, productId]
      : currentProducts.filter((id: string) => id !== productId);
    updateFormData({
      evaluation: {
        ...formData.evaluation,
        unsuitable_products: newProducts
      }
    });
  };

  return (
    <FormStep
      title="Consultant Evaluation"
      onNext={onNext}
      onBack={onBack}
      isValid={true}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-rose-300">🔸</span>
              {section.title}
            </h3>
            
            <div className="space-y-3">
              {section.checkboxes.map((checkbox) => (
                <label key={checkbox.id} className="flex items-center gap-3 text-white/90 hover:text-white">
                  <input
                    type="checkbox"
                    checked={formData.evaluation?.[section.title.toLowerCase()]?.checked?.includes(checkbox.id) || false}
                    onChange={(e) => handleCheckboxChange(section.title.toLowerCase(), checkbox.id, e.target.checked)}
                    className="form-checkbox h-5 w-5 rounded border-white/20 bg-white/10 text-rose-500 focus:ring-rose-500"
                  />
                  <span>{checkbox.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-white/80 mb-2">Classification:</p>
              <div className="flex flex-wrap gap-3">
                {section.classification.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-white/90 hover:text-white">
                    <input
                      type="radio"
                      name={`classification_${section.title}`}
                      value={item.id}
                      checked={formData.evaluation?.[section.title.toLowerCase()]?.classification === item.id}
                      onChange={() => handleClassificationChange(section.title.toLowerCase(), item.id)}
                      className="form-radio h-4 w-4 border-white/20 bg-white/10 text-rose-500 focus:ring-rose-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Unsuitable Products Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-rose-300">🔸</span>
            Products not suited by customer earlier
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {unsuitableProducts.map((product) => (
              <label key={product.id} className="flex items-center gap-3 text-white/90 hover:text-white">
                <input
                  type="checkbox"
                  checked={formData.evaluation?.unsuitable_products?.includes(product.id) || false}
                  onChange={(e) => handleUnsuitableProductChange(product.id, e.target.checked)}
                  className="form-checkbox h-5 w-5 rounded border-white/20 bg-white/10 text-rose-500 focus:ring-rose-500"
                />
                <span>{product.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </FormStep>
  );
};

export default ConsultantEvaluation; 