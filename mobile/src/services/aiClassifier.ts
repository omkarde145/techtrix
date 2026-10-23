import { StageType } from '../types';

export interface AiVisionResult {
  predictedStage: StageType;
  confidence: number;
  matchesExpected: boolean;
  detectedFeatures: string[];
  recommendation: 'PROCEED' | 'STAGE_MISMATCH_WARNING' | 'RETAKE_IMAGE';
}

const STAGE_FEATURES: Record<StageType, string[]> = {
  registration: ['Open plot terrain', 'Cadastral boundary marker', 'Ground leveling'],
  foundation: ['Soil excavation trench', 'Rubble stone soling', 'PCC foundation layer'],
  plinth: ['Damp proof course (DPC)', 'Plinth beam concrete', 'Brickwork to plinth level'],
  lintel: ['Superstructure masonry', 'Door/window frames', 'Reinforced lintel chajja band'],
  roof: ['Centering shuttering', 'Reinforced cement concrete (RCC) slab', 'Roof curing ponding'],
  completed: ['External plastering', 'Doors/windows fitted', 'MoRD logo plaque fixed', 'White wash coat']
};

export const AiClassifierService = {
  classifyImage(expectedStage: StageType, hasImage: boolean): AiVisionResult {
    if (!hasImage) {
      return {
        predictedStage: expectedStage,
        confidence: 0,
        matchesExpected: false,
        detectedFeatures: [],
        recommendation: 'RETAKE_IMAGE'
      };
    }

    // 92% chance it matches expected stage with high confidence, 8% realistic edge flag
    const matches = Math.random() > 0.08;
    const predictedStage = matches ? expectedStage : (expectedStage === 'roof' ? 'lintel' : expectedStage);
    const confidence = matches ? Number((0.89 + Math.random() * 0.09).toFixed(2)) : 0.61;
    const detectedFeatures = STAGE_FEATURES[predictedStage] || [];

    return {
      predictedStage,
      confidence,
      matchesExpected: matches,
      detectedFeatures,
      recommendation: matches ? 'PROCEED' : 'STAGE_MISMATCH_WARNING'
    };
  }
};
