import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, User, Lock, UserPlus, LogIn, AtSign } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  // Login form state
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regUsername, setRegUsername] = useState('')
  const [regFullname, setRegFullname] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(loginUsername, loginPassword)
    
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const result = await register(regUsername, regFullname, regPassword)
    
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col items-center justify-start sm:justify-center py-6 px-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-500" />
          <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            ChatNexus
          </span>
        </div>
        <p className="text-dark-300 text-xs sm:text-sm">Real-time messaging powered by WebSocket</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md p-4 sm:p-6 md:p-10 bg-dark-600/80 backdrop-blur-xl border border-primary-500/20 rounded-2xl shadow-2xl flex-shrink-0">
        {/* Form Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
            <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-dark-300 text-xs sm:text-sm">
            {isLogin ? 'Sign in to continue' : 'Register to get started'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="flex items-center gap-2 text-dark-200 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                <AtSign className="w-4 h-4 text-primary-500" />
                Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-700/60 border border-primary-500/30 rounded-xl text-dark-100 placeholder-dark-400 text-sm sm:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-dark-200 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                <Lock className="w-4 h-4 text-primary-500" />
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-700/60 border border-primary-500/30 rounded-xl text-dark-100 placeholder-dark-400 text-sm sm:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 text-sm sm:text-base hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
            <div>
              <label className="flex items-center gap-2 text-dark-200 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                <AtSign className="w-4 h-4 text-primary-500" />
                Username
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={20}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-700/60 border border-primary-500/30 rounded-xl text-dark-100 placeholder-dark-400 text-sm sm:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-dark-200 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                <User className="w-4 h-4 text-primary-500" />
                Full Name
              </label>
              <input
                type="text"
                value={regFullname}
                onChange={(e) => setRegFullname(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-700/60 border border-primary-500/30 rounded-xl text-dark-100 placeholder-dark-400 text-sm sm:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-dark-200 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                <Lock className="w-4 h-4 text-primary-500" />
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-700/60 border border-primary-500/30 rounded-xl text-dark-100 placeholder-dark-400 text-sm sm:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-dark-200 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                <Lock className="w-4 h-4 text-primary-500" />
                Confirm Password
              </label>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-700/60 border border-primary-500/30 rounded-xl text-dark-100 placeholder-dark-400 text-sm sm:text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3.5 mt-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 text-sm sm:text-base hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle Auth Mode */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary-500/15 text-center">
          <p className="text-dark-300 text-xs sm:text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-primary-500 font-semibold hover:text-secondary-500 transition-colors"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
