import { useState } from 'react'
import { Check, CheckCheck, X, Clock } from 'lucide-react'

export default function Message({ message, isSender }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatFullTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (isToday) {
      return `Today at ${timeStr}`
    }
    if (isYesterday) {
      return `Yesterday at ${timeStr}`
    }
    return `${date.toLocaleDateString()} at ${timeStr}`
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'SENT':
        return <Check className="w-3 h-3" />
      case 'DELIVERED':
        return <CheckCheck className="w-3 h-3" />
      case 'READ':
        return <CheckCheck className="w-3 h-3 text-blue-400" />
      default:
        return <Clock className="w-3 h-3 opacity-60" />
    }
  }

  const getStatusText = () => {
    switch (message.status) {
      case 'SENT': return 'Sent'
      case 'DELIVERED': return 'Delivered'
      case 'READ': return 'Read'
      default: return 'Sending...'
    }
  }

  const renderContent = () => {
    const { messageType, mediaUrl, content, fileName } = message

    // Check for media types - handle both url and mediaUrl fields
    const url = mediaUrl || message.url

    if (messageType === 'IMAGE' && url) {
      return (
        <div className="space-y-2">
          <img
            src={url}
            alt={fileName || 'Shared image'}
            className="max-w-[280px] max-h-[300px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity object-cover"
            onClick={() => setLightboxOpen(true)}
            loading="lazy"
          />
          {content && <p className="text-sm">{content}</p>}
        </div>
      )
    }

    if (messageType === 'VIDEO' && url) {
      return (
        <div className="space-y-2">
          <video
            src={url}
            controls
            preload="metadata"
            className="max-w-[280px] max-h-[300px] rounded-xl"
          />
          {content && <p className="text-sm">{content}</p>}
        </div>
      )
    }

    if (messageType === 'AUDIO' && url) {
      return (
        <div className="space-y-2">
          {fileName && (
            <div className="flex items-center gap-2 text-xs opacity-70">
              <span>🎵</span>
              <span className="truncate max-w-[200px]">{fileName}</span>
            </div>
          )}
          <audio src={url} controls preload="metadata" className="w-[250px]" />
          {content && <p className="text-sm">{content}</p>}
        </div>
      )
    }

    return <p className="text-sm md:text-base leading-relaxed break-words">{content}</p>
  }

  return (
    <>
      <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-message-in`}>
        <div className={`relative max-w-[75%] md:max-w-[70%] group ${isSender ? 'order-2' : ''}`}>
          {/* Message Bubble */}
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isSender
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-md'
                : 'bg-dark-700/80 text-dark-100 border border-primary-500/20 rounded-bl-md'
            }`}
          >
            {renderContent()}
            
            {/* Inline timestamp and status */}
            <div className={`flex items-center gap-1.5 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] ${isSender ? 'text-white/60' : 'text-dark-400'}`}>
                {formatTime(message.timestamp)}
              </span>
              {isSender && (
                <span className="text-white/70">
                  {getStatusIcon()}
                </span>
              )}
            </div>
          </div>

          {/* Detailed Timestamp Tooltip on Hover */}
          <div className={`
            absolute bottom-full mb-2 px-3 py-2 
            bg-dark-800/95 text-dark-200 text-xs rounded-xl
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            whitespace-nowrap pointer-events-none z-10
            border border-primary-500/30 shadow-lg shadow-black/30
            ${isSender ? 'right-0' : 'left-0'}
          `}>
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-3 h-3 text-primary-400" />
              <span>Sent: {formatFullTime(message.timestamp)}</span>
            </div>
            {message.status === 'DELIVERED' && !message.readTimestamp && (
              <div className="flex items-center gap-2">
                <CheckCheck className="w-3 h-3 text-dark-300" />
                <span>Delivered</span>
              </div>
            )}
            {message.readTimestamp && (
              <div className="flex items-center gap-2">
                <CheckCheck className="w-3 h-3 text-blue-400" />
                <span>Read: {formatFullTime(message.readTimestamp)}</span>
              </div>
            )}
            {isSender && (
              <div className="mt-1.5 pt-1.5 border-t border-dark-600 text-dark-400">
                Status: {getStatusText()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for images */}
      {lightboxOpen && (message.mediaUrl || message.url) && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-5 right-5 text-white hover:text-primary-500 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={message.mediaUrl || message.url}
            alt="Full size"
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
