import type { ApiError as ApiErrorBody } from '@verdant/shared'
import { getLocale } from '@/shared/i18n/core'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Params = Record<string, string | number | boolean | Array<string | number> | null | undefined>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Params
  signal?: AbortSignal
}

function buildUrl(path: string, params?: Params) {
  const url = new URL(BASE + path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v == null || v === '' || v === false) return
      if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, String(x)))
      else url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

export async function request<T>(path: string, { method = 'GET', body, params, signal }: RequestOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers: { 'accept-language': getLocale(), ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as ApiErrorBody | null
    throw new ApiError(res.status, payload?.error ?? `Error ${res.status}`, payload?.details)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string, params?: Params, signal?: AbortSignal) => request<T>(path, { params, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export const errorMessage = (e: unknown, fallback = 'Something went wrong') =>
  e instanceof ApiError ? e.message : e instanceof Error ? e.message : fallback
