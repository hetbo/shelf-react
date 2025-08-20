import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className='h-screen text-white bg-neutral-900 p-4'>
    <App />
    </div>
  </StrictMode>,
)
