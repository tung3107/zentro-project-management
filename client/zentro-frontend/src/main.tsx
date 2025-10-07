import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/global.css'
import App from './App.tsx'
import { PrimeReactProvider } from 'primereact/api'
import 'primereact/resources/themes/lara-light-blue/theme.css' // hoặc chọn theme khác
import 'primereact/resources/primereact.min.css'

import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
    <Toaster position='top-right' richColors expand={true} theme='light' />
  </StrictMode>
)
