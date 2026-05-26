import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { checkAndReserveQuota } from '@/lib/quota';
import { generateImageVariations } from '@/lib/ai/imageVariations';

const BodySchema = z.object({
  styleKey: z.string(),
  userDescription: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  // 1. Auth — identify the caller via Supabase session cookie
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. Parse FormData
  const form = await request.formData();
  const file = form.get('image') as File | null;
  const parsed = BodySchema.safeParse({
    styleKey: form.get('styleKey'),
    userDescription: form.get('userDescription') || undefined,
  });

  if (!file) {
    return NextResponse.json({ error: 'image_required' }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', issues: parsed.error.issues }, { status: 400 });
  }

  // 3. Quota check + reserve a generation slot
  const quota = await checkAndReserveQuota(user.email);
  if (!quota.ok) {
    const status = quota.reason === 'no_subscription' ? 402 : 429;
    return NextResponse.json({ error: quota.reason }, { status });
  }

  const generationId = quota.generation.id;

  try {
    // 4. Upload source image to Supabase Storage
    const ext = file.name.split('.').pop() || 'jpg';
    const sourcePath = `${quota.sub.id}/${generationId}/source.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from('raw-photos')
      .upload(sourcePath, file, { contentType: file.type });
    if (upErr) throw upErr;

    const {
      data: { publicUrl: sourceUrl },
    } = supabaseAdmin.storage.from('raw-photos').getPublicUrl(sourcePath);

    // 5. Generate via the provider abstraction layer
    const result = await generateImageVariations({
      sourceImageUrl: sourceUrl,
      styleKey: parsed.data.styleKey,
      userDescription: parsed.data.userDescription,
      count: 3,
    });

    // 6. Persist each variation in completed-photos
    const finalUrls: string[] = [];
    for (let i = 0; i < result.imageUrls.length; i++) {
      const res = await fetch(result.imageUrls[i]);
      const buf = Buffer.from(await res.arrayBuffer());
      const destPath = `${quota.sub.id}/${generationId}/variation-${i + 1}.jpg`;
      await supabaseAdmin.storage
        .from('completed-photos')
        .upload(destPath, buf, { contentType: 'image/jpeg' });

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from('completed-photos').getPublicUrl(destPath);
      finalUrls.push(publicUrl);
    }

    // 7. Mark generation as completed with full metadata
    await supabaseAdmin
      .from('generations')
      .update({
        status: 'completed',
        source_url: sourceUrl,
        style_key: parsed.data.styleKey,
        output_urls: finalUrls,
        model_used: result.model,
        cost_usd: result.costUsd,
        duration_ms: result.durationMs,
      })
      .eq('id', generationId);

    // 8. Return URLs + updated quota counters to the client
    return NextResponse.json({
      imageUrls: finalUrls,
      quotaUsed: quota.used,
      quotaTotal: quota.sub.quota_total,
    });
  } catch (err: any) {
    await supabaseAdmin
      .from('generations')
      .update({
        status: 'failed',
        error_message: err.message?.slice(0, 500) ?? 'unknown',
      })
      .eq('id', generationId);

    return NextResponse.json(
      { error: 'generation_failed', detail: err.message },
      { status: 500 }
    );
  }
}
