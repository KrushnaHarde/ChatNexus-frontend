import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { X, Search, Users, Plus, Check, Loader } from 'lucide-react'

export default function CreateGroupModal({ isOpen, onClose }) {
  const { user, token } = useAuth()
  const { createGroup } = useChat()
  const [step, setStep] = useState(1) // 1: Name/Desc, 2: Add Members
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setGroupName('')
      setDescription('')
      setSearchQuery('')
      setSearchResults([])
      setSelectedMembers([])
    }
  }, [isOpen])

  // Search users with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setSearching(true)
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/search?query=${encodeURIComponent(searchQuery)}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
        if (response.ok) {
          const data = await response.json()
          // Filter out current user and already selected members
          const filtered = data.filter(
            u => u.username !== user.username && 
                 !selectedMembers.find(m => m.username === u.username)
          )
          setSearchResults(filtered)
        }
      } catch (error) {
        console.error('Error searching users:', error)
      }
      setSearching(false)
    }

    const timeout = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery, selectedMembers, token, user.username])

  const handleAddMember = (userToAdd) => {
    setSelectedMembers(prev => [...prev, userToAdd])
    setSearchResults(prev => prev.filter(u => u.username !== userToAdd.username))
    setSearchQuery('')
  }

  const handleRemoveMember = (username) => {
    setSelectedMembers(prev => prev.filter(m => m.username !== username))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return

    setLoading(true)
    try {
      const memberIds = selectedMembers.map(m => m.username)
      await createGroup(groupName.trim(), description.trim(), memberIds)
      onClose()
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Failed to create group. Please try again.')
    }
    setLoading(false)
  }

  const handleNext = () => {
    if (step === 1 && groupName.trim()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-600 border border-primary-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-500/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-100">Create Group</h2>
              <p className="text-xs text-dark-400">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Group Name & Description */}
        {step === 1 && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                maxLength={50}
                className="w-full px-4 py-3 bg-dark-700/60 border border-primary-500/20 rounded-xl text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
              <p className="text-xs text-dark-400 mt-1">{groupName.length}/50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group about?"
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 bg-dark-700/60 border border-primary-500/20 rounded-xl text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none"
              />
              <p className="text-xs text-dark-400 mt-1">{description.length}/200 characters</p>
            </div>

            <button
              onClick={handleNext}
              disabled={!groupName.trim()}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next: Add Members
            </button>
          </div>
        )}

        {/* Step 2: Add Members */}
        {step === 2 && (
          <div className="p-4 space-y-4">
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map(member => (
                  <div
                    key={member.username}
                    className="flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-3 py-1.5"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=667eea&color=fff&size=24`}
                      alt={member.fullName}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm text-dark-100">{member.fullName}</span>
                    <button
                      onClick={() => handleRemoveMember(member.username)}
                      className="text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <div className="flex items-center bg-dark-700/60 border border-primary-500/20 rounded-xl px-4 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                <Search className="w-5 h-5 text-primary-500 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users to add..."
                  className="flex-1 bg-transparent text-dark-100 placeholder-dark-400 outline-none"
                />
                {searching && <Loader className="w-4 h-4 text-primary-500 animate-spin" />}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-700 border border-primary-500/20 rounded-xl max-h-48 overflow-y-auto z-10 shadow-xl">
                  {searchResults.map(result => (
                    <div
                      key={result.username}
                      onClick={() => handleAddMember(result)}
                      className="flex items-center gap-3 p-3 hover:bg-primary-500/10 cursor-pointer transition-colors border-b border-primary-500/10 last:border-b-0"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.fullName)}&background=667eea&color=fff&size=36`}
                        alt={result.fullName}
                        className="w-9 h-9 rounded-full border-2 border-primary-500/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark-100 text-sm truncate">{result.fullName}</p>
                        <p className="text-xs text-dark-400">@{result.username}</p>
                      </div>
                      <Plus className="w-5 h-5 text-primary-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-dark-400 text-center">
              {selectedMembers.length === 0 
                ? "You can add members now or later" 
                : `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 bg-dark-700/60 border border-primary-500/20 text-dark-200 font-medium rounded-xl hover:bg-dark-700 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
