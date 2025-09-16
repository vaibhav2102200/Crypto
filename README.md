# CryptoPay - React TypeScript Application

A complete React TypeScript application for cryptocurrency payments and management, converted from the original vanilla HTML/JS version while maintaining all functionality.

## Features

- 🔐 **Authentication**: Firebase Auth with email/password
- 💰 **Multi-Currency Support**: INR, BTC, USDT, BXC
- 🌐 **Web3 Integration**: MetaMask wallet connection, Sepolia testnet
- 💳 **Payment Integration**: Cashfree for INR deposits
- 📊 **Real-time Prices**: Live crypto price feeds
- 🔄 **P2P Transfers**: Send money between users
- 📈 **Transaction History**: Complete audit trail
- 👤 **User Profiles**: Account management and preferences
- ⚡ **Admin Panel**: Withdrawal processing interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS3 with responsive design
- **State Management**: React Context API
- **Backend**: Firebase (Auth, Firestore)
- **Blockchain**: Web3.js, Ethereum (Sepolia)
- **Payments**: Cashfree Payment Gateway
- **Icons**: Font Awesome 6

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Auth and Firestore enabled
- MetaMask browser extension
- Cashfree merchant account (for payments)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-pay-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/config/firebase.ts` with your Firebase config
   - Enable Authentication and Firestore in Firebase Console
   - Set up Firestore security rules

4. **Configure Contracts**
   - Update `src/config/contracts.ts` with your deployed contract addresses
   - Ensure contracts are deployed on Sepolia testnet

5. **Configure Cashfree**
   - Update `src/config/cashfree.ts` with your Cashfree credentials
   - Set up webhook endpoints for payment verification

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AuthModal.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── config/              # Configuration files
│   ├── firebase.ts
│   ├── contracts.ts
│   └── cashfree.ts
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   ├── Web3Context.tsx
│   └── CryptoPriceContext.tsx
├── pages/               # Page components
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── Deposit.tsx
│   ├── Withdraw.tsx
│   ├── Send.tsx
│   ├── History.tsx
│   ├── Profile.tsx
│   └── AdminWithdrawals.tsx
├── services/            # Business logic services
│   ├── cashfree.ts
│   └── transactions.ts
├── App.tsx              # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Key Features Converted

### ✅ Authentication System
- Firebase Auth integration
- Login/Signup modals
- Protected routes
- User profile management

### ✅ Web3 Integration
- MetaMask wallet connection
- Sepolia testnet enforcement
- Smart contract interactions
- Balance validation

### ✅ Payment Processing
- Cashfree INR deposits
- Crypto withdrawal requests
- Transaction logging
- Admin processing interface

### ✅ User Interface
- Responsive design
- Real-time price updates
- Transaction history
- Balance management

### ✅ Admin Features
- Withdrawal processing
- Contract owner verification
- Transaction monitoring

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_SECRET_KEY=your_cashfree_secret_key
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure redirects for SPA routing

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Security Considerations

- All sensitive operations require user authentication
- Web3 transactions require MetaMask confirmation
- Admin operations require contract owner verification
- Firebase security rules protect user data
- Input validation on all forms

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@cryptopay.com or create an issue in the GitHub repository.

---

**Note**: This application is for educational/demonstration purposes. Ensure proper security audits before using in production with real funds.