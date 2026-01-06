import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { MessageCircle, Search, LogOut, User, Image, Video, Music } from 'lucide-react'

export default function Sidebar({ onSelectUser }) {
  const { user } = useAuth()
  const { contacts, selectedUser, selectUser, searchUsers, disconnectUser } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [searchTimeout, setSearchTimeoutState] = useState(null)
  const searchContainerRef = useRef(null)

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = useCallback(async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const results = await searchUsers(query)
    // Filter out current user
    const filtered = results.filter(u => u.username !== user.username)
    setSearchResults(filtered)
    setShowResults(true)
  }, [searchUsers, user])

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
    
    const timeout = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)
    
    setSearchTimeoutState(timeout)
    
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleSelectUser = (userToSelect) => {
    selectUser(userToSelect)
    setSearchQuery('')
    setShowResults(false)
    onSelectUser?.()
  }

  const handleLogout = () => {
    disconnectUser()
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Format last message preview with media type indicator
  const formatLastMessage = (contact) => {
    const { lastMessage, lastMessageType } = contact
    
    // If there's a text message, show it (possibly with media prefix)
    if (lastMessage && lastMessage.trim()) {
      if (lastMessageType === 'IMAGE') {
        return (
          <span className="flex items-center gap-1">
            <Image className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lastMessage}</span>
          </span>
        )
      }
      if (lastMessageType === 'VIDEO') {
        return (
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lastMessage}</span>
          </span>
        )
      }
      if (lastMessageType === 'AUDIO') {
        return (
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lastMessage}</span>
          </span>
        )
      }
      return <span className="truncate">{lastMessage}</span>
    }
    
    // No text - show media type indicator only
    if (lastMessageType === 'IMAGE') {
      return (
        <span className="flex items-center gap-1 text-primary-400">
          <Image className="w-3 h-3 flex-shrink-0" />
          <span>Photo</span>
        </span>
      )
    }
    if (lastMessageType === 'VIDEO') {
      return (
        <span className="flex items-center gap-1 text-primary-400">
          <Video className="w-3 h-3 flex-shrink-0" />
          <span>Video</span>
        </span>
      )
    }
    if (lastMessageType === 'AUDIO') {
      return (
        <span className="flex items-center gap-1 text-primary-400">
          <Music className="w-3 h-3 flex-shrink-0" />
          <span>Audio</span>
        </span>
      )
    }
    
    return null
  }

  return (
    <div className="h-full bg-dark-700/60 border-r border-primary-500/15 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-primary-500/15 min-h-[70px] flex items-center flex-shrink-0">
        <h2 className="text-lg font-semibold text-dark-200 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-500" />
          Chats
        </h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-primary-500/15 relative z-50 flex-shrink-0" ref={searchContainerRef}>
        <div className="flex items-center bg-dark-700/60 border border-primary-500/30 rounded-xl px-3 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/15 transition-all">
          <Search className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            placeholder="Search users..."
            className="flex-1 bg-transparent text-dark-100 text-sm outline-none placeholder-dark-400"
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-dark-600 border border-primary-500/30 rounded-xl max-h-48 overflow-y-auto z-[200] shadow-2xl" style={{ position: 'absolute' }}>
            {searchResults.map(result => (
              <div
                key={result.username}
                onClick={() => handleSelectUser(result)}
                className="flex items-center p-3 hover:bg-primary-500/15 cursor-pointer border-b border-primary-500/10 last:border-b-0 transition-colors"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.fullName)}&background=667eea&color=fff&size=36`}
                  alt={result.fullName}
                  className="w-9 h-9 rounded-full border-2 border-primary-500/40 mr-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-100 text-sm truncate">{result.fullName}</p>
                  <p className="text-xs text-dark-300">@{result.username}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${result.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
            ))}
          </div>
        )}

        {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-dark-600 border border-primary-500/30 rounded-xl p-4 text-center text-dark-300 text-sm z-[200] shadow-2xl">
            No users found
          </div>
        )}
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {contacts.length === 0 ? (
          <div className="text-center text-dark-300 text-sm py-8">
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Search for users to start chatting</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {contacts.map(contact => (
              <li
                key={contact.username}
                onClick={() => handleSelectUser(contact)}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all
                  ${selectedUser?.username === contact.username 
                    ? 'bg-gradient-to-r from-primary-500/30 to-secondary-500/30 border border-primary-500/30' 
                    : 'hover:bg-primary-500/10'}`}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.fullName)}&background=667eea&color=fff&size=42`}
                  alt={contact.fullName}
                  className="w-10 h-10 rounded-full border-2 border-primary-500/40 mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-dark-100 text-sm truncate">{contact.fullName}</span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.status === 'ONLINE' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-500'}`} />
                  </div>
                  {(contact.lastMessage || contact.lastMessageType) && (
                    <p className={`text-xs mt-0.5 flex items-center ${contact.unreadCount > 0 ? 'text-dark-200 font-medium' : 'text-dark-300'}`}>
                      {formatLastMessage(contact)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  {contact.lastMessageTime && (
                    <span className={`text-xs ${contact.unreadCount > 0 ? 'text-primary-500' : 'text-dark-400'}`}>
                      {formatTime(contact.lastMessageTime)}
                    </span>
                  )}
                  {contact.unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-primary-500/15 bg-dark-700/40 flex items-center justify-between min-h-[80px] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <p className="font-medium text-dark-100 text-sm">{user?.fullname}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 hover:bg-red-500/25 hover:scale-105 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
