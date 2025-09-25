# IPFS Setup Guide

## Overview

The certificate validation system now uses a flexible IPFS setup that doesn't require paid subscriptions. The system supports multiple IPFS providers with automatic fallbacks.

## IPFS Provider Options

### 1. Pinata (Recommended - Free Tier Available)

**Free Tier Limits:**
- 1GB storage
- 100 requests per month
- Reliable and fast

**Setup:**
1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Generate API keys from your dashboard
3. Add to your `.env` file:
```env
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_SECRET_KEY=your_secret_key_here
```

### 2. Public IPFS Gateways (Completely Free)

**Pros:**
- No registration required
- Completely free
- Multiple fallback options

**Cons:**
- Less reliable
- Slower uploads
- No guaranteed persistence

**Gateways Used:**
- Infura IPFS Gateway
- Web3.Storage public endpoint

### 3. Development Mode (Fallback)

If all IPFS uploads fail, the system generates mock hashes for development purposes.

## Configuration

### Environment Variables

Copy `frontend/env.example` to `frontend/.env` and configure:

```env
# Required - Contract addresses
VITE_CERTIFICATE_NFT_ADDRESS=0x661f32b71e7912A1A3DA274E716a112CD02B5Da9
VITE_SCHOLARSHIP_ESCROW_ADDRESS=your_scholarship_contract_address
VITE_NETWORK_ID=11155111

# Optional - IPFS providers (if not set, uses public gateways)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

## How It Works

### Upload Priority

1. **Pinata API** (if credentials provided)
2. **Public IPFS gateways** (fallback)
3. **Mock hash generation** (development fallback)

### Functions Available

```typescript
// Upload any file to IPFS
const cid = await uploadFileToIPFS(file);

// Upload JSON metadata to IPFS
const cid = await uploadJsonToIPFS(certificateData);

// Convert CID to gateway URL
const url = ipfsGatewayUrl(cid);
```

## Smart Contract Integration

### New Features Added

1. **CID Mapping**: `tokenId ↔ CID` bidirectional mapping
2. **New Functions**:
   - `getCIDByTokenId(uint256 tokenId) → string`
   - `getTokenIdByCID(string cid) → uint256`
3. **New Event**: `CertificateMetadataStored(tokenId, cid, student)`

### Verification Methods

The verification page now supports three methods:

1. **Token ID**: Direct blockchain lookup
2. **QR Code**: Extract token ID from QR data
3. **IPFS CID**: Lookup token ID from CID, then verify

## Usage Examples

### Verify by CID

```
https://your-app.com/verify?cid=QmSampleHash123...
```

### Verify by Token ID

```
https://your-app.com/verify?tokenId=123
```

## Testing

### Test IPFS Upload

```javascript
// Test file upload
const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
const cid = await uploadFileToIPFS(testFile);
console.log('Uploaded to IPFS:', cid);

// Test JSON upload
const metadata = { name: 'Test Certificate', description: 'Test' };
const jsonCid = await uploadJsonToIPFS(metadata);
console.log('JSON uploaded to IPFS:', jsonCid);
```

### Test CID Verification

1. Deploy updated contract with CID mapping
2. Mint a certificate (CID will be stored automatically)
3. Test verification: `/verify?cid=QmYourCIDHere`

## Troubleshooting

### Common Issues

1. **"Failed to upload to IPFS"**
   - Check internet connection
   - Verify Pinata credentials (if using)
   - Check browser console for detailed errors

2. **"CID not found"**
   - Ensure certificate was minted with updated contract
   - Verify CID format (should start with 'Qm' or 'ba')

3. **"Please connect your wallet first"**
   - Connect MetaMask or compatible wallet
   - Ensure correct network (Sepolia testnet)

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debug', 'ipfs:*');
```

## Migration from web3.storage

### Changes Made

1. ✅ Replaced `web3.storage` with free alternatives
2. ✅ Added contract CID mapping functionality
3. ✅ Updated verification page with CID support
4. ✅ Added fallback mechanisms
5. ✅ Updated environment configuration

### No Breaking Changes

- Existing certificates remain fully functional
- All verification methods still work
- Contract addresses unchanged

## Production Recommendations

### For Production Use

1. **Use Pinata Pro** for guaranteed reliability
2. **Set up monitoring** for IPFS gateway health
3. **Implement retry logic** for failed uploads
4. **Consider IPFS pinning services** for long-term storage

### Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Rate Limiting**: Implement client-side rate limiting
3. **Content Validation**: Validate uploaded content
4. **Access Control**: Restrict upload permissions

## Support

For issues or questions:
- Check browser console for errors
- Verify environment variables
- Test with different IPFS providers
- Contact support with specific error messages
