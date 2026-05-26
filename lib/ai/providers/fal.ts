import { fal } from '@fal-ai/client';
import { CINEMATIC_STYLES } from '@/config/styles';
import type { VariationRequest, VariationResult } from '../imageVariations';

// Lazy config — avoids module-level side effects during Vercel static analysis
function getFalClient() {
  fal.config({ credentials: process.env.FAL_KEY });
  return fal;
}

// fal-ai/flux/dev/image-to-image — image-to-image model (accepts image_url + strength).
// Swap to fal-ai/flux-kontext/pro for stronger subject preservation once you
// have a fal.ai API key and can benchmark both with your actual inputs.
const MODEL_ID = 'fal-ai/flux/dev/image-to-image';
const COST_PER_IMAGE_USD = 0.025; // verifica en fal.ai/pricing

export async function generateWithFalFlux(
  req: VariationRequest & { count: number }
): Promise<VariationResult> {
  const style = CINEMATIC_STYLES[req.styleKey];
  if (!style) throw new Error(`Unknown style: ${req.styleKey}`);

  const background =
    style.dynamicBackgrounds[
      Math.floor(Math.random() * style.dynamicBackgrounds.length)
    ];

  const prompt = [style.description, `background: ${background}`, req.userDescription]
    .filter(Boolean)
    .join(', ');

  const start = Date.now();

  const client = getFalClient();

  // Model doesn't support num_images > 1 natively — parallelise N calls
  const results = await Promise.all(
    Array.from({ length: req.count }, () =>
      client.subscribe(MODEL_ID, {
        input: {
          prompt,
          image_url: req.sourceImageUrl,
          strength: 0.75, // lower = more faithful to the original product
          num_inference_steps: 28,
        },
      })
    )
  );

  const imageUrls = results.map((r: any) => r.data.images[0].url);

  return {
    imageUrls,
    model: MODEL_ID,
    costUsd: COST_PER_IMAGE_USD * req.count,
    durationMs: Date.now() - start,
  };
}
