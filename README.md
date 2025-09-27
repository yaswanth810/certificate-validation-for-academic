# EduTrust - Blockchain Certificate Platform

A production-ready blockchain-based certificate verification platform built on Ethereum, featuring NFT certificates, OCR-powered legacy certificate processing, IPFS storage, QR code verification, and comprehensive academic credential management.

## 🚀 Features

### 🎓 **Certificate Management**
- **NFT Certificates**: Certificates stored as ERC721 NFTs on Ethereum blockchain
- **Semester Certificates**: Detailed academic transcripts with course-level grading
- **Legacy Certificate Processing**: OCR-powered digitization of existing paper certificates
- **Certificate Revocation**: Admin ability to revoke certificates when needed
- **Batch Operations**: Efficient bulk certificate processing

### 🔍 **Verification & Security**
- **QR Code Verification**: Instant verification using QR codes
- **Token ID Verification**: Direct blockchain verification using token IDs
- **CID Verification**: IPFS Content Identifier-based verification
- **Tamper-Proof Storage**: Immutable blockchain and IPFS storage
- **Role-Based Access Control**: ADMIN_ROLE, MINTER_ROLE, SCHOLARSHIP_MANAGER_ROLE

### 📁 **Storage & Integration**
- **IPFS Integration**: Decentralized file storage with Pinata and fallback providers
- **Metadata Mapping**: TokenId ↔ IPFS CID mapping for enhanced verification
- **PDF Generation**: Automated certificate PDF creation and download
- **Image Processing**: Support for various image formats and OCR extraction

### 🎯 **User Experience**
- **OCR Technology**: AI-powered text extraction from uploaded documents
- **Real-time Preview**: Live certificate preview during creation
- **Mobile-First Design**: Responsive, touch-friendly interface
- **Dark/Light Mode**: Theme switching with system preference detection
- **Copy-to-Clipboard**: Easy sharing of token IDs and CIDs

### 💰 **Financial Management**
- **Scholarship Escrow**: Secure scholarship fund management and disbursement
- **Time-locked Releases**: Automated scholarship distribution schedules
- **Multi-token Support**: Various cryptocurrency support for scholarships

### 🛠️ **Administration**
- **Admin Dashboard**: Comprehensive admin tools for managing the platform
- **Student Management**: Complete student registration and course management
- **Analytics Dashboard**: Certificate issuance and verification statistics
- **Bulk Operations**: Efficient mass certificate processing

## 🏗️ Architecture

### Smart Contracts (Solidity ^0.8.20)
- **CertificateNFT.sol**: Enhanced ERC721 NFT contract with semester certificate support
  - Regular and semester certificate minting
  - CID mapping for IPFS integration
  - Certificate revocation capabilities
  - Role-based access control (OpenZeppelin v5.0.0)
- **ScholarshipEscrow.sol**: Advanced scholarship fund management
  - Time-locked releases
  - Multi-token support
  - Automated distribution
- **VignanRegistry.sol**: Comprehensive institutional data registry
  - Student and course management
  - Academic record tracking

### Frontend (React 18 + TypeScript + Vite)
- **Modern Tech Stack**: Vite, React 18, TypeScript for type safety
- **Styling**: Tailwind CSS with custom EduTrust theme and dark/light mode
- **Web3 Integration**: 
  - Web3Modal v3 for multi-wallet support
  - ethers.js v6 for blockchain interactions
  - Real-time contract event listening
- **IPFS Integration**:
  - Pinata API for reliable uploads
  - Public IPFS gateway fallbacks
  - Content addressing and verification
- **OCR Processing**: AI-powered document text extraction
- **UI/UX**: 
  - Lucide React icons
  - QR code generation and scanning
  - Mobile-first responsive design
  - Real-time certificate previews
- **Navigation**: React Router v6 with protected routes

## 📁 Project Structure

```
edutrust-platform/
├── hardhat.config.ts              # Hardhat configuration for Sepolia testnet
├── package.json                   # Dependencies and scripts
├── check-roles.js                 # Role verification utility
├── IPFS_SETUP.md                  # IPFS integration documentation
├── contracts/                     # Smart contracts
│   ├── CertificateNFT.sol        # Enhanced NFT certificate contract
│   ├── CertificateNFTFixed.sol   # Updated contract with CID mapping
│   ├── ScholarshipEscrow.sol     # Scholarship management contract
│   └── VignanRegistry.sol        # Student and course registry
├── scripts/
│   └── deploy.ts                 # Deployment script with role setup
├── test/
│   └── Certificate.test.ts       # Comprehensive test suite
├── frontend/                     # React frontend (Vite + React 18)
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Header.tsx       # Navigation and wallet connection
│   │   │   ├── Logo.tsx         # EduTrust branding component
│   │   │   ├── SemesterCertificate.tsx # Semester certificate display
│   │   │   ├── SemesterCertificateForm.tsx # Certificate creation form
│   │   │   ├── LegacyCertificateUploader.tsx # OCR upload component
│   │   │   └── ScholarshipCard.tsx # Scholarship display component
│   │   ├── contexts/            # React contexts
│   │   │   └── Web3Context.tsx  # Web3 state management
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useContract.ts   # Smart contract interactions
│   │   │   ├── useSemesterCertificate.ts # Semester certificate logic
│   │   │   ├── useScholarship.ts # Scholarship management
│   │   │   └── useTheme.ts      # Theme management
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.tsx    # Student dashboard
│   │   │   ├── AdminDashboard.tsx # Admin control panel
│   │   │   ├── IssueCertificate.tsx # Certificate creation
│   │   │   ├── LegacyCertificateMint.tsx # OCR-powered minting
│   │   │   ├── VerifyCertificate.tsx # Multi-method verification
│   │   │   ├── Scholarships.tsx # Scholarship management
│   │   │   └── NotFound.tsx     # 404 page
│   │   ├── utils/               # Utility functions
│   │   │   ├── ipfs.ts         # IPFS integration (Pinata + fallbacks)
│   │   │   ├── certificateGenerator.ts # PDF generation
│   │   │   └── serialGenerator.ts # Unique ID generation
│   │   ├── types/               # TypeScript type definitions
│   │   │   ├── certificate.ts   # Certificate interfaces
│   │   │   └── scholarship.ts   # Scholarship interfaces
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # App entry point
│   │   └── index.css            # Global styles with EduTrust theme
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── .env                     # Environment variables (production)
│   └── env.example              # Environment variables template
├── .env                          # Root environment variables
└── env.example                   # Root environment template
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yaswanth810/certificate-validation-for-academic.git
cd certificate-validation-for-academic
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

**Root `.env` file:**
```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id

# Contract Addresses (Latest Deployment)
REACT_APP_CERTIFICATE_NFT_ADDRESS=0x754F223698E00B36b150B98B748E42DAfaE11C1D
REACT_APP_SCHOLARSHIP_ESCROW_ADDRESS=0xa8024f43caf709bFa62274bc2118CE1B36D7D7A6
REACT_APP_VIGNAN_REGISTRY_ADDRESS=0x26843713a428FbA3588941DA684062b580C973D6
REACT_APP_NETWORK_ID=11155111

# IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

