import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import toast from 'react-hot-toast'

export interface UserProfile {
  userId: string
  email: string
  walletAddress: string
  inrBalance: number
  cryptoBalances: {
    BTC: number
    USDT: number
    BXC: number
  }
  preferences?: {
    emailNotifications: boolean
    pushNotifications: boolean
    autoRefresh: boolean
  }
  createdAt: Date
  updatedAt: Date
}

interface AuthContextType {
  currentUser: User | null
  userProfile: UserProfile | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const generateWalletAddress = (): string => {
    const chars = '0123456789abcdef'
    let address = '0x'
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  const createUserProfile = async (user: User): Promise<UserProfile> => {
    const profile: UserProfile = {
      userId: user.uid,
      email: user.email || '',
      walletAddress: generateWalletAddress(),
      inrBalance: 0,
      cryptoBalances: {
        BTC: 0,
        USDT: 0,
        BXC: 0
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: false,
        autoRefresh: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await setDoc(doc(db, 'users', user.uid), profile)
    return profile
  }

  const loadUserProfile = async (user: User): Promise<void> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserProfile({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile)
      } else {
        const newProfile = await createUserProfile(user)
        setUserProfile(newProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      toast.error('Error loading profile')
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Login successful!')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(getErrorMessage(error.code))
      throw error
    }
  }

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast.success('Account created successfully!')
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(getErrorMessage(error.code))
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      setUserProfile(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
      throw error
    }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser || !userProfile) return

    try {
      const updatedProfile = {
        ...updates,
        updatedAt: new Date()
      }
      
      await updateDoc(doc(db, 'users', currentUser.uid), updatedProfile)
      setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
      throw error
    }
  }

  const refreshUserProfile = async (): Promise<void> => {
    if (currentUser) {
      await loadUserProfile(currentUser)
    }
  }

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/email-already-in-use':
        return 'Email already registered'
      case 'auth/weak-password':
        return 'Password is too weak'
      case 'auth/invalid-email':
        return 'Invalid email address'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await loadUserProfile(user)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    signup,
    logout,
    loading,
    updateUserProfile,
    refreshUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
