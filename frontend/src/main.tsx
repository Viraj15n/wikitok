import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LikedArticlesProvider } from './contexts/LikedArticlesContext'
import { LikedClipsProvider } from './contexts/LikedClipsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LikedArticlesProvider>
      <LikedClipsProvider>
        <App />
      </LikedClipsProvider>
    </LikedArticlesProvider>
  </StrictMode>,
)
