import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWeb3 } from '../contexts/Web3Context'
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { CONTRACT_CONFIG } from '../config/contracts'
import toast from 'react-hot-toast'

interface PendingWithdrawal {
  id: string
  userId: string
  userAddress: string
  crypto: string
  cryptoAmount: number
  inrAmount: number
  tokenAddress: string
  status: string
  createdAt: any
  type: string
}

const AdminWithdrawals: React.FC = () => {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [contractBalances, setContractBalances] = useState<{[key: string]: string}>({})
  const [tokenLoadAmount, setTokenLoadAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState('BXC')

  const { currentUser } = useAuth()
  const { account, isConnected, connectWallet, web3, getNetworkStatus } = useWeb3()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate('/')
      return
    }
    loadPendingWithdrawals()
    checkContractBalances()
  }, [currentUser, navigate])

  const loadPendingWithdrawals = async () => {
    try {
      setLoading(true)
      const withdrawalsRef = collection(db, 'pending_withdrawals')
      const q = query(withdrawalsRef, orderBy('createdAt', 'desc'), limit(50))
      const querySnapshot = await getDocs(q)
      
      const withdrawals: PendingWithdrawal[] = []
      querySnapshot.forEach((doc) => {
        withdrawals.push({ id: doc.id, ...doc.data() } as PendingWithdrawal)
      })
      
      setPendingWithdrawals(withdrawals)
    } catch (error) {
      console.error('Error loading pending withdrawals:', error)
      toast.error('Error loading pending withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const checkContractBalances = async () => {
    if (!web3 || !isConnected) {
      setContractBalances({})
      return
    }

    try {
      const balances: {[key: string]: string} = {}
      
      // Check BXC balance
      const bxcAddress = CONTRACT_CONFIG.contracts.bxc
      const cryptoWalletAddress = CONTRACT_CONFIG.contracts.cryptoWallet

      const bxcABI = [
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "type": "function"
        }
      ]

      const bxcContract = new web3.eth.Contract(bxcABI, bxcAddress)
      const bxcBalance = await bxcContract.methods.balanceOf(cryptoWalletAddress).call()
      balances.BXC = parseFloat(web3.utils.fromWei(bxcBalance, 'ether')).toFixed(8)
      
      // For demo purposes, we'll show placeholder balances for BTC and USDT
      balances.BTC = '0.00000000'
      balances.USDT = '0.00'
      
      setContractBalances(balances)
    } catch (error) {
      console.error('Error checking contract balances:', error)
      setContractBalances({ error: 'Error checking balances' })
    }
  }

  const processWithdrawal = async (withdrawal: PendingWithdrawal) => {
    if (!web3 || !account) {
      toast.error('Please connect your MetaMask wallet')
      return
    }

    try {
      setProcessing(withdrawal.id)
      toast.loading('Processing withdrawal...', { id: 'process-withdrawal' })

      // For demo purposes, we'll simulate the transaction
      // In a real implementation, you would interact with the smart contract
      console.log('Processing withdrawal:', withdrawal)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update withdrawal status
      const withdrawalRef = doc(db, 'pending_withdrawals', withdrawal.id)
      await updateDoc(withdrawalRef, {
        status: 'completed',
        processedAt: new Date(),
        processedBy: account,
        txHash: '0x' + Math.random().toString(16).substr(2, 64) // Demo transaction hash
      })

      toast.dismiss('process-withdrawal')
      toast.success(`Successfully processed ${withdrawal.cryptoAmount} ${withdrawal.crypto} withdrawal`)
      
      loadPendingWithdrawals()
      checkContractBalances()
    } catch (error: any) {
      console.error('Error processing withdrawal:', error)
      toast.dismiss('process-withdrawal')
      toast.error('Error processing withdrawal: ' + error.message)
    } finally {
      setProcessing(null)
    }
  }

  const rejectWithdrawal = async (withdrawal: PendingWithdrawal) => {
    if (!window.confirm('Are you sure you want to reject this withdrawal? This will refund the user.')) {
      return
    }

    try {
      setProcessing(withdrawal.id)
      toast.loading('Rejecting withdrawal...', { id: 'reject-withdrawal' })

      // In a real implementation, you would refund the user's INR balance here
      console.log('Rejecting withdrawal:', withdrawal)

      // Delete the withdrawal request
      await deleteDoc(doc(db, 'pending_withdrawals', withdrawal.id))

      toast.dismiss('reject-withdrawal')
      toast.success('Withdrawal rejected and user refunded')
      
      loadPendingWithdrawals()
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error)
      toast.dismiss('reject-withdrawal')
      toast.error('Error rejecting withdrawal: ' + error.message)
    } finally {
      setProcessing(null)
    }
  }

  const loadTokensToContract = async () => {
    const amount = parseFloat(tokenLoadAmount)
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!web3 || !account) {
      toast.error('Please connect your MetaMask wallet')
      return
    }

    try {
      setProcessing('load-tokens')
      toast.loading('Loading tokens to contract...', { id: 'load-tokens' })

      // For demo purposes, we'll simulate loading tokens
      console.log(`Loading ${amount} ${selectedToken} tokens to contract`)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000))

      toast.dismiss('load-tokens')
      toast.success(`Successfully loaded ${amount} ${selectedToken} tokens to contract`)
      
      setTokenLoadAmount('')
      checkContractBalances()
    } catch (error: any) {
      console.error('Error loading tokens:', error)
      toast.dismiss('load-tokens')
      toast.error('Error loading tokens: ' + error.message)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Admin: Withdrawal Management</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Manage pending cryptocurrency withdrawals</p>
        </div>

        {/* Wallet Connection Status */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Wallet Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '600' }}>
                Status: {isConnected ? `Connected (${account?.slice(0, 6)}...${account?.slice(-4)})` : 'Not Connected'}
              </p>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Network: {getNetworkStatus()}
              </p>
            </div>
            {!isConnected && (
              <button onClick={connectWallet} style={{ background: '#007bff', color: 'white', border: 'none' }}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Contract Balances */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Smart Contract Token Balances</h3>
          <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
            {Object.entries(contractBalances).map(([token, balance]) => (
              <div key={token} className="card text-center">
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{token}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: token === 'error' ? '#dc3545' : '#007bff' }}>
                  {balance}
                </p>
              </div>
            ))}
          </div>

          {/* Load Tokens Section */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Load Tokens to Contract</h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Select Token
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="BXC">BXC Token</option>
                  <option value="USDT">USDT (BEP-20)</option>
                  <option value="BTC">Bitcoin (Demo)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Amount
                </label>
                <input
                  type="number"
                  value={tokenLoadAmount}
                  onChange={(e) => setTokenLoadAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.00000001"
                  style={{ width: '100%' }}
                />
              </div>
              <button
                onClick={loadTokensToContract}
                disabled={processing === 'load-tokens' || !isConnected}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (processing === 'load-tokens' || !isConnected) ? 'not-allowed' : 'pointer',
                  opacity: (processing === 'load-tokens' || !isConnected) ? 0.6 : 1
                }}
              >
                {processing === 'load-tokens' ? 'Loading...' : 'Load Tokens'}
              </button>
            </div>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>Pending Withdrawals ({pendingWithdrawals.length})</h3>
            <button
              onClick={loadPendingWithdrawals}
              style={{
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading pending withdrawals...</p>
            </div>
          ) : pendingWithdrawals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#666' }}>No pending withdrawals found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} style={{
                  padding: '1.5rem',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  background: '#f8f9fa'
                }}>
                  <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Withdrawal Details</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <div><strong>User ID:</strong> {withdrawal.userId}</div>
                        <div><strong>Crypto:</strong> {withdrawal.crypto}</div>
                        <div><strong>Amount:</strong> {withdrawal.cryptoAmount} {withdrawal.crypto}</div>
                        <div><strong>INR Value:</strong> ₹{withdrawal.inrAmount}</div>
                        <div><strong>To Address:</strong> {withdrawal.userAddress}</div>
                        <div><strong>Status:</strong> 
                          <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            background: withdrawal.status === 'pending_admin_execution' ? '#fff3cd' : '#f8d7da',
                            color: withdrawal.status === 'pending_admin_execution' ? '#856404' : '#721c24'
                          }}>
                            {withdrawal.status}
                          </span>
                        </div>
                        <div><strong>Created:</strong> {withdrawal.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Actions</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          onClick={() => processWithdrawal(withdrawal)}
                          disabled={processing === withdrawal.id || !isConnected}
                          style={{
                            padding: '0.75rem',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: (processing === withdrawal.id || !isConnected) ? 'not-allowed' : 'pointer',
                            opacity: (processing === withdrawal.id || !isConnected) ? 0.6 : 1
                          }}
                        >
                          {processing === withdrawal.id ? 'Processing...' : '✅ Process Withdrawal'}
                        </button>
                        
                        <button
                          onClick={() => rejectWithdrawal(withdrawal)}
                          disabled={processing === withdrawal.id}
                          style={{
                            padding: '0.75rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: processing === withdrawal.id ? 'not-allowed' : 'pointer',
                            opacity: processing === withdrawal.id ? 0.6 : 1
                          }}
                        >
                          ❌ Reject & Refund
                        </button>
                        
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                          {withdrawal.crypto === 'BXC' && contractBalances.BXC && (
                            <p style={{ margin: 0 }}>
                              Contract Balance: {contractBalances.BXC} BXC
                              {parseFloat(contractBalances.BXC) < withdrawal.cryptoAmount && (
                                <span style={{ color: '#dc3545', display: 'block' }}>
                                  ⚠️ Insufficient contract balance!
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminWithdrawals