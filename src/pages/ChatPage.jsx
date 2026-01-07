import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import { MessageCircle } from 'lucide-react'

export default function ChatPage() {
  const { user } = useAuth()
  const { selectedUser, selectUser } = useChat()
  // On mobile, show chat area only when a user is selected
  const [showMobileChat, setShowMobileChat] = useState(false)

  const handleSelectUser = (user) => {
    setShowMobileChat(true)
  }

  const handleBackToChats = () => {
    selectUser(null)
    setShowMobileChat(false)
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden fixed inset-0">
      {/* Compact Branding Header - Hidden on mobile when in chat */}
      <div className={`w-full max-w-5xl mb-2 flex items-center justify-center gap-2 ${showMobileChat && selectedUser ? 'hidden md:flex' : 'flex'}`}>
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

      <div className={`w-full max-w-5xl bg-dark-600/80 backdrop-blur-xl border border-primary-500/20 rounded-2xl shadow-2xl overflow-hidden flex ${showMobileChat && selectedUser ? 'h-screen md:h-[700px] rounded-none md:rounded-2xl' : 'h-[calc(100vh-4rem)] md:h-[700px]'}`}>
        
        {/* Sidebar - Full width on mobile, fixed width on desktop */}
        <div className={`
          ${showMobileChat && selectedUser ? 'hidden md:block' : 'block'}
          w-full md:w-72 flex-shrink-0 h-full
        `}>
          <Sidebar onSelectUser={handleSelectUser} />
        </div>

        {/* Chat Area - Full width on mobile when selected, flex-1 on desktop */}
        <div className={`
          ${showMobileChat && selectedUser ? 'block' : 'hidden md:block'}
          w-full md:w-auto flex-1 flex flex-col min-w-0 h-full overflow-hidden
        `}>
          <ChatArea onBack={handleBackToChats} />
        </div>
      </div>
    </div>
  )
}
