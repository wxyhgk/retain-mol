import { lazy, Suspense } from 'react'
const Page = lazy(() => import('../features/constrained-geometry-demo/ConstrainedGeometryDemoPage'))
export default function ConstrainedGeometryDemoEntry() {
  return <Suspense fallback={<p>正在载入约束几何演示…</p>}><Page /></Suspense>
}
