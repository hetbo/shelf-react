import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import FolderTree from "./components/FolderTree.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<div className='h-screen text-white bg-neutral-900 p-4'>*/}
    <FolderTree />
    {/*</div>*/}
  </StrictMode>,
)
