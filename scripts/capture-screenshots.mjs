/**
 * Re-captures docs/screenshots (desktop 1440x900, mobile 390x844 @2x) through the Chrome DevTools Protocol.
 *
 *   npm run dev                      # API on :3001, storefront on :5173
 *   node scripts/capture-screenshots.mjs [outDir] [nameFilter,...]
 *
 * Env: BASE_URL (default http://localhost:5173), API_URL (default http://localhost:3001/api),
 *      CHROME (path to Chrome; defaults to the standard Windows install path).
 * Creates one demo order through the API for the order/withdrawal screens; reset the DB afterwards if needed.
 */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

const OUT = process.argv[2] ?? 'docs/screenshots'
const only = process.argv[3] ? process.argv[3].split(',') : null
const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const API = process.env.API_URL ?? 'http://localhost:3001/api'
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const res = await fetch(`${API}/orders`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    items: [
      { productId: 'p1', variantId: 'p1-5', qty: 1, subscription: false, bundle: false },
      { productId: 'p5', variantId: 'p5-10', qty: 1, subscription: true, bundle: false },
      { productId: 'p9', variantId: 'p9-50', qty: 1, subscription: false, bundle: false },
    ],
    customer: { name: 'Anna Weber', email: 'anna.weber@example.com', phone: '+49 30 5550 1234', country: 'DE', city: 'Berlin', postalCode: '10115', address: 'Invalidenstraße 12' },
    delivery: 'standard',
    payment: 'card',
  }),
})
if (!res.ok) throw new Error(`Could not create the demo order: ${res.status} ${await res.text()}`)
const order = await res.json()
const cart = [
  { key: 'p1:p1-5:once', productId: 'p1', slug: 'harlequin-premium-flowers', name: 'Harlequin Premium', variantId: 'p1-5', variantLabel: '5 g', price: 2790, oldPrice: 3225, qty: 1, hue: 140, category: 'flowers', subscription: false, bundle: false, maxQty: 11 },
  { key: 'p5:p5-10:sub', productId: 'p5', slug: 'full-spectrum-oil-10', name: 'Full Spectrum Oil 10%', variantId: 'p5-10', variantLabel: '10 ml', price: 3490, qty: 1, hue: 45, category: 'oils', subscription: true, bundle: false, maxQty: 38 },
  { key: 'p7:p7-30:once', productId: 'p7', slug: 'focus-gummies', name: 'Focus CBD Gummies', variantId: 'p7-30', variantLabel: '30 pcs', price: 2490, qty: 2, hue: 30, category: 'edibles', subscription: false, bundle: false, maxQty: 35 },
]
const st = (state) => JSON.stringify({ state, version: 0 })
const baseStorage = (locale = 'en') => ({
  'verdant:age': st({ verified: true, verifiedAt: Date.now() }),
  'verdant:consent': st({ decided: true, analytics: false, marketing: false, decidedAt: Date.now() }),
  'verdant:locale': st({ locale }),
  'verdant:orders': st({ orders: [order] }),
  'verdant:wishlist': st({ ids: ['p2', 'p6', 'p10'] }),
  'verdant:recent': st({ ids: ['p3', 'p8', 'p12', 'p13'] }),
})
const withCart = { 'verdant:cart': st({ items: cart, promoCode: null }) }
const D = { w: 1440, h: 900, dpr: 1 }
const M = { w: 390, h: 844, dpr: 2 }
const J = JSON.stringify
const clickText = (sel, txt) => `[...document.querySelectorAll(${J(sel)})].find(e=>e.textContent.trim().includes(${J(txt)}))?.click()`
const clickLabel = (label) => `[...document.querySelectorAll('button[aria-label=${J(label)}]')].find(e=>e.offsetParent)?.click()`
const scrollTo = (expr, block = 'start') => `(()=>{const el=${expr};if(el){const r=el.getBoundingClientRect();const y=${J(block)}==='center'?r.top+scrollY-(innerHeight-r.height)/2:r.top+scrollY-90;window.scrollTo({top:y,behavior:'instant'})}})()`
const scrollH2 = (txt) => scrollTo(`[...document.querySelectorAll('h1,h2,h3')].find(h=>h.textContent.includes(${J(txt)}))`)
const typeInto = (sel, val) => `(()=>{const i=document.querySelector(${J(sel)});const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,${J(val)});i.dispatchEvent(new Event('input',{bubbles:true}))})()`
const P = '/product/harlequin-premium-flowers'
const W = `/withdrawal?order=${order.id}&email=${encodeURIComponent(order.customer.email)}`

