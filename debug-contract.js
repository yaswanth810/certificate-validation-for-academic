const { ethers } = require('ethers');

async function debugContract() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/18e4ca84c5034233a39181cbad41a17d');
  const contractAddress = '0xc14daff9137be2D732f82637A46aaD4bb914E370';
  
  try {
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    console.log('Contract code length:', code.length);
    console.log('Contract exists:', code !== '0x');
    
    if (code === '0x') {
      console.log('❌ Contract not deployed at this address!');
      return;
    }
    
    // Try to call a simple view function
    const abi = [
      "function owner() view returns (address)",
      "function hasRole(bytes32 role, address account) view returns (bool)",
      "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
      "function SCHOLARSHIP_MANAGER_ROLE() view returns (bytes32)"
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
      const owner = await contract.owner();
      console.log('Contract owner:', owner);
    } catch (err) {
      console.log('Owner call failed:', err.message);
    }
    
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log('Default admin role:', adminRole);
    } catch (err) {
      console.log('Admin role call failed:', err.message);
    }
    
    try {
      const scholarshipRole = await contract.SCHOLARSHIP_MANAGER_ROLE();
      console.log('Scholarship manager role:', scholarshipRole);
    } catch (err) {
      console.log('Scholarship role call failed:', err.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugContract();
