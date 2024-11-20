import React from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useWindRatingForm } from '@/hooks/useWindRatingForm';
import { SHIELDING_CLASSES } from '@/lib/constants';
import type { TerrainCategory, TopographicClass, ShieldingClass } from '@/lib/types';

interface WindRatingFormProps {
  initialTerrainCategory?: TerrainCategory;
  initialTopography?: TopographicClass;
  initialShielding?: ShieldingClass;
  onCalculate: (formData: any) => void;
  isCalculating?: boolean;
  onFormChange?: (formData: any) => void;
  originalTerrainCategory?: TerrainCategory;
}

export function WindRatingForm({
  initialTerrainCategory,
  initialTopography,
  initialShielding,
  onCalculate,
  isCalculating,
  onFormChange,
  originalTerrainCategory
}: WindRatingFormProps) {
  const { formData, updateField, setCoastalAdjustment, coastalAdjustment } = useWindRatingForm({
    initialTerrainCategory,
    initialTopography,
    initialShielding,
    onFormChange,
    originalTerrainCategory
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terrainCategory || !formData.topography || !formData.shielding) {
      return;
    }
    onCalculate(formData);
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    updateField(field, value);
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    // Only calculate if all required fields are present
    if (newFormData.terrainCategory && newFormData.topography && newFormData.shielding) {
      onCalculate(newFormData);
    }
  };

  const showCoastalAdjustment = originalTerrainCategory && 
    initialTerrainCategory && 
    originalTerrainCategory !== initialTerrainCategory;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          Terrain Category
        </label>
        {showCoastalAdjustment && (
          <div className="mb-2">
            <label className="flex items-center gap-2 text-sm text-amber-600">
              <input
                type="checkbox"
                checked={coastalAdjustment}
                onChange={(e) => {
                  setCoastalAdjustment(e.target.checked);
                  // Recalculate with new coastal adjustment
                  onCalculate({
                    ...formData,
                    coastalAdjustment: e.target.checked
                  });
                }}
                className="rounded border-amber-500 text-amber-600 focus:ring-amber-500"
              />
              <Info className="h-4 w-4" />
              <span>
                Apply coastal proximity adjustment 
                (changes {originalTerrainCategory} to {initialTerrainCategory})
              </span>
            </label>
          </div>
        )}
        <Select 
          value={formData.terrainCategory}
          onChange={(e) => handleFieldChange('terrainCategory', e.target.value as TerrainCategory)}
          className="w-full"
        >
          <option value="">Select category...</option>
          <option value="TC1">TC1 - Open and Unobstructed</option>
          <option value="TC2">TC2 - Open Terrain – Scattered Obstructions</option>
          <option value="TC2.5">TC2.5 - Intermediate Terrain – Transition Zone</option>
          <option value="TC3">TC3 - Suburban Terrain – Built-Up Areas</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Shielding
        </label>
        <Select 
          value={formData.shielding}
          onChange={(e) => handleFieldChange('shielding', e.target.value as ShieldingClass)}
          className="w-full"
        >
          <option value="">Select shielding...</option>
          {Object.entries(SHIELDING_CLASSES).map(([key, value]) => (
            <option key={key} value={key}>
              {key} - {value.name} ({value.description})
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Topography
        </label>
        <Select 
          value={formData.topography}
          onChange={(e) => handleFieldChange('topography', e.target.value as TopographicClass)}
          className="w-full"
        >
          <option value="">Select topography...</option>
          <option value="T0">T0 - Flat land</option>
          <option value="T1">T1 - Gentle slope</option>
          <option value="T2">T2 - Hill crest</option>
          <option value="T3">T3 - Steep slope</option>
          <option value="T4">T4 - Ridge crest</option>
          <option value="T5">T5 - Extreme slope</option>
        </Select>
      </div>

      <Button 
        type="submit"
        disabled={!formData.terrainCategory || !formData.shielding || !formData.topography || isCalculating}
        className="w-full"
      >
        {isCalculating ? 'Calculating...' : 'Calculate Wind Rating'}
      </Button>
    </form>
  );
}