import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerForceFieldFromUrl } from '@retainmol/mol-viewer'
import './index.css'
import App from './App.tsx'
import ApiTestPage from './dev/ApiTestPage.tsx'

// 后台预加载 MMFF94 力场参数表（几何清理用）；失败不影响其他功能
registerForceFieldFromUrl(`${import.meta.env.BASE_URL}ocl/resources.json`).catch(() => {})

// 在 URL 后加 ?test 可切到 API 测试页，如：http://localhost:5173/?test
const isTest = new URLSearchParams(location.search).has('test')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTest ? <ApiTestPage /> : <App />}
  </StrictMode>,
)
