# Deployment Guide

This guide covers deploying the Vignan Institute Blockchain Certificate Platform to production.

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- Git
- Sepolia testnet ETH for gas fees
- Infura or Alchemy account for RPC access
- Etherscan account for contract verification

## Environment Setup

### 1. Create Environment File
```bash
cp env.example .env
```

### 2. Configure Environment Variables
```env
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id

# Contract addresses (will be filled after deployment)
REACT_APP_CERTIFICATE_NFT_ADDRESS=
REACT_APP_SCHOLARSHIP_ESCROW_ADDRESS=
REACT_APP_VIGNAN_REGISTRY_ADDRESS=
REACT_APP_NETWORK_ID=11155111
```

## Smart Contract Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Run Tests
```bash
npm test
```

### 4. Deploy to Sepolia
```bash
npm run deploy:sepolia
```

This will:
- Deploy all three contracts
- Set up roles and permissions
- Create sample courses
- Save contract addresses to `deployment-addresses.json`

### 5. Verify Contracts
```bash
npm run verify:sepolia
```

### 6. Update Frontend Environment
After deployment, update the frontend environment variables with the deployed contract addresses:

```env
REACT_APP_CERTIFICATE_NFT_ADDRESS=0x...
REACT_APP_SCHOLARSHIP_ESCROW_ADDRESS=0x...
REACT_APP_VIGNAN_REGISTRY_ADDRESS=0x...
```

## Frontend Deployment

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 2. Build Frontend
```bash
npm run frontend:build
```

### 3. Deploy Frontend
Deploy the `frontend/build` directory to your hosting service:

#### Option A: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=build
```

#### Option C: AWS S3 + CloudFront
```bash
# Install AWS CLI and configure
aws s3 sync frontend/build s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Production Configuration

### 1. Update Contract Addresses
After deployment, update your frontend environment variables with the actual contract addresses.

### 2. Configure Domain
Update the QR code generation to use your production domain:
```typescript
// In frontend/src/utils/web3.ts
export const generateQRData = (tokenId: string, contractAddress: string, networkId: number): string => {
  const baseUrl = 'https://your-domain.com'; // Update this
  return `${baseUrl}/verify?tokenId=${tokenId}&contract=${contractAddress}&network=${networkId}`;
};
```

### 3. SSL Certificate
Ensure your domain has a valid SSL certificate for secure Web3 connections.

### 4. Gas Optimization
For production, consider:
- Using gas-optimized contract versions
- Implementing batch operations
- Using meta-transactions for user convenience

## Security Checklist

- [ ] Private keys are secure and not committed to version control
- [ ] Environment variables are properly configured
- [ ] Contracts are verified on Etherscan
- [ ] Admin roles are properly assigned
- [ ] Frontend is served over HTTPS
- [ ] Domain is configured correctly
- [ ] Error handling is comprehensive
- [ ] Input validation is in place

## Monitoring and Maintenance

### 1. Contract Monitoring
- Monitor contract events using tools like The Graph
- Set up alerts for critical events
- Track gas usage and costs

### 2. Frontend Monitoring
- Use services like Sentry for error tracking
- Monitor user analytics
- Track performance metrics

### 3. Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update contracts if needed

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check private key format (no 0x prefix)
   - Verify RPC URL is correct
   - Ensure sufficient ETH for gas fees

2. **Contract Verification Fails**
   - Check constructor arguments
   - Verify compiler version matches
   - Ensure all dependencies are available

3. **Frontend Build Fails**
   - Check environment variables
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Web3 Connection Issues**
   - Verify network configuration
   - Check RPC provider status
   - Ensure wallet is connected to correct network

### Support
For deployment issues, contact:
- Email: support@vignan.edu
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

## Rollback Plan

If issues occur after deployment:

1. **Smart Contracts**: Deploy new versions and update frontend
2. **Frontend**: Revert to previous version
3. **Database**: Restore from backup if applicable

## Post-Deployment

1. Test all functionality thoroughly
2. Verify certificate minting and verification
3. Test QR code generation and scanning
4. Verify admin functions work correctly
5. Monitor for any errors or issues
6. Set up monitoring and alerting
7. Document any custom configurations

---

**Deployment completed successfully! 🎉**
