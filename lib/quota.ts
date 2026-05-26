import { supabaseAdmin } from '@/lib/supabase';

export async function checkAndReserveQuota(email: string) {
  const { data: sub, error: subErr } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('customer_email', email)
    .eq('status', 'active')
    .maybeSingle();

  if (subErr) throw subErr;
  if (!sub) return { ok: false as const, reason: 'no_subscription' as const };

  const { count } = await supabaseAdmin
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_id', sub.id)
    .eq('period_start', sub.current_period_start);

  // v1: counts ALL statuses (pending + completed + failed) — protects against
  // abuse; if your infra causes failures, add .in('status', ['pending', 'completed'])
  if ((count ?? 0) >= sub.quota_total) {
    return { ok: false as const, reason: 'quota_exceeded' as const, sub };
  }

  const { data: gen, error: genErr } = await supabaseAdmin
    .from('generations')
    .insert({
      subscription_id: sub.id,
      period_start: sub.current_period_start,
      status: 'pending',
    })
    .select()
    .single();

  if (genErr) throw genErr;

  return {
    ok: true as const,
    sub,
    generation: gen,
    used: (count ?? 0) + 1,
  };
}
