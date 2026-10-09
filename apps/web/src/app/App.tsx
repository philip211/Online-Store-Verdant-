import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary, QueryProvider } from './providers'
import { router } from './router'
import './styles/index.css'

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </ErrorBoundary>
  )
}
