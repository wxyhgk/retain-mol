import { lazy, Suspense } from 'react'
const Page = lazy(() => import('../features/geometry-path-demo/GeometryPathDemoPage'))
export default function GeometryPathDemoEntry() {
  return <Suspense fallback={<p>正在载入运动与环带演示…</p>}><Page /></Suspense>
}
