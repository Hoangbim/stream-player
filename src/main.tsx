import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './sw.js'
import './cheap-polyfill.js'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
