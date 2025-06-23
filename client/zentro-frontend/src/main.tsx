import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/global.css'
import App from './App.tsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position='top-right' richColors expand={true} theme='light' />
  </StrictMode>
)
