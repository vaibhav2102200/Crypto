import { CASHFREE_CONFIG } from '../config/cashfree'
import { auth } from '../config/firebase'
import { mongoDBService } from './mongodb'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Cashfree?: any
  }
}

export class CashfreeManager {
  private cashfree: any = null
  private currentOrder: any = null
  private isProcessing = false
  public isInitialized = false
  private config: any

  constructor() {
    console.log('CashfreeManager constructor called')
    this.config = CASHFREE_CONFIG.getCurrentConfig()
    console.log('CashfreeManager config:', this.config)
    
    this.init().then(() => {
      this.isInitialized = true
      console.log('CashfreeManager fully initialized')
    }).catch(error => {
      console.error('CashfreeManager initialization failed:', error)
      this.createFallbackIntegration()
    })
  }

  async init() {
    try {
      console.log('CashfreeManager init called')
      
      // For demo purposes, we'll use a fallback integration
      // In production, you would load the actual Cashfree SDK
      console.log('Creating fallback Cashfree integration...')
      await this.createFallbackIntegration()
      
    } catch (error) {
      console.error('Cashfree initialization error:', error)
      await this.createFallbackIntegration()
    }
  }

  // Create fallback integration when scripts fail
  async createFallbackIntegration() {
    console.log('Creating fallback Cashfree integration...')
    
    this.isInitialized = true
    
    this.cashfree = {
      checkout: (options: any) => {
        console.log('Fallback Cashfree checkout initialized with options:', options)
        return this.createMockCheckout(options)
      }
    }
    
    console.log('Fallback integration created successfully')
    
    console.log('💡 Using demo payment system for testing')
    console.log('💡 In production, ensure Cashfree SDK is properly loaded')
    
    this.addTestModeIndicator()
  }

