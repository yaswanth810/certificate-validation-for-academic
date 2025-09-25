# Vignan Institute Certificate Frontend

A modern React application for managing blockchain-based certificates with Web3 integration.

## Features

- 🌙 **Dark/Light Mode**: Toggle between themes with system preference detection
- 🔗 **Web3 Integration**: MetaMask connection with network switching
- 📱 **Responsive Design**: Optimized for mobile and desktop
- 🎓 **Certificate Management**: Issue, verify, and manage certificates
- 💰 **Scholarship System**: View and claim blockchain-based scholarships
- 📊 **Real-time Updates**: Live data from smart contracts
- 🔍 **QR Code Verification**: Instant certificate verification
- 📱 **Mobile Optimized**: Touch-friendly interface

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **ethers.js v6** - Ethereum library
- **Web3Modal v3** - Wallet connection
- **React Router v6** - Client-side routing
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your contract addresses and RPC URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file with the following variables:

```env
# Contract Addresses (update after deployment)
VITE_CERTIFICATE_NFT_ADDRESS=0x...
VITE_SCHOLARSHIP_ESCROW_ADDRESS=0x...

# Network Configuration
VITE_NETWORK_ID=11155111
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# App Configuration
VITE_APP_NAME=Vignan Institute Certificates
VITE_APP_DESCRIPTION=Blockchain-verified digital certificates
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Header.tsx      # Navigation and wallet connection
├── contexts/           # React contexts
│   └── Web3Context.tsx # Web3 state management
├── hooks/              # Custom hooks
│   ├── useContract.ts  # Smart contract interactions
│   └── useTheme.ts     # Theme management
├── pages/              # Page components
│   ├── Dashboard.tsx   # Student dashboard
│   ├── IssueCertificate.tsx # Certificate creation
│   ├── VerifyCertificate.tsx # Certificate verification
│   ├── Scholarships.tsx # Scholarship management
│   └── NotFound.tsx    # 404 page
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## Features Overview

### Dashboard
- View all certificates
- Check scholarship status
- Quick actions and stats
- Responsive grid layout

### Issue Certificate
- Form-based certificate creation
- Live preview with QR code
- PDF download functionality
- Input validation and error handling

### Verify Certificate
- Token ID or QR code verification
- Real-time blockchain verification
- Certificate details display
- Copy/share functionality

### Scholarships
- View available scholarships
- Check eligibility requirements
- Claim scholarships (when available)
- Time-locked release system

## Web3 Integration

### Wallet Connection
- MetaMask integration
- WalletConnect support
- Network switching
- Account management

### Smart Contract Interaction
- Certificate NFT contract
- Scholarship escrow contract
- Real-time data fetching
- Transaction handling

### Error Handling
- Network errors
- Transaction failures
- User-friendly messages
- Retry mechanisms

## Styling

### Theme System
- Dark/light mode toggle
- System preference detection
- Smooth transitions
- Consistent color palette

### Responsive Design
- Mobile-first approach
- Breakpoint system
- Touch-friendly interfaces
- Optimized layouts

### Components
- Reusable button styles
- Card components
- Form elements
- Status indicators

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Email: support@vignan.edu
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

**Built with ❤️ for Vignan Institute**
