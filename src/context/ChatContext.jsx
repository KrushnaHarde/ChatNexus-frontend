import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import SockJS from 'sockjs-client/dist/sockjs'
import { Client } from '@stomp/stompjs'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { user, token, logout } = useAuth()
  const [contacts, setContacts] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  
  // Group state
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupMessages, setGroupMessages] = useState([])
  const [chatMode, setChatMode] = useState('direct') // 'direct' or 'group'
  
  const stompClientRef = useRef(null)
  const messageElementsRef = useRef({})
  const messageTimestampsRef = useRef({})
  const selectedUserRef = useRef(null) // Track selected user for callbacks
  const selectedGroupRef = useRef(null) // Track selected group for callbacks

  // Keep refs in sync
  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  useEffect(() => {
    selectedGroupRef.current = selectedGroup
  }, [selectedGroup])

  // Sync selectedUser status with contacts when contacts update
  useEffect(() => {
    if (selectedUser && contacts.length > 0) {
      const updatedContact = contacts.find(c => c.username === selectedUser.username)
      if (updatedContact && updatedContact.status !== selectedUser.status) {
        setSelectedUser(prev => prev ? { ...prev, status: updatedContact.status } : null)
      }
    }
  }, [contacts, selectedUser?.username])

  // Connect to WebSocket
  useEffect(() => {
    if (!user || !token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      console.log('WebSocket connected!')
      setConnected(true)

      // Subscribe to private messages
      client.subscribe(`/user/${user.username}/queue/messages`, (message) => {
        const msg = JSON.parse(message.body)
        handlePrivateMessage(msg)
      })

      // Subscribe to status updates
      client.subscribe(`/user/${user.username}/queue/status`, (message) => {
        const statusUpdate = JSON.parse(message.body)
        handleStatusUpdate(statusUpdate)
      })

      // Subscribe to public topic
      client.subscribe('/topic/public', (message) => {
        const msg = JSON.parse(message.body)
        handlePublicMessage(msg)
      })

      // Subscribe to group messages
      client.subscribe(`/user/${user.username}/queue/group-messages`, (message) => {
        const msg = JSON.parse(message.body)
        handleGroupMessage(msg)
      })

      // Subscribe to group updates
      client.subscribe(`/user/${user.username}/queue/group-updates`, (message) => {
        const update = JSON.parse(message.body)
        handleGroupUpdate(update)
      })

      // Register user as online
      client.publish({
        destination: '/app/user.addUser',
        body: JSON.stringify({
          username: user.username,
          fullName: user.fullname,
          status: 'ONLINE'
        })
      })

      // Fetch contacts
      fetchContacts()
      fetchGroups()
      fetchUndeliveredMessages()
    }

    client.onDisconnect = () => {
      setConnected(false)
    }

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame)
    }

    client.activate()
    stompClientRef.current = client

    return () => {
      if (client.connected) {
        client.publish({
          destination: '/app/user.disconnectUser',
          body: JSON.stringify({
            username: user.username,
            fullName: user.fullname,
            status: 'OFFLINE'
          })
        })
      }
      client.deactivate()
    }
  }, [user, token])

  const handlePrivateMessage = useCallback((message) => {
    setMessages(prev => {
      // Check if message exists and update it, or add new
      const existingIndex = prev.findIndex(m => m.id === message.id)
      if (existingIndex !== -1) {
        // Update existing message (could be status update or media URL update)
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], ...message }
        return updated
      }
      // Also check for temp messages that might match
      const tempIndex = prev.findIndex(m => 
        m.id?.startsWith('temp-') && 
        m.senderId === message.senderId && 
        m.recipientId === message.recipientId &&
        m.content === message.content
      )
      if (tempIndex !== -1) {
        const updated = [...prev]
        updated[tempIndex] = message
        return updated
      }
      return [...prev, message]
    })

    // Update contacts
    fetchContacts()

    // Send read receipt if chat is open with this sender
    const currentSelectedUser = selectedUserRef.current
    if (currentSelectedUser && currentSelectedUser.username === message.senderId) {
      sendReadNotification(message.senderId)
      // Immediately clear unread count for this contact
      setContacts(prev => prev.map(c => 
        c.username === message.senderId ? { ...c, unreadCount: 0 } : c
      ))
    }
  }, [])

  const handleGroupMessage = useCallback((message) => {
    setGroupMessages(prev => {
      const existingIndex = prev.findIndex(m => m.id === message.id)
      if (existingIndex !== -1) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], ...message }
        return updated
      }
      const tempIndex = prev.findIndex(m => 
        m.id?.startsWith('temp-') && 
        m.groupId === message.groupId &&
        m.senderId === message.senderId &&
        m.content === message.content
      )
      if (tempIndex !== -1) {
        const updated = [...prev]
        updated[tempIndex] = message
        return updated
      }
      return [...prev, message]
    })

    // Increment unread count if not currently viewing this group
    const currentSelectedGroup = selectedGroupRef.current
    if (!currentSelectedGroup || currentSelectedGroup.id !== message.groupId) {
      // Don't count own messages as unread
      if (message.senderId !== user?.username) {
        setGroups(prev => prev.map(g => 
          g.id === message.groupId ? { ...g, unreadCount: (g.unreadCount || 0) + 1 } : g
        ))
      }
    }

    // Refresh groups to update last message
    fetchGroups()
  }, [user?.username])

  const handleGroupUpdate = useCallback((update) => {
    console.log('Group update received:', update)
    
    switch (update.type) {
      case 'GROUP_CREATED':
      case 'ADDED_TO_GROUP':
      case 'MEMBERS_ADDED':
      case 'MEMBER_LEFT':
      case 'GROUP_UPDATED':
        fetchGroups()
        break
      case 'REMOVED_FROM_GROUP':
      case 'GROUP_DELETED':
        fetchGroups()
        if (selectedGroupRef.current?.id === update.groupId) {
          setSelectedGroup(null)
          setChatMode('direct')
        }
        break
      default:
        fetchGroups()
    }
  }, [])

  const handleStatusUpdate = useCallback((statusUpdate) => {
    console.log('Status update received:', statusUpdate)
    
    setMessages(prev => prev.map(msg => {
      // Match by ID or handle array of updates
      if (msg.id === statusUpdate.id || msg.id === statusUpdate.messageId) {
        return {
          ...msg,
          status: statusUpdate.status,
          readTimestamp: statusUpdate.readTimestamp || statusUpdate.timestamp || msg.readTimestamp,
          deliveredTimestamp: statusUpdate.deliveredTimestamp || msg.deliveredTimestamp
        }
      }
      // Also update if this is a bulk read notification (all messages from sender marked as read)
      if (statusUpdate.senderId && statusUpdate.recipientId &&
          msg.senderId === statusUpdate.senderId && 
          msg.recipientId === statusUpdate.recipientId &&
          statusUpdate.status === 'READ') {
        return {
          ...msg,
          status: 'READ',
          readTimestamp: statusUpdate.readTimestamp || statusUpdate.timestamp || new Date().toISOString()
        }
      }
      return msg
    }))

    messageTimestampsRef.current[statusUpdate.id] = {
      ...messageTimestampsRef.current[statusUpdate.id],
      readTimestamp: statusUpdate.readTimestamp
    }
  }, [])

  const handlePublicMessage = useCallback((message) => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${user.username}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/user/${user.username}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const fetchUndeliveredMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/undelivered/${user.username}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        // Group by sender and update badges
        const senderCounts = {}
        data.forEach(msg => {
          senderCounts[msg.senderId] = (senderCounts[msg.senderId] || 0) + 1
        })
        // Contacts will be updated via fetchContacts
      }
    } catch (error) {
      console.error('Error fetching undelivered messages:', error)
    }
  }

  const fetchMessages = async (recipientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${user.username}/${recipientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)

        // Store timestamps
        data.forEach(msg => {
          messageTimestampsRef.current[msg.id] = {
            sentTimestamp: msg.timestamp,
            readTimestamp: msg.readTimestamp
          }
        })

        // Check if there are unread messages from the recipient
        const hasUnreadMessages = data.some(
          msg => msg.senderId === recipientId && msg.status !== 'READ'
        )

        // Send read notification if there are unread messages
        if (hasUnreadMessages) {
          sendReadNotification(recipientId)
        }

        // Clear unread count for this contact immediately
        setContacts(prev => prev.map(c => 
          c.username === recipientId ? { ...c, unreadCount: 0 } : c
        ))

        // Re-fetch contacts after a delay to sync with server
        setTimeout(() => {
          fetchContacts()
        }, 500)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/messages?userId=${user.username}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (response.ok) {
        const data = await response.json()
        setGroupMessages(prev => {
          // Merge with existing messages, replacing duplicates
          const existingIds = new Set(data.map(m => m.id))
          const filteredPrev = prev.filter(m => m.groupId !== groupId || !existingIds.has(m.id))
          return [...filteredPrev, ...data]
        })
      }
    } catch (error) {
      console.error('Error fetching group messages:', error)
    }
  }

  const sendMessage = async (content) => {
    if (!stompClientRef.current?.connected || !selectedUser) return null

    const chatMessage = {
      senderId: user.username,
      recipientId: selectedUser.username,
      content,
      timestamp: new Date().toISOString(),
      status: 'SENT',
      messageType: 'TEXT'
    }

    // Optimistically add message with temp ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tempMessage = { ...chatMessage, id: tempId, tempId }
    setMessages(prev => [...prev, tempMessage])

    stompClientRef.current.publish({
      destination: '/app/chat',
      body: JSON.stringify({ ...chatMessage, tempId })
    })

    // Refresh contacts after a short delay to update last message
    setTimeout(() => {
      fetchContacts()
    }, 500)

    return tempMessage
  }

  const sendGroupMessage = async (content) => {
    if (!stompClientRef.current?.connected || !selectedGroup) return null

    const groupMessage = {
      groupId: selectedGroup.id,
      senderId: user.username,
      senderName: user.fullname,
      content,
      timestamp: new Date().toISOString(),
      messageType: 'TEXT'
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tempMessage = { ...groupMessage, id: tempId }
    setGroupMessages(prev => [...prev, tempMessage])

    stompClientRef.current.publish({
      destination: '/app/group.chat',
      body: JSON.stringify(groupMessage)
    })

    setTimeout(() => {
      fetchGroups()
    }, 500)

    return tempMessage
  }

  const sendMediaMessage = async (file, caption) => {
    if (!stompClientRef.current?.connected || !selectedUser) return null

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Upload to Cloudinary via backend
      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadResult = await response.json()
      
      // Create the message object exactly like the original JS
      const tempId = `temp-${Date.now()}`
      const now = new Date()
      const chatMessage = {
        senderId: user.username,
        recipientId: selectedUser.username,
        content: caption || '',
        timestamp: now.toISOString(),
        messageType: uploadResult.messageType,
        mediaUrl: uploadResult.url,
        mediaPublicId: uploadResult.publicId,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        status: 'SENT'
      }

      // Add message to state immediately for display
      const tempMessage = { ...chatMessage, id: tempId }
      setMessages(prev => [...prev, tempMessage])

      // Send via WebSocket
      stompClientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage)
      })

      // Refresh contacts after a short delay
      setTimeout(() => {
        fetchContacts()
      }, 500)

      return tempMessage
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Failed to upload file: ' + error.message)
      return null
    }
  }

  const sendGroupMediaMessage = async (file, caption) => {
    if (!stompClientRef.current?.connected || !selectedGroup) return null

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadResult = await response.json()
      
      const tempId = `temp-${Date.now()}`
      const groupMessage = {
        groupId: selectedGroup.id,
        senderId: user.username,
        senderName: user.fullname,
        content: caption || '',
        timestamp: new Date().toISOString(),
        messageType: uploadResult.messageType,
        mediaUrl: uploadResult.url,
        mediaPublicId: uploadResult.publicId,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType
      }

      const tempMessage = { ...groupMessage, id: tempId }
      setGroupMessages(prev => [...prev, tempMessage])

      stompClientRef.current.publish({
        destination: '/app/group.chat',
        body: JSON.stringify(groupMessage)
      })

      setTimeout(() => {
        fetchGroups()
      }, 500)

      return tempMessage
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Failed to upload file: ' + error.message)
      return null
    }
  }

  const sendReadNotification = (senderId) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({
          senderId: senderId,
          recipientId: user.username
        })
      })
    }
  }

  const searchUsers = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
    return []
  }

  const selectUser = (userToSelect) => {
    setSelectedUser(userToSelect)
    selectedUserRef.current = userToSelect
    setSelectedGroup(null)
    setChatMode('direct')
    
    if (userToSelect) {
      // Immediately clear unread badge for the selected user
      setContacts(prev => prev.map(c => 
        c.username === userToSelect.username ? { ...c, unreadCount: 0 } : c
      ))
      // Fetch messages (which will also send read notification)
      fetchMessages(userToSelect.username)
    } else {
      setMessages([])
    }
  }

  const selectGroup = (groupToSelect) => {
    setSelectedGroup(groupToSelect)
    selectedGroupRef.current = groupToSelect
    setSelectedUser(null)
    setChatMode('group')
    
    if (groupToSelect) {
      // Immediately clear unread badge for the selected group
      setGroups(prev => prev.map(g => 
        g.id === groupToSelect.id ? { ...g, unreadCount: 0 } : g
      ))
      // Fetch messages (which will also mark as read on backend)
      fetchGroupMessages(groupToSelect.id)
      // Also explicitly mark as read on backend
      markGroupAsRead(groupToSelect.id)
    }
  }

  const markGroupAsRead = async (groupId) => {
    try {
      await fetch(
        `${API_BASE_URL}/groups/${groupId}/read?userId=${user.username}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
    } catch (error) {
      console.error('Error marking group as read:', error)
    }
  }

  const createGroup = async (name, description, memberIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups?creatorId=${user.username}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, memberIds })
      })
      
      if (response.ok) {
        const newGroup = await response.json()
        await fetchGroups()
        return newGroup
      } else {
        throw new Error('Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      throw error
    }
  }

  const leaveGroup = async (groupId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/leave?userId=${user.username}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (response.ok) {
        setSelectedGroup(null)
        setChatMode('direct')
        await fetchGroups()
      }
    } catch (error) {
      console.error('Error leaving group:', error)
    }
  }

  const disconnectUser = () => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/user.disconnectUser',
        body: JSON.stringify({
          username: user.username,
          fullName: user.fullname,
          status: 'OFFLINE'
        })
      })
      stompClientRef.current.deactivate()
    }
    logout()
  }

  return (
    <ChatContext.Provider value={{
      contacts,
      selectedUser,
      messages,
      connected,
      groups,
      selectedGroup,
      groupMessages,
      chatMode,
      selectUser,
      selectGroup,
      sendMessage,
      sendGroupMessage,
      sendMediaMessage,
      sendGroupMediaMessage,
      searchUsers,
      createGroup,
      leaveGroup,
      disconnectUser,
      fetchContacts,
      fetchGroups
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
