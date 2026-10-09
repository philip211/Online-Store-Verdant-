import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { ensureDictionary, getLocale } from './shared/i18n'

// The persisted/detected locale's dictionary is a separate chunk; fetch it before the first
// render so a returning German or French visitor never sees an English flash.
ensureDictionary(getLocale()).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
