import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { TRPCProvider } from '@/providers/trpc'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error: string}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#C9CACA', background: '#121212', fontFamily: 'sans-serif' }}>
          <h1>Error</h1>
          <pre style={{ color: '#868686', whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <TRPCProvider>
    <HashRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </TRPCProvider>,
)
