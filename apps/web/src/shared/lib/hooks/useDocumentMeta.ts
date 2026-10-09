import { useEffect } from 'react'
import { SITE_URL, STORE_NAME } from '@/shared/config'

interface Meta {
  title?: string
  description?: string
  jsonLd?: Record<string, unknown> | null
}

const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Lightweight per-page SEO: title, description, Open Graph, canonical and optional JSON-LD. */
export function useDocumentMeta({ title, description, jsonLd }: Meta) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${STORE_NAME}` : `${STORE_NAME} — premium CBD shop`
    document.title = fullTitle
    setMeta('og:title', fullTitle, 'property')
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, 'property')
    }
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = SITE_URL + window.location.pathname

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => {
      script?.remove()
    }
  }, [title, description, jsonLd])
}
