import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerForceFieldFromUrl } from '@retainmol/mol-viewer/io'
import { configureJobsApiBase } from '@retainmol/jobs'
import { configureMoleculeAssetsApiBase } from '@retainmol/molecule-assets'
import { configureBackendUrl } from '@/infrastructure/backendUrl'
import './index.css'
import App from './App.tsx'
import ApiTestPage from './dev/ApiTestPage.tsx'
import StericDemoEntry from './app/StericDemoEntry'
import { AppProviders } from './app/AppProviders.tsx'

// 包内不读 import.meta.env,由 app 在启动时统一注入后端地址
const backendUrl = import.meta.env.VITE_RETAINMOL_BACKEND_URL
configureBackendUrl(backendUrl)
configureJobsApiBase(backendUrl)
configureMoleculeAssetsApiBase(backendUrl)

// 后台预加载 MMFF94 力场参数表（几何清理用）；失败不影响其他功能
registerForceFieldFromUrl(`${import.meta.env.BASE_URL}ocl/resources.json`).catch(() => {})

// 在 URL 后加 ?test 可切到 API 测试页，如：http://localhost:5173/?test
const isStericDemo = new URLSearchParams(location.search).get('demo') === 'steric'
const isTest = new URLSearchParams(location.search).has('test')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      {isStericDemo ? <StericDemoEntry /> : isTest ? <ApiTestPage /> : <App />}
    </AppProviders>
  </StrictMode>,
)
