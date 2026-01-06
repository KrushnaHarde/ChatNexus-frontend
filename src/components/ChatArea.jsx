import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import Message from './Message'
import { Send, Paperclip, X, MessageSquare, Loader } from 'lucide-react'

export default function ChatArea() {
  const { user } = useAuth()
  const { selectedUser, messages, sendMessage, sendMediaMessage } = useChat()
  const [messageText, setMessageText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = messageText.trim()

    if (selectedFile) {
      setUploading(true)
      await sendMediaMessage(selectedFile, text)
      setSelectedFile(null)
      setUploading(false)
    } else if (text) {
      await sendMessage(text)
    }

    setMessageText('')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const cancelFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Filter messages for current conversation
  const conversationMessages = messages.filter(
    msg => 
      (msg.senderId === user.username && msg.recipientId === selectedUser?.username) ||
      (msg.senderId === selectedUser?.username && msg.recipientId === user.username)
  )

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-600/40 text-dark-300 h-full">
        <MessageSquare className="w-16 h-16 mb-4 text-primary-500/50" />
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm mt-1">Choose a user to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-600/40 h-full min-h-0 overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 md:px-6 py-4 border-b border-primary-500/15 bg-dark-700/40 min-h-[70px] flex items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName)}&background=667eea&color=fff&size=40`}
            alt={selectedUser.fullName}
            className="w-10 h-10 rounded-full border-2 border-primary-500/40"
          />
          <div>
            <h3 className="font-medium text-dark-100">{selectedUser.fullName}</h3>
            <p className="text-xs text-dark-300 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${selectedUser.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'}`} />
              {selectedUser.status === 'ONLINE' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 min-h-0">
        {conversationMessages.map((msg, index) => (
          <Message
            key={msg.id || index}
            message={msg}
            isSender={msg.senderId === user.username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t border-primary-500/15 bg-dark-700/40 flex-shrink-0">
        {/* File Preview */}
        {selectedFile && (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-2">
              <span className="text-dark-200 text-sm truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={cancelFile}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4">
          {/* File Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 md:p-3 text-primary-500 hover:bg-primary-500/15 rounded-xl transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.mp3,.wav"
            className="hidden"
          />

          {/* Text Input */}
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 md:px-5 py-2.5 md:py-3 bg-dark-700/60 border border-primary-500/20 rounded-full text-dark-100 placeholder-dark-400 text-sm md:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={uploading || (!messageText.trim() && !selectedFile)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-primary-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {uploading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
