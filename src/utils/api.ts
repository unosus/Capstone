import type { BuildInput } from '../types/pc';

// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default API_BASE;

export interface PartDetail {
  category: string;
  name: string;
  price: number;
  brand: string;
  specSummary: string;
}

export interface Recommendation {
  rankName: string;
  totalEstimatedPrice: number;
  parts: PartDetail[];
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
}

export async function fetchRecommendations(input: BuildInput): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE}/api/estimates/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usage: input.purpose,
      budget: parseInt(input.budget),
      preference: input.brands.length > 0 ? input.brands[0].toUpperCase() : null,
    }),
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status}`);
  }

  return response.json();
}