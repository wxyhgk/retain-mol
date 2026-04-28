import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ApiTestPage from './dev/ApiTestPage.tsx'

// 在 URL 后加 ?test 可切到 API 测试页，如：http://localhost:5173/?test
const isTest = new URLSearchParams(location.search).has('test')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTest ? <ApiTestPage /> : <App />}
  </StrictMode>,
)
