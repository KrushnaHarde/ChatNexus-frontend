import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import { Menu, X, MessageCircle } from 'lucide-react'

export default function ChatPage() {
  const { user } = useAuth()
  const { selectedUser } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
      {/* Compact Branding Header */}
      <div className="w-full max-w-5xl mb-2 flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          <MessageCircle className="w-6 h-6 text-primary-500" />
          <MessageCircle className="w-4 h-4 text-secondary-500 -ml-2 mt-1" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
          ChatNexus
        </h1>
        <span className="text-dark-400 text-xs hidden md:inline">• Real-time messaging</span>
        <span className="text-dark-500 text-xs hidden md:inline ml-1">by <span className="text-primary-400">Krushna</span></span>
      </div>

      <div className="w-full max-w-5xl h-[calc(100vh-4rem)] md:h-[700px] bg-dark-600/80 backdrop-blur-xl border border-primary-500/20 rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-dark-600 rounded-lg text-dark-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar - Hidden on mobile unless open */}
        <div className={`
          fixed md:relative inset-y-0 left-0 z-40
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          transition-transform duration-300 ease-in-out
          w-72 md:w-72 flex-shrink-0 h-full
        `}>
          <Sidebar onSelectUser={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <ChatArea />
        </div>
      </div>
    </div>
  )
}
