# Smart Contract Update Deployment Guide

## Overview

This guide covers deploying the updated CertificateNFT contract with CID mapping functionality and migrating from web3.storage to free IPFS alternatives.

## Changes Made

### Smart Contract Updates

1. **New State Variables**:
   ```solidity
   mapping(uint256 => string) public tokenIdToCID;
   mapping(string => uint256) public cidToTokenId;
   ```

2. **New Functions**:
   ```solidity
   function getCIDByTokenId(uint256 tokenId) external view returns (string memory)
   function getTokenIdByCID(string memory cid) external view returns (uint256)
   ```

3. **New Event**:
   ```solidity
   event CertificateMetadataStored(uint256 indexed tokenId, string indexed cid, address indexed student)
   ```

4. **Updated Minting Logic**:
   - Automatically stores CID mapping when minting
   - Emits `CertificateMetadataStored` event

### Frontend Updates

1. **IPFS Integration**: Replaced web3.storage with free alternatives
2. **CID Verification**: Added CID-based certificate verification
3. **Enhanced UI**: Three verification methods (Token ID, QR Code, IPFS CID)

## Deployment Steps

### 1. Compile Updated Contract

```bash
# In project root
npm run compile
```

### 2. Deploy New Contract

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia
```

### 3. Update Environment Variables

Update `frontend/.env` with new contract address:

```env
# Update with your new contract address
VITE_CERTIFICATE_NFT_ADDRESS=0xYourNewContractAddress

# Optional IPFS configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

### 4. Verify Contract

```bash
# Verify on Etherscan
npm run verify:sepolia
```

### 5. Grant Roles

```javascript
// Connect to new contract and grant necessary roles
const contract = new ethers.Contract(contractAddress, abi, signer);

// Grant MINTER_ROLE to authorized addresses
await contract.grantRole(await contract.MINTER_ROLE(), minterAddress);

// Grant ADMIN_ROLE to authorized addresses  
await contract.grantRole(await contract.ADMIN_ROLE(), adminAddress);
```

## Migration Strategy

### Option 1: Fresh Deployment (Recommended)

**Pros**: Clean start with all new features
**Cons**: Previous certificates won't have CID mapping

**Steps**:
1. Deploy new contract
2. Update frontend configuration
3. Start issuing new certificates with CID mapping

### Option 2: Data Migration

**Pros**: Preserves all existing data
**Cons**: More complex, requires custom migration script

**Steps**:
1. Deploy new contract
2. Create migration script to:
   - Read all existing certificates
   - Extract IPFS hashes
   - Populate CID mappings
3. Update frontend configuration

## Testing Checklist

### Smart Contract Testing

- [ ] Contract compiles without errors
- [ ] All existing functions work correctly
- [ ] New CID mapping functions work
- [ ] Events are emitted correctly
- [ ] Role-based access control functions

### Frontend Testing

- [ ] Application loads without errors
- [ ] Token ID verification works
- [ ] QR code verification works
- [ ] CID verification works
- [ ] IPFS uploads work (with fallbacks)
- [ ] Certificate display is correct

### Integration Testing

- [ ] Mint certificate → CID is stored
- [ ] Verify by token ID → Returns correct data
- [ ] Verify by CID → Finds correct certificate
- [ ] URL parameters work (`?cid=...`, `?tokenId=...`)

## Rollback Plan

If issues occur, you can rollback by:

1. **Revert Frontend**: Update `.env` to use old contract address
2. **Keep Both Contracts**: Run old and new contracts in parallel
3. **DNS/Load Balancer**: Route traffic back to old version

## Production Deployment

### Pre-deployment Checklist

- [ ] Smart contract audited
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] IPFS provider setup (Pinata recommended)
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery plan ready

### Deployment Sequence

1. **Deploy to Testnet**: Test thoroughly
2. **Deploy to Mainnet**: Use same deployment script
3. **Update Frontend**: Point to mainnet contract
4. **Monitor**: Watch for any issues
5. **Announce**: Inform users of new features

## Monitoring

### Key Metrics to Monitor

1. **Contract Events**:
   - `CertificateIssued`
   - `CertificateMetadataStored`
   - `CertificateVerified`

2. **IPFS Performance**:
   - Upload success rate
   - Upload latency
   - Gateway response times

3. **Frontend Errors**:
   - Failed verifications
   - IPFS upload failures
   - Wallet connection issues

### Monitoring Setup

```javascript
// Example event monitoring
contract.on('CertificateMetadataStored', (tokenId, cid, student, event) => {
  console.log(`Certificate ${tokenId} metadata stored: ${cid}`);
  // Send to monitoring system
});
```

## Support and Troubleshooting

### Common Issues

1. **"CID not found"**
   - Certificate was minted with old contract
   - CID format is incorrect
   - Contract not properly deployed

2. **"IPFS upload failed"**
   - Check Pinata credentials
   - Verify internet connection
   - Try different IPFS gateway

3. **"Transaction failed"**
   - Insufficient gas
   - Wrong network
   - Missing permissions

### Getting Help

1. Check browser console for errors
2. Verify contract deployment on Etherscan
3. Test with minimal example
4. Contact development team with:
   - Error messages
   - Transaction hashes
   - Network details

## Security Considerations

### Smart Contract Security

- [ ] Access control properly implemented
- [ ] Input validation in place
- [ ] Reentrancy protection enabled
- [ ] Emergency pause functionality tested

### Frontend Security

- [ ] API keys not exposed in client
- [ ] Input sanitization implemented
- [ ] HTTPS enforced
- [ ] Content Security Policy configured

### IPFS Security

- [ ] Content validation before upload
- [ ] Rate limiting implemented
- [ ] Malicious content detection
- [ ] Backup storage configured

## Success Criteria

Deployment is successful when:

- [ ] All tests pass
- [ ] Contract deployed and verified
- [ ] Frontend connects successfully
- [ ] All three verification methods work
- [ ] IPFS uploads work with fallbacks
- [ ] No critical errors in monitoring
- [ ] Users can mint and verify certificates

## Next Steps

After successful deployment:

1. **User Training**: Educate users on new CID verification
2. **Documentation**: Update user guides
3. **Analytics**: Set up usage tracking
4. **Feedback**: Collect user feedback
5. **Optimization**: Monitor and optimize performance

---

**Note**: This deployment introduces new features while maintaining backward compatibility. Existing certificates will continue to work, but won't have CID mapping unless migrated.
