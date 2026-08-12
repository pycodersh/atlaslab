import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

/**
 * Shared layout for all /blog/* routes.
 * Adds the site-wide nav and footer to every blog page.
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh' }}>
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  )
}
