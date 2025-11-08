/**
 * CurrentProductsStep - Product list management with autocomplete
 * Replaces UpdatedConsultForm.tsx step 17 (lines 3452-3541)
 *
 * OLD: ~89 lines with hard-coded styling
 * NEW: ~100 lines with better structure (includes validation)
 */

import React from 'react';
import { FileText, X } from 'lucide-react';
import { FormStep } from '../form';
import { UpdatedConsultData } from '../../types';
import ProductAutocomplete from '../ProductAutocomplete';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

const DURATION_OPTIONS = [
  'Less than 1 month',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2+ years',
];

/**
 * Step 17: Current Products List
 * Pattern: Dynamic array of products with autocomplete and duration selection
 */
export const CurrentProductsStep = React.memo<StepProps>(({
  formData,
  updateFormData,
  errors,
}) => {
  const productsList = formData.currentProductsList || [];

  const handleAddProduct = () => {
    const newProduct = { name: '', duration: '' };
    updateFormData({ currentProductsList: [...productsList, newProduct] });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = productsList.filter((_, i) => i !== index);
    updateFormData({ currentProductsList: updatedProducts });
  };

  const handleUpdateProduct = (index: number, field: 'name' | 'duration', value: string) => {
    const updatedProducts = [...productsList];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    updateFormData({ currentProductsList: updatedProducts });
  };

  return (
    <FormStep
      title="What products are you using daily?"
      subtitle="(cleanser, moisturizer, sunscreen, serum(s), toner, exfoliants, masks, oils)"
      icon={FileText}
      iconVariant="purple"
      centered
    >
      <div className="space-y-6">
        {/* Product List */}
        <div className="space-y-4">
          {productsList.length > 0 ? (
            productsList.map((product, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                {/* Product Name Autocomplete */}
                <div className="flex-1">
                  <ProductAutocomplete
                    value={product.name}
                    onChange={(value) => handleUpdateProduct(index, 'name', value)}
                    placeholder="e.g., CeraVe Foaming Cleanser, The Ordinary Niacinamide..."
                    className="w-full"
                  />
                </div>

                {/* Duration Select */}
                <div className="w-48">
                  <select
                    value={product.duration}
                    onChange={(e) => handleUpdateProduct(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="">How long?</option>
                    {DURATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  type="button"
                  aria-label="Remove product"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No products added yet. Click "Add Product" to start.</p>
            </div>
          )}
        </div>

        {/* Add Product Button */}
        <div className="text-center">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            type="button"
          >
            + Add Product
          </button>
        </div>

        {/* Error Display */}
        {errors.currentProductsList && (
          <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
            <span className="font-medium">⚠</span> {errors.currentProductsList}
          </p>
        )}
      </div>
    </FormStep>
  );
});

/**
 * Code summary:
 *
 * Old implementation (lines 3452-3541): ~89 lines
 * - All logic inline in renderStep
 * - Hard-coded SVG for delete icon
 * - Inconsistent spacing and styling
 * - Purple color hard-coded in multiple places
 *
 * New implementation: ~100 lines (includes helper functions)
 * - Extracted product management logic to named functions
 * - Uses Lucide icon (X) for consistency
 * - Cleaner structure with separate sections
 * - More maintainable and testable
 *
 * Benefits:
 * - Easy to add/modify duration options
 * - Reusable ProductAutocomplete integration
 * - Clear separation of UI and logic
 * - Type-safe product array handling
 */