**Frontend `.env` file:**
```env
# Contract Addresses
VITE_CERTIFICATE_NFT_ADDRESS=0x754F223698E00B36b150B98B748E42DAfaE11C1D
VITE_SCHOLARSHIP_ESCROW_ADDRESS=0xa8024f43caf709bFa62274bc2118CE1B36D7D7A6
VITE_VIGNAN_REGISTRY_ADDRESS=0x26843713a428FbA3588941DA684062b580C973D6

# Network Configuration
VITE_NETWORK_ID=11155111
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id

# App Configuration
VITE_APP_NAME=EduTrust
VITE_APP_DESCRIPTION=Blockchain Certificate Platform

# IPFS Configuration (Pinata for reliable uploads)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
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

### 8. Check Role Permissions (Optional)
```bash
# Verify wallet has proper roles
node check-roles.js
```

### 9. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

## 🎨 Frontend Features

### Modern React Application
- **Vite**: Lightning-fast build tool and dev server
- **React 18**: Latest React with concurrent features and Suspense
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS with custom EduTrust theme

### Advanced Web3 Integration
- **Multi-Wallet Support**: MetaMask, WalletConnect, and more via Web3Modal v3
- **Network Management**: Automatic Sepolia testnet detection and switching
- **Real-time Updates**: Live blockchain data with event listeners
- **Transaction Management**: Gas estimation, error handling, and retry logic
- **Role-Based Access**: Dynamic UI based on user permissions

### IPFS & Storage
- **Pinata Integration**: Primary IPFS provider for reliable uploads
- **Fallback Providers**: Public IPFS gateways for redundancy
- **Content Addressing**: CID-based verification and retrieval
- **File Processing**: Support for PDF, images, and document formats

### OCR & AI Features
- **Document Processing**: AI-powered text extraction from uploaded certificates
- **Data Validation**: Intelligent form auto-filling from extracted data
- **Mock AI Interface**: Simulated OCR with realistic confidence scores
- **Legacy Integration**: Seamless digitization of existing paper certificates

### Enhanced User Interface
- **EduTrust Branding**: Professional design with "Authenticity Validator" tagline
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first, touch-optimized interface
- **Real-time Previews**: Live certificate previews during creation
- **Copy-to-Clipboard**: Easy sharing of token IDs and IPFS CIDs
- **QR Code Integration**: Generation and scanning capabilities

### Key Application Pages
1. **Student Dashboard**: Certificate overview with verification links
2. **Admin Dashboard**: Comprehensive management tools and analytics
3. **Legacy Certificate Mint**: OCR-powered certificate digitization
4. **Semester Certificate Form**: Detailed academic transcript creation
5. **Multi-Method Verification**: Token ID, CID, and QR code verification
6. **Scholarship Management**: Escrow-based fund distribution

### Mobile & Accessibility
- **Touch-Optimized**: Large buttons and gesture-friendly interactions
- **Progressive Web App**: Offline capabilities and app-like experience
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Performance Optimized**: Code splitting and lazy loading

## 🔧 Usage

### For Students
1. **Connect Wallet**: Use MetaMask or other Web3 wallets
2. **Access Dashboard**: View all your certificates and academic records
3. **Verification**: Generate QR codes and share verification links
4. **Scholarships**: Check eligibility and claim available funds
5. **Mobile Access**: Full functionality on mobile devices

### For Administrators
1. **Connect Admin Wallet**: Must have ADMIN_ROLE or MINTER_ROLE
2. **Access Admin Dashboard**: Comprehensive management interface
3. **Certificate Management**:
   - Create semester certificates with detailed course information
   - Process legacy certificates using OCR technology
   - Bulk certificate operations
   - Revoke certificates when necessary
4. **Student Management**: Register students and manage academic records
5. **Scholarship Administration**: Create and manage scholarship programs

### For Institutions
1. **Legacy Certificate Processing**: 
   - Upload existing paper certificates (PDF/images)
   - AI-powered OCR extracts student and course information
   - Automatic form filling with extracted data
   - Mint blockchain certificates with IPFS storage
2. **Verification System**:
   - Multiple verification methods (Token ID, IPFS CID, QR codes)
   - Public verification portal for employers and institutions
   - Tamper-proof verification with blockchain backing

### For Verifiers (Employers/Institutions)
1. **Multi-Method Verification**:
   - Enter Token ID for direct blockchain verification
   - Use IPFS CID for content-based verification
   - Scan QR codes for instant mobile verification
2. **Comprehensive Details**: View complete academic records and authenticity
3. **Real-time Validation**: Instant verification against blockchain records

## 🧪 Testing

The project includes comprehensive tests covering:
- **Smart Contract Functionality**: Certificate minting, verification, and revocation
- **Role-Based Access Control**: Admin, minter, and scholarship manager permissions
- **Student Registration**: Account creation and academic record management
- **Semester Certificates**: Course-level grading and SGPA calculations
- **Legacy Certificate Processing**: OCR integration and data validation
- **IPFS Integration**: File upload, CID mapping, and content verification
- **Scholarship Management**: Escrow creation, time-locks, and disbursement
- **Integration Scenarios**: End-to-end user workflows

Run tests with:
```bash
# Run all tests
npm test

# Run specific test files
npm test -- --grep "Certificate"
npm test -- --grep "Scholarship"

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Smart Contracts (Sepolia Testnet)
1. **Environment Setup**: Configure `.env` with private key and RPC URL
2. **Deploy Contracts**: `npm run deploy:sepolia`
3. **Verify on Etherscan**: `npm run verify:sepolia`
4. **Set Up Roles**: Grant MINTER_ROLE and ADMIN_ROLE to appropriate addresses
5. **Update Environment**: Copy deployed addresses to frontend `.env`

**Current Deployed Addresses (Sepolia):**
- **CertificateNFT**: `0x754F223698E00B36b150B98B748E42DAfaE11C1D`
- **ScholarshipEscrow**: `0xa8024f43caf709bFa62274bc2118CE1B36D7D7A6`
- **VignanRegistry**: `0x26843713a428FbA3588941DA684062b580C973D6`

### Frontend Deployment
1. **Build Production**: `cd frontend && npm run build`
2. **Environment Variables**: Configure production environment variables
3. **Deploy to Hosting**: Upload `dist` folder to your hosting service
4. **IPFS Configuration**: Set up Pinata API keys for file storage
5. **Domain Configuration**: Configure custom domain and SSL

### IPFS Setup
1. **Pinata Account**: Create account at pinata.cloud
2. **API Keys**: Generate API key and secret
3. **Configuration**: Add keys to environment variables
4. **Testing**: Verify file upload and retrieval functionality

## 🔐 Security Features

### Smart Contract Security
- **OpenZeppelin v5.0.0**: Latest security-audited contract libraries
- **Role-Based Access Control**: Granular permissions (ADMIN, MINTER, SCHOLARSHIP_MANAGER)
- **Pausable Contracts**: Emergency pause functionality for critical situations
- **Reentrancy Protection**: ReentrancyGuard on all state-changing functions
- **Input Validation**: Comprehensive validation and sanitization
- **Gas Optimization**: Efficient contract design to minimize attack vectors

### Data Security
- **Immutable Storage**: Blockchain and IPFS ensure tamper-proof records
- **Cryptographic Hashing**: Keccak-256 for data integrity verification
- **Content Addressing**: IPFS CIDs provide cryptographic content verification
- **Private Key Management**: Secure wallet integration with Web3Modal
- **Certificate Revocation**: Admin ability to invalidate compromised certificates

### Frontend Security
- **Type Safety**: Full TypeScript implementation prevents runtime errors
- **Input Sanitization**: All user inputs validated and sanitized
- **XSS Protection**: React's built-in XSS protection mechanisms
- **Secure Communication**: HTTPS-only communication with APIs
- **Environment Variables**: Sensitive data stored in environment variables

## 🌐 Network Support

### Supported Networks
- **Sepolia Testnet**: Primary development and testing network
- **Ethereum Mainnet**: Production-ready deployment
- **Local Hardhat Network**: Development and testing environment
- **Polygon**: Future multi-chain support planned
- **Arbitrum**: Layer 2 scaling solution support planned

### Network Features
- **Automatic Detection**: Frontend automatically detects and switches networks
- **Gas Optimization**: Efficient contract calls to minimize transaction costs
- **Fallback Providers**: Multiple RPC providers for reliability
- **Network-Specific Configuration**: Environment-based network settings

## 📱 Mobile & Cross-Platform Support

### Mobile Optimization
- **Progressive Web App (PWA)**: App-like experience on mobile devices
- **Touch-Optimized Interface**: Large buttons and gesture-friendly design
- **Mobile Wallet Integration**: Support for mobile Web3 wallets
- **QR Code Scanning**: Native camera integration for certificate verification
- **Offline Capabilities**: Basic functionality available without internet

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Web3 Browsers**: MetaMask Mobile, Trust Wallet, Coinbase Wallet
- **Desktop Wallets**: MetaMask, WalletConnect, Coinbase Wallet

