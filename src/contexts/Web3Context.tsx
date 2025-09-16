import React, { createContext, useContext, useEffect, useState } from 'react'
import Web3 from 'web3'
import { CONTRACT_CONFIG, CRYPTO_WALLET_ABI, BXC_TOKEN_ABI, ERC20_ABI } from '../config/contracts'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    ethereum?: any
    web3?: any
  }
}

interface Web3ContextType {
  web3: Web3 | null
  account: string | null
  isConnected: boolean
  chainId: string | null
  contract: any
  connectWallet: () => Promise<void>
  switchToSepolia: () => Promise<void>
  getNetworkStatus: () => string
  validateUserBalances: () => Promise<void>
  refreshAllBalances: () => Promise<void>
  updateUserCryptoBalance: (currency: string, newBalance: number) => Promise<void>
  logTransaction: (type: string, amount: number, currency: string, description: string, txHash?: string) => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<string | null>(null)
  const [contract, setContract] = useState<any>(null)
  
  const { currentUser, updateUserProfile } = useAuth()

  const initWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum)
        setWeb3(web3Instance)

        // Create contract instance
        const contractInstance = new web3Instance.eth.Contract(
          CRYPTO_WALLET_ABI,
          CONTRACT_CONFIG.contracts.cryptoWallet
        )
        setContract(contractInstance)

        // Check if already connected
        const accounts = await web3Instance.eth.getAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          const currentChainId = await web3Instance.eth.getChainId()
          setChainId(`0x${currentChainId.toString(16)}`)
        }
      } catch (error) {
        console.error('Error initializing Web3:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!')
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        const currentChainId = await web3!.eth.getChainId()
        setChainId(`0x${currentChainId.toString(16)}`)
        toast.success('Wallet connected successfully!')
        
        // Switch to Sepolia if not already on it
        await switchToSepolia()
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }

  const switchToSepolia = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONTRACT_CONFIG.networks.sepolia.chainId }]
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CONTRACT_CONFIG.networks.sepolia.chainId,
                chainName: CONTRACT_CONFIG.networks.sepolia.chainName,
                nativeCurrency: CONTRACT_CONFIG.networks.sepolia.nativeCurrency,
                rpcUrls: CONTRACT_CONFIG.networks.sepolia.rpcUrls,
                blockExplorerUrls: CONTRACT_CONFIG.networks.sepolia.blockExplorerUrls
              }
            ]
          })
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError)
          toast.error('Failed to add Sepolia network')
        }
      } else {
        console.error('Error switching to Sepolia:', switchError)
        toast.error('Failed to switch to Sepolia network')
      }
    }
  }

  const getNetworkStatus = (): string => {
    if (!isConnected) return 'Not Connected'
    if (chainId === CONTRACT_CONFIG.networks.sepolia.chainId) {
      return 'Connected to Sepolia'
    }
    return 'Wrong Network'
  }

  const validateUserBalances = async () => {
    if (!web3 || !account || !currentUser) return

    try {
      // Check USDT balance
      const usdtContract = new web3.eth.Contract(ERC20_ABI, CONTRACT_CONFIG.contracts.usdt)
      const usdtBalance = await usdtContract.methods.balanceOf(account).call()
      const usdtBalanceFormatted = parseFloat(web3.utils.fromWei(usdtBalance, 'ether'))

      // Check BXC balance
      const bxcContract = new web3.eth.Contract(BXC_TOKEN_ABI, CONTRACT_CONFIG.contracts.bxc)
      const bxcBalance = await bxcContract.methods.balanceOf(account).call()
      const bxcBalanceFormatted = parseFloat(web3.utils.fromWei(bxcBalance, 'ether'))

      // Update user profile with actual balances
      await updateUserProfile({
        cryptoBalances: {
          BTC: 0, // BTC not supported on Sepolia
          USDT: usdtBalanceFormatted,
          BXC: bxcBalanceFormatted
        }
      })
    } catch (error) {
      console.error('Error validating balances:', error)
    }
  }

  const refreshAllBalances = async () => {
    await validateUserBalances()
    toast.success('Balances refreshed!')
  }

  const updateUserCryptoBalance = async (currency: string, newBalance: number) => {
    if (!currentUser) return

    try {
      await updateUserProfile({
        cryptoBalances: {
          BTC: currency === 'BTC' ? newBalance : 0,
          USDT: currency === 'USDT' ? newBalance : 0,
          BXC: currency === 'BXC' ? newBalance : 0
        }
      })
    } catch (error) {
      console.error('Error updating crypto balance:', error)
    }
  }

  const logTransaction = async (
    type: string,
    amount: number,
    currency: string,
    description: string,
    txHash?: string
  ) => {
    if (!currentUser) return

    try {
      // This would typically be handled by the transaction service
      console.log('Transaction logged:', { type, amount, currency, description, txHash })
    } catch (error) {
      console.error('Error logging transaction:', error)
    }
  }

  useEffect(() => {
    initWeb3()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount(null)
          setIsConnected(false)
        }
      })

      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId)
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [])

  const value: Web3ContextType = {
    web3,
    account,
    isConnected,
    chainId,
    contract,
    connectWallet,
    switchToSepolia,
    getNetworkStatus,
    validateUserBalances,
    refreshAllBalances,
    updateUserCryptoBalance,
    logTransaction
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}
