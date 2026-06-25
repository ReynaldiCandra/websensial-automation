export const PLAN_CREDITS: Record<string, number> = {
  trial: 100,
  starter: 2000,
  growth: 7500,
  business: 18000,
  scale: 45000,
}

export class CreditExhaustedError extends Error {
  constructor() { super('Credit habis. Silakan upgrade paket atau top up kredit.') }
}

export async function checkCredits(userId: string, supabase: any) {
  const { data } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (!data) return { remaining: 0, total: 100, plan: 'trial', used: 0 }
  return {
    remaining: data.total_credits - data.used_credits,
    total: data.total_credits,
    used: data.used_credits,
    plan: data.plan,
    resetAt: data.reset_at,
  }
}

export async function deductCredit(userId: string, amount: number, description: string, supabase: any) {
  const credits = await checkCredits(userId, supabase)
  if (credits.remaining < amount) throw new CreditExhaustedError()
  await supabase.from('user_credits').update({
    used_credits: credits.used + amount,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)
  await supabase.from('credit_transactions').insert({
    user_id: userId, amount: -amount, type: 'deduct', description,
  })
  return { success: true, remaining: credits.remaining - amount }
}

export async function addCredits(userId: string, amount: number, reason: string, supabase: any) {
  const { data } = await supabase.from('user_credits').select('total_credits').eq('user_id', userId).single()
  const current = data?.total_credits || 0
  await supabase.from('user_credits').upsert({
    user_id: userId, total_credits: current + amount, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  await supabase.from('credit_transactions').insert({
    user_id: userId, amount, type: 'add', description: reason,
  })
  return { success: true, total: current + amount }
}

export async function getCreditHistory(userId: string, supabase: any, limit = 20) {
  const { data } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}
