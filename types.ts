
export enum SoundscapePhase {
  INCEPTION = 'INCEPTION',
  DESCENT = 'DESCENT',
  SINGULARITY = 'SINGULARITY',
  EMERGENCE = 'EMERGENCE',
}

export type UserFeeling = 'anxious' | 'tired' | 'disconnected' | 'stressed' | 'restless' | 'creative';

export interface JourneySettings {
  duration: number; // in seconds
  baseFrequency: number;
  scaleName: string;
  harmonicMix: number;
  spatialSpread: number;
}
