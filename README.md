# Vignan Institute Blockchain Certificate Platform

A production-ready blockchain-based certificate verification platform built on Ethereum, featuring NFT certificates, QR code verification, and scholarship management.

## 🚀 Features

- **NFT Certificates**: Certificates stored as ERC721 NFTs on Ethereum blockchain
- **QR Code Verification**: Instant verification using QR codes
- **Student Management**: Complete student registration and course management
- **Scholarship Escrow**: Secure scholarship fund management and disbursement
- **Admin Dashboard**: Comprehensive admin tools for managing the platform
- **Web3 Integration**: Seamless wallet connection and blockchain interaction
- **Responsive Design**: Modern UI built with React, TypeScript, and Tailwind CSS

## 🏗️ Architecture

### Smart Contracts
- **CertificateNFT.sol**: ERC721 NFT contract for certificates with OpenZeppelin AccessControl
- **ScholarshipEscrow.sol**: Manages scholarship funds and disbursements
- **VignanRegistry.sol**: Central registry for students, courses, and institutional data

### Frontend
- **Vite + React 18 + TypeScript**: Modern, fast development setup
- **Tailwind CSS**: Utility-first CSS with dark/light mode
- **Web3Modal v3**: Multi-wallet connection support
- **ethers.js v6**: Latest Ethereum library
- **React Router v6**: Client-side routing
- **Lucide React**: Beautiful, consistent icons
- **QR Code Generation**: Real-time QR code generation for verification
- **Mobile-First Design**: Responsive, touch-friendly interface

## 📁 Project Structure

```
project-root/
├── hardhat.config.ts              # Hardhat configuration for Sepolia testnet
├── package.json                   # Dependencies and scripts
├── contracts/                     # Smart contracts
│   ├── CertificateNFT.sol        # NFT certificate contract
│   ├── ScholarshipEscrow.sol     # Scholarship management contract
│   └── VignanRegistry.sol        # Student and course registry
├── scripts/
│   └── deploy.ts                 # Deployment script
├── test/
│   └── Certificate.test.ts       # Comprehensive test suite
├── frontend/                     # React frontend (Vite + React 18)
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   └── Header.tsx       # Navigation and wallet connection
│   │   ├── contexts/            # React contexts
│   │   │   └── Web3Context.tsx  # Web3 state management
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useContract.ts   # Smart contract interactions
│   │   │   └── useTheme.ts      # Theme management
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.tsx    # Student dashboard
│   │   │   ├── IssueCertificate.tsx # Certificate creation
│   │   │   ├── VerifyCertificate.tsx # Certificate verification
│   │   │   ├── Scholarships.tsx # Scholarship management
│   │   │   └── NotFound.tsx     # 404 page
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # App entry point
│   │   └── index.css            # Global styles
│   ├── scripts/
│   │   └── deploy.js            # Deployment script
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── env.example              # Environment variables template
└── env.example                   # Environment variables template
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blockchain-based-verification
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
REACT_APP_CERTIFICATE_NFT_ADDRESS=
REACT_APP_SCHOLARSHIP_ESCROW_ADDRESS=
REACT_APP_VIGNAN_REGISTRY_ADDRESS=
REACT_APP_NETWORK_ID=11155111
```

### 4. Compile Contracts
```bash
npm run compile
```

### 5. Run Tests
```bash
npm test
```

### 6. Deploy to Sepolia Testnet
```bash
npm run deploy:sepolia
```

### 7. Verify Contracts
```bash
npm run verify:sepolia
```

### 8. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

## 🎨 Frontend Features

### Modern React Application
- **Vite**: Lightning-fast build tool and dev server
- **React 18**: Latest React with concurrent features
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS with custom Vignan theme

### Web3 Integration
- **MetaMask Connection**: Seamless wallet integration
- **Network Switching**: Automatic Sepolia testnet detection
- **Real-time Updates**: Live data from smart contracts
- **Error Handling**: User-friendly error messages

### User Interface
- **Dark/Light Mode**: Toggle with system preference detection
- **Responsive Design**: Mobile-first, touch-friendly interface
- **Modern Icons**: Beautiful Lucide React icons
- **Smooth Animations**: CSS transitions and micro-interactions

### Key Pages
1. **Dashboard**: Student overview with certificates and scholarships
2. **Issue Certificate**: Form-based certificate creation with live preview
3. **Verify Certificate**: Token ID or QR code verification
4. **Scholarships**: View and claim blockchain-based scholarships

### Mobile Optimization
- Touch-friendly buttons and inputs
- Responsive grid layouts
- Mobile navigation menu
- Optimized for all screen sizes

## 🔧 Usage

### For Students
1. Connect your wallet
2. Access the Student Portal
3. View your certificates and scholarships
4. Generate QR codes for verification

### For Administrators
1. Connect your wallet (must have admin privileges)
2. Access the Admin Dashboard
3. Register students and create courses
4. Mint certificates and manage scholarships

### For Verification
1. Visit the verification page
2. Enter token ID or scan QR code
3. View certificate details and authenticity

## 🧪 Testing

The project includes comprehensive tests covering:
- Smart contract functionality
- Student registration and management
- Certificate minting and verification
- Scholarship creation and disbursement
- Integration scenarios

Run tests with:
```bash
npm test
```

## 🚀 Deployment

### Smart Contracts
1. Configure your `.env` file with Sepolia testnet details
2. Deploy contracts: `npm run deploy:sepolia`
3. Verify contracts: `npm run verify:sepolia`
4. Update frontend environment variables with deployed addresses

### Frontend
1. Build the frontend: `npm run frontend:build`
2. Deploy the `frontend/build` directory to your hosting service
3. Configure environment variables for production

## 🔐 Security Features

- **Access Control**: Role-based permissions using OpenZeppelin AccessControl
- **Pausable Contracts**: Emergency pause functionality
- **Reentrancy Protection**: Secure against reentrancy attacks
- **Input Validation**: Comprehensive input validation and error handling
- **Verification Hashes**: Unique hashes for certificate verification

## 🌐 Network Support

- **Sepolia Testnet**: Primary testnet for development and testing
- **Ethereum Mainnet**: Production deployment ready
- **Local Hardhat**: Local development network

## 📱 Mobile Support

The frontend is fully responsive and works on:
- Desktop browsers
- Mobile devices
- Tablets
- QR code scanners

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@vignan.edu
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - NFT certificate system
  - QR code verification
  - Student management
  - Scholarship escrow
  - Admin dashboard

## 🎯 Roadmap

- [ ] Multi-signature wallet support
- [ ] Batch certificate operations
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with other blockchains
- [ ] API for third-party integrations

---

**Built with ❤️ for Vignan Institute**