  // Add visual indicator that system is in test mode
  addTestModeIndicator() {
    try {
      const existingIndicator = document.getElementById('cashfree-test-mode-indicator')
      if (existingIndicator) {
        existingIndicator.remove()
      }
      
      const indicator = document.createElement('div')
      indicator.id = 'cashfree-test-mode-indicator'
      indicator.innerHTML = `
        <div style="
          position: fixed;
          top: 70px;
          right: 10px;
          background: #f59e0b;
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span>🧪</span>
          <span>Demo Mode</span>
        </div>
      `
      
      document.body.appendChild(indicator)
      
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.style.opacity = '0.7'
        }
      }, 5000)
      
    } catch (error) {
      console.error('Error adding test mode indicator:', error)
    }
  }

  // Create mock checkout when Cashfree is unavailable
  createMockCheckout(options: any) {
    console.log('Mock Cashfree checkout initialized')
    
    return new Promise((resolve, reject) => {
      // Create a more user-friendly demo payment interface
      this.createDemoPaymentInterface(options, resolve, reject)
    })
  }

  // Create a visual demo payment interface
  createDemoPaymentInterface(options: any, resolve: Function, reject: Function) {
    // Remove any existing demo interface
    const existingDemo = document.getElementById('cashfree-demo-interface')
    if (existingDemo) {
      existingDemo.remove()
    }

    // Create demo payment modal
    const demoModal = document.createElement('div')
    demoModal.id = 'cashfree-demo-interface'
    demoModal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
      ">
        <div style="
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          text-align: center;
          color: white;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🧪</div>
          <h2 style="
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
            font-size: 1.8rem;
            font-weight: 800;
          ">Demo Payment</h2>
          
          <div style="
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
          ">
            <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">
              Amount: ₹${this.currentOrder?.order_amount || 'Unknown'}
            </p>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-bottom: 0.5rem;">
              Order ID: ${options.orderId || 'Unknown'}
            </p>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
              Customer: ${this.currentOrder?.customer_details?.customer_email || 'Unknown'}
            </p>
          </div>
          
          <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem; line-height: 1.6;">
            This is a demo payment simulation. In production, this would open the Cashfree payment gateway.
          </p>
          
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="demo-payment-success" style="
              background: linear-gradient(135deg, #000000 0%, #ffd700 100%);
              color: white;
              border: none;
              padding: 1rem 2rem;
              border-radius: 12px;
              font-weight: 600;
              cursor: pointer;
              font-size: 1rem;
              box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
              transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              ✅ Simulate Success
            </button>
            <button id="demo-payment-failure" style="
              background: rgba(255, 255, 255, 0.1);
              color: #ffd700;
              border: 1px solid rgba(255, 215, 0, 0.3);
              padding: 1rem 2rem;
              border-radius: 12px;
              font-weight: 600;
              cursor: pointer;
              font-size: 1rem;
              transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              ❌ Simulate Failure
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(demoModal)

    // Add event listeners
    document.getElementById('demo-payment-success')?.addEventListener('click', () => {
      demoModal.remove()
      // Simulate processing delay
      setTimeout(() => {
        console.log('Demo payment completed successfully')
        resolve({
          redirect: false,
          success: true,
          orderId: options.orderId,
          paymentStatus: 'SUCCESS'
        })
      }, 1500)
    })

    document.getElementById('demo-payment-failure')?.addEventListener('click', () => {
      demoModal.remove()
      reject({
        error: {
          message: 'Payment failed (simulated)'
        }
      })
    })

    // Close on background click
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) {
        demoModal.remove()
        reject({
          error: {
            message: 'Payment cancelled by user'
          }
        })
      }
    })
  }

  // Main method to initiate payment
  async initiatePayment(amount: number, customerEmail: string, customerName: string, customerId: string): Promise<void> {
    if (this.isProcessing) {
      toast.error('A payment is already in progress.')
      return
    }

    this.isProcessing = true
    toast.loading('Initiating payment...', { id: 'payment-toast' })

    try {
      console.log('Starting payment initiation...', { amount, customerEmail, customerName, customerId })

      // Wait for initialization if not ready
      if (!this.isInitialized) {
        console.log('Waiting for CashfreeManager to initialize...')
        let attempts = 0
        const maxAttempts = 30
        
        while (!this.isInitialized && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        
        if (!this.isInitialized) {
          throw new Error('CashfreeManager initialization timeout')
        }
      }

      const customerPhone = '9999999999' // Placeholder

      // Create order details
      const orderDetails = await this.createOrderOnServer(amount, customerId, customerEmail, customerPhone)
      this.currentOrder = orderDetails

      console.log('Order created:', orderDetails)

      // Since we're in demo mode, always use the mock checkout
      console.log('Using demo payment system...')
      
      const checkoutOptions = {
        orderId: orderDetails.order_id,
        paymentSessionId: orderDetails.payment_session_id,
        redirectTarget: '_self'
      }

      console.log('Initiating demo checkout with options:', checkoutOptions)

      // Use the mock checkout
      const result = await this.cashfree.checkout(checkoutOptions)
      
      console.log('Demo payment result:', result)
      
      if (result.error) {
        console.error('Demo payment error:', result.error)
        toast.dismiss('payment-toast')
        toast.error('Payment failed: ' + result.error.message)
        await this.handlePaymentFailure(orderDetails.order_id, 'failed', result.error.message)
      } else if (result.success) {
        console.log('Demo payment successful!')
        toast.dismiss('payment-toast')
        toast.success('Payment successful! Balance updated.')
        await this.handlePaymentSuccess(orderDetails.order_id, result.paymentId || 'DEMO_PAYMENT', amount, 'INR', customerId, 'completed', 'INR deposit via Cashfree (Demo)')
      } else {
        console.log('Payment cancelled or incomplete')
        toast.dismiss('payment-toast')
        toast.error('Payment was cancelled')
        await this.handlePaymentFailure(orderDetails.order_id, 'cancelled', 'Payment cancelled by user')
      }

    } catch (error: any) {
      console.error('Error during payment initiation:', error)
      toast.dismiss('payment-toast')
      toast.error('Failed to initiate payment: ' + error.message)
      await this.handlePaymentFailure(this.currentOrder?.order_id || 'N/A', 'failed', error.message)
    } finally {
      this.isProcessing = false
    }
  }

  public async createOrderOnServer(amount: number, customerId: string, customerEmail: string, customerPhone: string): Promise<any> {
    console.log('Creating order on server...')
    // In a real application, this would be an API call to your backend
    // For demo purposes, we simulate a successful order creation
    return new Promise(resolve => {
      setTimeout(() => {
        const orderId = `order_${Date.now()}`
        console.log(`Simulated order created: ${orderId}`)
        resolve({
          order_id: orderId,
          payment_session_id: `session_${orderId}_${Math.random().toString(36).substring(7)}`,
          order_amount: amount,
          customer_details: {
            customer_id: customerId,
            customer_email: customerEmail,
            customer_phone: customerPhone
          }
        })
      }, 1000)
    })
  }

  public hasSDK(): boolean {
    return !!this.cashfree && this.isInitialized
  }


  public async handlePaymentResponse(orderId: string, paymentId: string, paymentStatus: string, orderAmount: number, userId: string): Promise<void> {
    console.log(`Handling payment response for Order ID: ${orderId}, Status: ${paymentStatus}`)
    if (paymentStatus === 'SUCCESS') {
      await this.handlePaymentSuccess(orderId, paymentId, orderAmount, 'INR', userId, 'completed', 'INR deposit via Cashfree')
      toast.success('Payment successful and balance updated!')
    } else {
      await this.handlePaymentFailure(orderId, paymentStatus, 'Payment failed or cancelled')
      toast.error('Payment failed or was cancelled.')
    }
  }

  private async handlePaymentSuccess(orderId: string, paymentId: string, amount: number, currency: string, userId: string, status: string, description: string): Promise<void> {
    try {
      // Log transaction
      await mongoDBService.createTransaction({
        userId,
        type: 'deposit',
        amount,
        currency,
        description,
        status: status as 'completed',
        orderId,
        paymentId,
        timestamp: new Date()
      })

      // Update user's INR balance
      await mongoDBService.updateUserBalance(userId, currency, amount)
      console.log(`User ${userId} ${currency} balance updated by ${amount}`)
      
      // Dispatch a custom event to notify components to refresh balances
      window.dispatchEvent(new Event('balanceUpdated'))
    } catch (error) {
      console.error('Error handling payment success:', error)
      toast.error('Failed to update balance or log transaction.')
    }
  }

  private async handlePaymentFailure(orderId: string, status: string, errorMessage: string): Promise<void> {
    try {
      // Log failed transaction
      const userId = auth.currentUser?.uid || 'unknown'
      await mongoDBService.createTransaction({
        userId,
        type: 'deposit',
        amount: this.currentOrder?.order_amount || 0,
        currency: 'INR',
        description: `INR deposit failed: ${errorMessage}`,
        status: status as 'failed',
        orderId,
        timestamp: new Date()
      })
      console.log(`Payment failed for order ${orderId}: ${errorMessage}`)
    } catch (error) {
      console.error('Error logging failed transaction:', error)
    }
  }

  // Check if manager is ready for payments
  isReady(): boolean {
    return this.isInitialized && this.cashfree !== null
  }
}

export const cashfreeManager = new CashfreeManager()