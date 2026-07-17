export type Role = 'admin' | 'lecturer' | 'advisor' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PredictionResult {
  riskLevel: string;
  riskProbability: number;
  confidence: number;
}
