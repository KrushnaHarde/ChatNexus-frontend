import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-500 text-xl">Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  ) : (
    <AuthPage />
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
