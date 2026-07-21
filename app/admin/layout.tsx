// Admin pages run completely standalone — no root nav, no GA wrap, no globals bleeding in.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
