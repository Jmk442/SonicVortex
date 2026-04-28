// All frequencies in Hz
export const SUB_BASS_FREQ = 40;
export const FOCUS_BINAURAL_BASE = 300;
export const FOCUS_BINAURAL_DIFF = 40;

export const OSCILLATING_BINAURAL_BASE = 200;
export const OSCILLATING_BINAURAL_DIFF_START = 7.8;
export const OSCILLATING_BINAURAL_DIFF_END = 8.3;
// A full sweep cycle for the oscillating binaural beat
export const OSCILLATING_BINAURAL_PERIOD_S = 10; // Shortened for more obvious visual feedback

export const WILSONIC_SCALES: Record<string, { name: string; ratios: number[] }> = {
  hexany: {
    name: "Hexany (Consonant)",
    ratios: [1/1, 9/8, 5/4, 3/2, 5/3, 7/4], // Just intonation major scale with a harmonic 7th
  },
  eikosany: {
    name: "Eikosany (Complex)",
    // A subset of a 20-tone Eikosany scale for melodic potential
    ratios: [1/1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8],
  },
  pelog: {
    name: "Pelog (Ceremonial)",
    // A representation of a common Pelog tuning
    ratios: [1/1, 256/243, 6/5, 4/3, 3/2, 8/5, 16/9]
  },
  diatomic: {
    name: "Diatomic (Pure)",
    ratios: [1/1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8] // Classic Just Intonation Major
  }
};

export interface FrequencyPreset {
  name: string;
  frequency: number;
  description: string;
}

export const FREQUENCY_CATEGORIES: Record<string, { name: string; presets: FrequencyPreset[] }> = {
  solfeggio: {
    name: "Solfeggio (Healing)",
    presets: [
      { name: "174 Hz", frequency: 174, description: "Pain relief and safety" },
      { name: "285 Hz", frequency: 285, description: "Tissue repair and organs" },
      { name: "396 Hz", frequency: 396, description: "Liberating Guilt and Fear" },
      { name: "417 Hz", frequency: 417, description: "Undoing Situations and Facilitating Change" },
      { name: "528 Hz", frequency: 528, description: "Transformation and DNA Repair (Miracle)" },
      { name: "639 Hz", frequency: 639, description: "Connecting and Relationships" },
      { name: "741 Hz", frequency: 741, description: "Expression and Solutions" },
      { name: "852 Hz", frequency: 852, description: "Returning to Spiritual Order" },
      { name: "963 Hz", frequency: 963, description: "Pure Spirit / Divine Connection" },
    ],
  },
  meditation: {
    name: "Meditation & Mind",
    presets: [
      { name: "110 Hz", frequency: 110, description: "Stomach healing and deep grounding" },
      { name: "136.1 Hz", frequency: 136.1, description: "OM Frequency (Earth year)" },
      { name: "432 Hz", frequency: 432, description: "Nature's Resonance / Universal Harmony" },
      { name: "125.28 Hz", frequency: 125.28, description: "Schumann Resonance Octave (Earth's Pulse)" },
    ],
  },
  manifestation: {
    name: "Manifestation & Flow",
    presets: [
      { name: "1.1 Hz", frequency: 17.6, description: "Deep connection to origin (octave shifted)" },
      { name: "317.83 Hz", frequency: 317.83, description: "Bio-field resonance" },
      { name: "528 Hz", frequency: 528, description: "The Love Frequency / Manifesting Miracles" },
      { name: "888 Hz", frequency: 888, description: "Abundance and Infinite Flow" },
    ],
  },
  wellness: {
    name: "Wellness & Life",
    presets: [
      { name: "40 Hz", frequency: 40, description: "Brain Focus / Gamma Waves" },
      { name: "70 Hz", frequency: 70, description: "Physical wellness and clarity" },
      { name: "432 Hz", frequency: 432, description: "Deep Clarity / Universal Tuning" },
      { name: "256 Hz", frequency: 256, description: "Root Chakra / Scientific Tuning" },
    ]
  }
};

export const FEELING_MAPPINGS: Record<string, { label: string; baseFreq: number; scale: string }> = {
  anxious: { label: "I feel anxious", baseFreq: 174, scale: "hexany" },
  tired: { label: "I feel tired", baseFreq: 40, scale: "diatomic" },
  disconnected: { label: "I feel disconnected", baseFreq: 963, scale: "eikosany" },
  stressed: { label: "I feel stressed", baseFreq: 528, scale: "hexany" },
  restless: { label: "I feel restless", baseFreq: 396, scale: "pelog" },
  creative: { label: "I want to be creative", baseFreq: 852, scale: "eikosany" },
};

export const JOURNEY_DURATIONS = [
  { label: "3 min", value: 180 },
  { label: "6 min", value: 360 },
  { label: "9 min", value: 540 },
  { label: "12 min", value: 720 },
  { label: "15 min", value: 900 },
  { label: "30 min", value: 1800 },
];

export const INHALE_DURATION = 4;
export const EXHALE_DURATION = 5;
