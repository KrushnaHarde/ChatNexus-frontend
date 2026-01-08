import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import Message from './Message'
import { Send, Paperclip, X, Users, Loader, ArrowLeft, UserPlus, Settings, LogOut } from 'lucide-react'

export default function GroupChatArea({ onBack }) {
  const { user, token } = useAuth()
  const { selectedGroup, groupMessages, sendGroupMessage, sendGroupMediaMessage, leaveGroup } = useChat()
  const [messageText, setMessageText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages])

  // Fetch members when showing member panel
  useEffect(() => {
    const fetchMembers = async () => {
      if (!showMembers || !selectedGroup) return
      
      setLoadingMembers(true)
      try {
        const response = await fetch(
          `${API_BASE_URL}/groups/${selectedGroup.id}/members`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
        if (response.ok) {
          const data = await response.json()
          setMembers(data)
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      }
      setLoadingMembers(false)
    }

    fetchMembers()
  }, [showMembers, selectedGroup, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = messageText.trim()

    if (selectedFile) {
      setUploading(true)
      await sendGroupMediaMessage(selectedFile, text)
      setSelectedFile(null)
      setUploading(false)
    } else if (text) {
      await sendGroupMessage(text)
    }

    setMessageText('')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
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

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(selectedGroup.id)
    }
  }

  // Filter messages for current group
  const currentGroupMessages = groupMessages.filter(
    msg => msg.groupId === selectedGroup?.id
  )

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-600/40 text-dark-300 h-full">
        <Users className="w-16 h-16 mb-4 text-primary-500/50" />
        <p className="text-lg font-medium">Select a group</p>
        <p className="text-sm mt-1">Choose a group to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-600/40 h-full min-h-0 overflow-hidden">
      {/* Chat Header */}
      <div className="px-3 md:px-6 py-3 md:py-4 border-b border-primary-500/15 bg-dark-700/40 min-h-[60px] md:min-h-[70px] flex items-center flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 w-full">
          {/* Back Button - Mobile only */}
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 text-dark-200 hover:text-white hover:bg-dark-600 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Group Avatar */}
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center border-2 border-primary-500/40">
            <Users className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-dark-100 text-sm md:text-base truncate">{selectedGroup.name}</h3>
            <p className="text-xs text-dark-300 truncate">
              {selectedGroup.description || `${selectedGroup.memberCount || selectedGroup.memberIds?.length || 0} members`}
            </p>
          </div>

          {/* Group Actions */}
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-lg transition-colors ${showMembers ? 'bg-primary-500/20 text-primary-400' : 'text-dark-300 hover:bg-dark-600'}`}
            title="View members"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 min-h-0">
          {currentGroupMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-dark-400">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Be the first to send a message!</p>
            </div>
          ) : (
            currentGroupMessages.map((msg, index) => {
              // System messages - centered style
              if (msg.messageType === 'SYSTEM' || msg.senderId === 'SYSTEM') {
                return (
                  <div key={msg.id || index} className="flex justify-center">
                    <div className="bg-dark-700/60 text-dark-300 text-xs px-4 py-2 rounded-full border border-primary-500/20">
                      {msg.content}
                    </div>
                  </div>
                )
              }

              // Regular messages
              return (
                <div
                  key={msg.id || index}
                  className={`${msg.senderId === user.username ? '' : ''}`}
                >
                  <div className={`${msg.senderId === user.username ? '' : ''}`}>
                    {/* Sender name for others' messages */}
                    {msg.senderId !== user.username && (
                      <p className="text-xs text-primary-400 mb-1 ml-1">{msg.senderName}</p>
                    )}
                    <Message
                      message={msg}
                      isSender={msg.senderId === user.username}
                      isGroupMessage={true}
                    />
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Members Panel */}
        {showMembers && (
          <div className="w-64 border-l border-primary-500/15 bg-dark-700/40 flex flex-col">
            <div className="p-4 border-b border-primary-500/15">
              <h4 className="font-medium text-dark-100">Members</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
              ) : (
                <ul className="space-y-2">
                  {members.map(member => (
                    <li
                      key={member.username}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-600/50"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=667eea&color=fff&size=32`}
                        alt={member.fullName}
                        className="w-8 h-8 rounded-full border border-primary-500/30"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-100 truncate">
                          {member.fullName}
                          {member.username === user.username && (
                            <span className="text-xs text-dark-400 ml-1">(You)</span>
                          )}
                        </p>
                        {(member.isCreator || member.isAdmin) && (
                          <p className="text-xs text-primary-400">
                            {member.isCreator ? 'Creator' : 'Admin'}
                          </p>
                        )}
                      </div>
                      <span className={`w-2 h-2 rounded-full ${member.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Leave Group Button */}
            <div className="p-3 border-t border-primary-500/15">
              <button
                onClick={handleLeaveGroup}
                className="w-full flex items-center justify-center gap-2 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Leave Group
              </button>
            </div>
          </div>
        )}
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
