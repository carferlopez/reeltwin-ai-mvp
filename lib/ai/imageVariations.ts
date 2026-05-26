import { generateWithFalFlux } from './providers/fal';

export interface VariationRequest {
  sourceImageUrl: string;
  styleKey: string;
  userDescription?: string;
  count?: number; // default 3
}

export interface VariationResult {
  imageUrls: string[];
  model: string;
  costUsd: number;
  durationMs: number;
}

export async function generateImageVariations(
  req: VariationRequest
): Promise<VariationResult> {
  // Single swap point — change provider here without touching the endpoint
  return generateWithFalFlux({ ...req, count: req.count ?? 3 });
}