### Device Support
- **Smartphones**: iOS and Android devices
- **Tablets**: iPad, Android tablets with full functionality
- **Desktop**: Windows, macOS, Linux with all browsers
- **QR Scanners**: Any device with camera for verification

## 🤝 Contributing

We welcome contributions to the EduTrust platform! Here's how to get started:

### Development Process
1. **Fork the Repository**: Create your own fork of the project
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Implement your feature or bug fix
4. **Add Tests**: Ensure your changes are covered by tests
5. **Update Documentation**: Update README and code comments
6. **Submit Pull Request**: Create a detailed PR with description of changes

### Contribution Guidelines
- **Code Style**: Follow existing TypeScript and Solidity conventions
- **Testing**: All new features must include comprehensive tests
- **Documentation**: Update relevant documentation for any changes
- **Security**: Follow security best practices for blockchain development
- **Gas Optimization**: Consider gas costs in smart contract changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Community

### Getting Help
- **Documentation**: Comprehensive guides in the project wiki
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community discussions and Q&A
- **Email**: Technical support for deployment issues

### Community Resources
- **Developer Guide**: Step-by-step development setup
- **API Documentation**: Complete API reference
- **Video Tutorials**: Visual guides for common tasks
- **Best Practices**: Security and optimization guidelines

## 🔄 Version History

### **v2.0.0** - EduTrust Platform (Current)
- **🎨 Rebranding**: Complete rebrand to EduTrust platform
- **🔍 OCR Integration**: AI-powered legacy certificate processing
- **📁 IPFS Storage**: Decentralized file storage with Pinata integration
- **🎓 Semester Certificates**: Detailed academic transcript support
- **🔗 CID Mapping**: Enhanced verification with IPFS content addressing
- **📱 Mobile Optimization**: Progressive Web App capabilities
- **🛡️ Enhanced Security**: OpenZeppelin v5.0.0 and improved access control

### **v1.0.0** - Initial Release
- **🏗️ Core Infrastructure**: NFT certificate system on Ethereum
- **🔍 QR Verification**: Instant certificate verification
- **👥 Student Management**: Complete academic record system
- **💰 Scholarship Escrow**: Blockchain-based fund management
- **🎛️ Admin Dashboard**: Comprehensive management interface

## 🎯 Roadmap

### **Phase 1: Enhanced Features** (Q1 2024)
- [ ] **Multi-signature Wallet Support**: Enhanced security for institutional accounts
- [ ] **Batch Certificate Operations**: Bulk processing for large institutions
- [ ] **Advanced Analytics Dashboard**: Comprehensive reporting and insights
- [ ] **API Gateway**: RESTful API for third-party integrations

### **Phase 2: Scaling & Integration** (Q2 2024)
- [ ] **Layer 2 Integration**: Polygon and Arbitrum support for lower costs
- [ ] **Mobile Application**: Native iOS and Android apps
- [ ] **Enterprise SSO**: Integration with institutional identity providers
- [ ] **Automated Compliance**: Regulatory compliance automation tools

### **Phase 3: Advanced Features** (Q3 2024)
- [ ] **AI-Powered Verification**: Enhanced OCR and document validation
- [ ] **Cross-Chain Compatibility**: Multi-blockchain certificate support
- [ ] **Decentralized Identity**: Integration with DID standards
- [ ] **Smart Contract Upgrades**: Proxy pattern implementation

### **Phase 4: Ecosystem Expansion** (Q4 2024)
- [ ] **Marketplace Integration**: Certificate trading and verification marketplace
- [ ] **Global Standards Compliance**: International education standard support
- [ ] **Advanced Analytics**: Machine learning-powered insights
- [ ] **White-label Solutions**: Customizable platform for institutions

---

## 🏆 **EduTrust - Securing Academic Credentials with Blockchain Technology**

**Built with ❤️ for the Future of Education**

*"Authenticity Validator" - Ensuring Trust in Academic Achievements*
