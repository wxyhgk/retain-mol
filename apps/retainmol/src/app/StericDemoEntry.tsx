import { lazy, Suspense } from 'react'
const Page = lazy(() => import('../features/steric-demo/StericDemoPage'))
export default function StericDemoEntry() {
  return <Suspense fallback={<p>正在载入演示…</p>}><Page /></Suspense>
}
