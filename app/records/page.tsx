import { AppShell } from '@/components/app-shell'
import { RecordsDashboard } from '@/components/RecordsDashboard'
import { createClient } from '@/lib/supabase/server'
import { getProgressStats } from '@/queries/progress'

export const dynamic = 'force-dynamic'

export default async function RecordsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = user
    ? await getProgressStats(user.id)
    : { completedStories: 0, totalPatternsSeen: 0, totalReviewCount: 0, favoritesCount: 0, studiedDates: [] }

  const { count: totalStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  return (
    <AppShell>
      <RecordsDashboard stats={stats} totalStories={totalStories ?? 0} />
    </AppShell>
  )
}
