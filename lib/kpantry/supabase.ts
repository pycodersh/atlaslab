// 4단계: patto Supabase 클라이언트로 전환
// NEXT_PUBLIC_KPANTRY_SUPABASE_URL / NEXT_PUBLIC_KPANTRY_SUPABASE_ANON_KEY 불필요
export { createClient } from '@/lib/supabase/client'
