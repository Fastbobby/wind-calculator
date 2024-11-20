import { useState, useEffect } from 'react';
import type { TerrainCategory, TopographicClass, ShieldingClass } from '@/lib/types';

interface WindRatingFormState {
  terrainCategory: TerrainCategory | '';
  shielding: ShieldingClass | '';
  topography: TopographicClass | '';
}

interface WindRatingFormProps {
  initialTerrainCategory?: TerrainCategory;
  initialTopography?: TopographicClass;
  initialShielding?: ShieldingClass;
  onFormChange?: (data: WindRatingFormState) => void;
  originalTerrainCategory?: TerrainCategory;
}

export function useWindRatingForm({
  initialTerrainCategory,
  initialTopography,
  initialShielding,
  onFormChange,
  originalTerrainCategory
}: WindRatingFormProps = {}) {
  const [formData, setFormData] = useState<WindRatingFormState>({
    terrainCategory: initialTerrainCategory || '',
    shielding: initialShielding || '',
    topography: initialTopography || ''
  });

  const [coastalAdjustment, setCoastalAdjustment] = useState(
    Boolean(originalTerrainCategory && initialTerrainCategory && originalTerrainCategory !== initialTerrainCategory)
  );

  useEffect(() => {
    if (coastalAdjustment && initialTerrainCategory) {
      setFormData(prev => ({
        ...prev,
        terrainCategory: initialTerrainCategory
      }));
    } else if (!coastalAdjustment && originalTerrainCategory) {
      setFormData(prev => ({
        ...prev,
        terrainCategory: originalTerrainCategory
      }));
    }
  }, [coastalAdjustment, initialTerrainCategory, originalTerrainCategory]);

  useEffect(() => {
    if (initialTopography) {
      setFormData(prev => ({
        ...prev,
        topography: initialTopography
      }));
    }
  }, [initialTopography]);

  useEffect(() => {
    if (initialShielding) {
      setFormData(prev => ({
        ...prev,
        shielding: initialShielding
      }));
    }
  }, [initialShielding]);

  const updateField = (field: keyof WindRatingFormState, value: string) => {
    const newData = {
      ...formData,
      [field]: value
    };
    setFormData(newData);
    onFormChange?.(newData);
  };

  return {
    formData,
    updateField,
    coastalAdjustment,
    setCoastalAdjustment
  };
}