#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vignan Certificate Frontend Deployment...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('❌ .env file not found. Please create one from env.example');
  process.exit(1);
}

// Read contract addresses from deployment-addresses.json
let contractAddresses = {};
try {
  const addressesPath = path.join(__dirname, '../../deployment-addresses.json');
  if (fs.existsSync(addressesPath)) {
    const addressesData = fs.readFileSync(addressesPath, 'utf8');
    contractAddresses = JSON.parse(addressesData);
    console.log('✅ Found contract addresses from deployment');
  }
} catch (error) {
  console.log('⚠️  Could not read deployment addresses:', error.message);
}

// Update .env with contract addresses
if (contractAddresses.contracts) {
  const envContent = fs.readFileSync('.env', 'utf8');
  let updatedEnv = envContent;
  
  if (contractAddresses.contracts.CertificateNFT) {
    updatedEnv = updatedEnv.replace(
      /VITE_CERTIFICATE_NFT_ADDRESS=.*/,
      `VITE_CERTIFICATE_NFT_ADDRESS=${contractAddresses.contracts.CertificateNFT}`
    );
  }
  
  if (contractAddresses.contracts.ScholarshipEscrow) {
    updatedEnv = updatedEnv.replace(
      /VITE_SCHOLARSHIP_ESCROW_ADDRESS=.*/,
      `VITE_SCHOLARSHIP_ESCROW_ADDRESS=${contractAddresses.contracts.ScholarshipEscrow}`
    );
  }
  
  if (contractAddresses.chainId) {
    updatedEnv = updatedEnv.replace(
      /VITE_NETWORK_ID=.*/,
      `VITE_NETWORK_ID=${contractAddresses.chainId}`
    );
  }
  
  fs.writeFileSync('.env', updatedEnv);
  console.log('✅ Updated .env with contract addresses');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Build the application
console.log('\n🔨 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  process.exit(1);
}

// Check build output
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`✅ Build output created with ${files.length} files`);
} else {
  console.log('❌ Build output not found');
  process.exit(1);
}

// Create deployment info
const deploymentInfo = {
  timestamp: new Date().toISOString(),
  buildVersion: process.env.npm_package_version || '1.0.0',
  contractAddresses: contractAddresses.contracts || {},
  network: contractAddresses.network || 'unknown',
  chainId: contractAddresses.chainId || 'unknown'
};

fs.writeFileSync(
  path.join(distPath, 'deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('\n🎉 Deployment preparation completed!');
console.log('\nNext steps:');
console.log('1. Deploy the dist/ folder to your hosting service');
console.log('2. Configure your domain and SSL certificate');
console.log('3. Update environment variables in production');
console.log('4. Test the application thoroughly');

console.log('\n📋 Deployment Summary:');
console.log(`- Build Version: ${deploymentInfo.buildVersion}`);
console.log(`- Network: ${deploymentInfo.network}`);
console.log(`- Chain ID: ${deploymentInfo.chainId}`);
console.log(`- Certificate NFT: ${deploymentInfo.contractAddresses.CertificateNFT || 'Not set'}`);
console.log(`- Scholarship Escrow: ${deploymentInfo.contractAddresses.ScholarshipEscrow || 'Not set'}`);

console.log('\n✨ Ready for production deployment!');
