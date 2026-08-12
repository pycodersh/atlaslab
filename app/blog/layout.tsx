import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

/**
 * Shared layout for all /blog/* routes.
 * Adds the site-wide nav and footer to every blog page.
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  )
}
