export interface CognitiveDistortion {
  id: string;
  label: string;
  description: string;
  evidencePrompt: string;
  alternativePrompt: string;
}

export interface SocraticQuestion {
  id: string;
  question: string;
  purpose: string; // challenge | reframe | explore
}

export interface CBTAnalysisResult {
  distortions: CognitiveDistortion[];
  questions: SocraticQuestion[];
  summary: string;
  suggestion: string;
  generatedAt: number;
}
