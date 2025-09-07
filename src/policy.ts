export const THRESHOLDS = {
  allow: 0.4,
  block: 0.8,
} as const;

export const WEIGHTS: Record<string, number> = {
  threat: 1.0,
  self_harm: 1.0,
  sexual_minors: 1.0,
  sexual_violence: 1.0,
  hate: 0.9,
  graphic_violence: 0.8,
  misinformation: 0.75,
  pii: 0.6,
  harassment: 0.55,
  coordinated: 0.5,
  spam: 0.45,
};

export type WeightKey = keyof typeof WEIGHTS;

// category to id mapping (for reporting top category)
export const CATEGORY_MAP: Record<string, string> = {
  threat: "threat",
  self_harm: "self_harm",
  sexual_minors: "sexual_minors",
  sexual_violence: "sexual_violence",
  hate: "hate",
  graphic_violence: "graphic_violence",
  misinformation: "misinformation",
  pii: "pii",
  harassment: "harassment",
  coordinated: "coordinated",
  spam: "spam",
};
