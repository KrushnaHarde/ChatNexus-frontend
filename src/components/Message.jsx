import { useState, useRef, useEffect } from 'react'
import { Check, CheckCheck, X, Clock, Play, Pause, Volume2 } from 'lucide-react'

export default function Message({ message, isSender, isGroupMessage = false }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

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
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] overflow-hidden rounded-xl">
            <img
              src={url}
              alt={fileName || 'Shared image'}
              className="w-full h-auto max-h-[300px] sm:max-h-[350px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity object-contain bg-dark-800/50"
              onClick={() => setLightboxOpen(true)}
              loading="lazy"
            />
          </div>
          {content && <p className="text-sm mt-2">{content}</p>}
        </div>
      )
    }

    if (messageType === 'VIDEO' && url) {
      return (
        <div className="space-y-2">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] overflow-hidden rounded-xl bg-dark-800/50">
            <video
              src={url}
              controls
              preload="metadata"
              className="w-full h-auto max-h-[300px] sm:max-h-[350px] rounded-xl"
            />
          </div>
          {content && <p className="text-sm mt-2">{content}</p>}
        </div>
      )
    }

    if (messageType === 'AUDIO' && url) {
      const formatAudioTime = (time) => {
        if (!time || isNaN(time)) return '0:00'
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
      }

      const togglePlay = () => {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause()
          } else {
            audioRef.current.play()
          }
          setIsPlaying(!isPlaying)
        }
      }

      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime)
        }
      }

      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration)
        }
      }

      const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = x / rect.width
        if (audioRef.current) {
          audioRef.current.currentTime = percentage * duration
        }
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      const progress = duration ? (currentTime / duration) * 100 : 0

      return (
        <div className="space-y-2 w-full min-w-[200px] max-w-[280px] sm:min-w-[260px] sm:max-w-[320px] md:min-w-[280px] md:max-w-[360px]">
          {fileName && (
            <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
              <span className="text-base">🎵</span>
              <span className="truncate max-w-[180px] sm:max-w-[240px] font-medium">{fileName}</span>
            </div>
          )}
          
          {/* Custom Audio Player */}
          <div className={`rounded-2xl p-3 ${
            isSender 
              ? 'bg-white/10 backdrop-blur-sm' 
              : 'bg-primary-500/10 border border-primary-500/20'
          }`}>
            <audio
              ref={audioRef}
              src={url}
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              className="hidden"
            />
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  isSender
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                )}
              </button>
              
              {/* Progress Section */}
              <div className="flex-1 min-w-0">
                {/* Progress Bar */}
                <div
                  className="h-2 bg-dark-600/50 rounded-full cursor-pointer overflow-hidden mb-1.5"
                  onClick={handleSeek}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-100 ${
                      isSender ? 'bg-white/70' : 'bg-primary-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Time Display */}
                <div className="flex justify-between text-[11px] sm:text-xs opacity-70">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
              </div>
              
              {/* Volume Icon - hidden on very small screens */}
              <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 opacity-60 hidden sm:block ${
                isSender ? 'text-white' : 'text-primary-400'
              }`} />
            </div>
          </div>
          
          {content && <p className="text-sm mt-2">{content}</p>}
        </div>
      )
    }

    return <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{content}</p>
  }

  // Check if message contains media
  const hasMedia = message.messageType === 'IMAGE' || message.messageType === 'VIDEO' || message.messageType === 'AUDIO'

  return (
    <>
      <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-message-in px-2 sm:px-0`}>
        <div className={`relative ${hasMedia ? 'max-w-[85%] sm:max-w-[75%] md:max-w-[70%]' : 'max-w-[50%]'} group ${isSender ? 'order-2' : ''}`}>
          {/* Message Bubble */}
          <div
            className={`px-3 sm:px-4 py-2.5 rounded-2xl w-fit ${
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
              {isSender && !isGroupMessage && (
                <span className="text-white/70">
                  {getStatusIcon()}
                </span>
              )}
              {isSender && isGroupMessage && (
                <span className="text-white/70">
                  <Check className="w-3 h-3" />
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
            {!isGroupMessage && message.status === 'DELIVERED' && !message.readTimestamp && (
              <div className="flex items-center gap-2">
                <CheckCheck className="w-3 h-3 text-dark-300" />
                <span>Delivered</span>
              </div>
            )}
            {!isGroupMessage && message.readTimestamp && (
              <div className="flex items-center gap-2">
                <CheckCheck className="w-3 h-3 text-blue-400" />
                <span>Read: {formatFullTime(message.readTimestamp)}</span>
              </div>
            )}
            {isSender && !isGroupMessage && (
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
