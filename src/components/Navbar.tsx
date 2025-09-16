import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

const Navbar: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authType, setAuthType] = useState<'login' | 'signup'>('login')
  const { currentUser, logout } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleAuthModal = (type: 'login' | 'signup') => {
    setAuthType(type)
    setShowAuthModal(true)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <nav className="animate-fadeInUp" style={{ padding: '0.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link 
            to="/" 
            className="hover-glow"
            style={{ 
              textDecoration: 'none', 
              fontSize: '1.4rem', 
              fontWeight: '800', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transition: 'all 0.3s ease'
            }}
          >
            🚀 CryptoPay
          </Link>

          {/* Desktop Navigation */}
          <div className="animate-fadeInRight" style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1001 }}>
            {currentUser ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="hover-lift"
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive('/dashboard') ? '#ffd700' : '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: isActive('/dashboard') ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    border: isActive('/dashboard') ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/deposit" 
                  className="hover-lift"
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive('/deposit') ? '#ffd700' : '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: isActive('/deposit') ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    border: isActive('/deposit') ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  💰 Deposit
                </Link>
                <Link 
                  to="/withdraw" 
                  className="hover-lift"
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive('/withdraw') ? '#ffd700' : '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: isActive('/withdraw') ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    border: isActive('/withdraw') ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  🏦 Withdraw
                </Link>
                <Link 
                  to="/send" 
                  className="hover-lift"
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive('/send') ? '#ffd700' : '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: isActive('/send') ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    border: isActive('/send') ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  📤 Send
                </Link>
                <Link 
                  to="/history" 
                  className="hover-lift"
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive('/history') ? '#ffd700' : '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: isActive('/history') ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    border: isActive('/history') ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  📋 History
                </Link>
                <Link 
                  to="/profile" 
                  className="hover-lift"
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive('/profile') ? '#ffd700' : '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: isActive('/profile') ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    border: isActive('/profile') ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  👤 Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="btn-danger hover-lift"
                  style={{ 
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="animate-fadeInRight" style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleAuthModal('login')}
                  className="hover-lift"
                  style={{ 
                    background: 'rgba(255, 215, 0, 0.1)',
                    color: '#ffd700',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  🔑 Login
                </button>
                <button 
                  onClick={() => handleAuthModal('signup')}
                  className="hover-lift"
                  style={{ 
                    background: 'linear-gradient(135deg, #000000 0%, #ffd700 100%)',
                    color: 'white', 
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
                  }}
                >
                  🚀 Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          type={authType}
          onClose={() => setShowAuthModal(false)}
          onSwitchType={(type) => setAuthType(type)}
        />
      )}
    </>
  )
}

export default Navbar