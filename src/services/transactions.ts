import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export interface Transaction {
  id?: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'send' | 'receive' | 'transfer'
  amount: number
  currency: string
  description: string
  message?: string
  status: 'pending' | 'completed' | 'failed' | 'processing'
  timestamp: Date
  txHash?: string
  toAddress?: string
  fromAddress?: string
}

export class TransactionService {
  static async logTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        timestamp: Timestamp.now()
      })
      return docRef.id
    } catch (error) {
      console.error('Error logging transaction:', error)
      throw error
    }
  }

  static async getUserTransactions(
    userId: string,
    transactionType?: string,
    limitCount: number = 50
  ): Promise<Transaction[]> {
    try {
      // Use a simpler query that doesn't require composite indexes
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        limit(limitCount * 2) // Get more to filter client-side
      )

      const querySnapshot = await getDocs(q)
      const transactions: Transaction[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const transaction = {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Transaction

        // Filter by type if specified
        if (!transactionType || transaction.type === transactionType) {
          transactions.push(transaction)
        }
      })

      // Sort by timestamp descending and limit
      transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      return transactions.slice(0, limitCount)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // Return empty array instead of throwing to prevent app crash
      return []
    }
  }

  static async getRecentDeposits(userId: string, limitCount: number = 10): Promise<Transaction[]> {
    return this.getUserTransactions(userId, 'deposit', limitCount)
  }

  static async getRecentWithdrawals(userId: string, limitCount: number = 10): Promise<Transaction[]> {
    return this.getUserTransactions(userId, 'withdrawal', limitCount)
  }

  static async getRecentTransfers(userId: string, limitCount: number = 10): Promise<Transaction[]> {
    const sends = await this.getUserTransactions(userId, 'send', limitCount)
    const receives = await this.getUserTransactions(userId, 'receive', limitCount)
    
    // Combine and sort by timestamp
    const allTransfers = [...sends, ...receives]
    allTransfers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    return allTransfers.slice(0, limitCount)
  }

  static formatAmount(amount: number, currency: string): string {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else if (currency === 'BTC') {
      return `${amount.toFixed(8)} BTC`
    } else if (currency === 'USDT') {
      return `${amount.toFixed(2)} USDT`
    } else if (currency === 'BXC') {
      return `${amount.toFixed(2)} BXC`
    }
    return `${amount} ${currency}`
  }

  static formatDate(timestamp: Date): string {
    const now = new Date()
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday, ' + timestamp.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  static getCurrencyIcon(currency: string): string {
    const iconMap: Record<string, string> = {
      'INR': 'fas fa-rupee-sign',
      'BTC': 'fab fa-bitcoin',
      'USDT': 'fas fa-dollar-sign',
      'BXC': 'fas fa-coins'
    }
    return iconMap[currency] || 'fas fa-rupee-sign'
  }

  static getCurrencyIconClass(currency: string): string {
    const iconMap: Record<string, string> = {
      'INR': 'inr',
      'BTC': 'btc',
      'USDT': 'usdt',
      'BXC': 'bxc'
    }
    return iconMap[currency] || 'inr'
  }

  static getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'completed': 'success',
      'pending': 'pending',
      'failed': 'failed',
      'processing': 'pending'
    }
    return statusMap[status] || 'pending'
  }

  static getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'completed': 'fas fa-check',
      'pending': 'fas fa-clock',
      'failed': 'fas fa-times',
      'processing': 'fas fa-spinner fa-spin'
    }
    return iconMap[status] || 'fas fa-clock'
  }

  static getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'completed': 'Completed',
      'pending': 'Pending',
      'failed': 'Failed',
      'processing': 'Processing'
    }
    return textMap[status] || 'Pending'
  }
}