const scenes = [
  { n: 'desktop/01-home-hero', v: D, url: '/' },
  { n: 'desktop/02-home-bestsellers', v: D, url: '/', steps: [scrollH2('again and again')] },
  { n: 'desktop/03-home-categories', v: D, url: '/', steps: [scrollH2('ritual')] },
  { n: 'desktop/04-home-in-focus', v: D, url: '/', steps: [scrollTo(`[...document.querySelectorAll('p.eyebrow')].find(e=>e.textContent.includes('In focus'))`, 'center')] },
  { n: 'desktop/05-home-lab', v: D, url: '/', steps: [scrollH2('certificate of analysis')] },
  { n: 'desktop/06-catalog', v: D, url: '/catalog' },
  { n: 'desktop/07-product', v: D, url: P },
  { n: 'desktop/08-product-purchase', v: D, url: P, steps: ['window.scrollTo(0,420)'] },
  { n: 'desktop/09-product-omnibus', v: D, url: '/product/daily-oil-5', steps: ['window.scrollTo(0,420)'] },
  { n: 'desktop/10-search-help', v: D, url: '/catalog', steps: [clickLabel('Search'), 'WAIT', typeInto('input[placeholder^="Search"]', 'return')] },
  { n: 'desktop/11-search-typo', v: D, url: '/catalog', steps: [clickLabel('Search'), 'WAIT', typeInto('input[placeholder^="Search"]', 'harlequen')] },
  { n: 'desktop/12-cart-drawer', v: D, url: '/catalog', store: withCart, steps: [clickLabel('Cart')] },
  { n: 'desktop/13-checkout', v: D, url: '/checkout', store: withCart },
  { n: 'desktop/14-order-tracking', v: D, url: `/orders/${order.id}` },
  { n: 'desktop/15-withdrawal-step1', v: D, url: W },
  { n: 'desktop/16-withdrawal-step2', v: D, url: W, steps: [clickText('button', 'Continue'), 'WAIT', 'window.scrollTo(0,250)'] },
  { n: 'desktop/17-compare', v: D, url: '/compare', store: { 'verdant:compare': st({ ids: ['p1', 'p4', 'p2'] }) } },
  { n: 'desktop/18-quiz', v: D, url: '/', steps: [clickText('nav button', 'Find my match')] },
  { n: 'desktop/19-lab-results', v: D, url: '/lab-results' },
  { n: 'desktop/20-about', v: D, url: '/about' },
  { n: 'desktop/21-product-de', v: D, url: P, locale: 'de' },
  { n: 'desktop/00-home-full', v: D, url: '/', full: true },
  { n: 'mobile/01-home-hero', v: M, url: '/' },
  { n: 'mobile/02-home-categories', v: M, url: '/', steps: [scrollH2('ritual')] },
  { n: 'mobile/03-catalog', v: M, url: '/catalog', steps: ['window.scrollTo(0,330)'] },
  { n: 'mobile/04-product', v: M, url: P },
  { n: 'mobile/05-product-purchase', v: M, url: P, steps: [scrollTo(`document.querySelector('button[aria-pressed]')`)] },
  { n: 'mobile/06-cart-drawer', v: M, url: '/', store: withCart, steps: [clickLabel('Cart')] },
  { n: 'mobile/07-checkout', v: M, url: '/checkout', store: withCart },
  { n: 'mobile/08-menu', v: M, url: '/', steps: [clickLabel('Menu')] },
  { n: 'mobile/09-search', v: M, url: '/', steps: [clickLabel('Search'), 'WAIT', typeInto('input[placeholder^="Search"]', 'sleep')] },
  { n: 'mobile/10-order-tracking', v: M, url: `/orders/${order.id}` },
  { n: 'mobile/11-withdrawal', v: M, url: W, steps: [clickText('button', 'Continue'), 'WAIT'] },
  { n: 'mobile/12-quiz', v: M, url: '/', steps: [`document.querySelector('nav[aria-label="Mobile navigation"] button')?.click()`] },
]

const port = 9335
const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'doc-'))}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let t
for (let i = 0; i < 40; i++) { try { t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break } catch { await sleep(250) } }
const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pend = new Map()
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id) } })
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true })
await send('Page.enable')

for (const s of scenes) {
  if (only && !only.some((o) => s.n.includes(o))) continue
  const { w, h, dpr } = s.v
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: w < 600 })
  await send('Page.navigate', { url: BASE + '/' }); await sleep(800)
  const store = { ...baseStorage(s.locale), ...(s.store ?? {}) }
  await ev(`localStorage.clear();sessionStorage.clear();${Object.entries(store).map(([k, v]) => `localStorage.setItem(${J(k)},${J(v)})`).join(';')}`)
  await send('Page.navigate', { url: BASE + s.url }); await sleep(3800)
  for (const step of s.steps ?? []) { if (step === 'WAIT') { await sleep(900); continue } await ev(step); await sleep(1400) }
  await sleep(900)
  let params = { format: 'webp', quality: 86 }
  if (s.full) {
    const H0 = (await ev('document.documentElement.scrollHeight')).result.result.value
    for (let y = 0; y < H0; y += 500) { await ev(`window.scrollTo(0,${y})`); await sleep(220) }
    await ev('window.scrollTo(0,0)'); await sleep(1000)
    const H = (await ev('document.documentElement.scrollHeight')).result.result.value
    params = { ...params, captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: H, scale: 0.5 } }
  }
  const shot = await send('Page.captureScreenshot', params)
  const file = join(OUT, s.n + '.webp')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, Buffer.from(shot.result.data, 'base64'))
  console.log('saved', s.n)
}
ws.close()
proc.kill()
