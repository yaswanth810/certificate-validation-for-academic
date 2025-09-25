const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Wallet address:", wallet.address);
  
  // Contract address and ABI
  const contractAddress = "0xBbaBAABb432e735278f8f36F625FE4a84bbcF773";
  
  // Minimal ABI for role checking
  const abi = [
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function MINTER_ROLE() external view returns (bytes32)",
    "function ADMIN_ROLE() external view returns (bytes32)",
    "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
    "function grantRole(bytes32 role, address account) external",
    "function owner() external view returns (address)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    // Get role constants
    const minterRole = await contract.MINTER_ROLE();
    const adminRole = await contract.ADMIN_ROLE();
    const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
    
    console.log("MINTER_ROLE:", minterRole);
    console.log("ADMIN_ROLE:", adminRole);
    console.log("DEFAULT_ADMIN_ROLE:", defaultAdminRole);
    
    // Check if wallet has required roles
    const hasMinterRole = await contract.hasRole(minterRole, wallet.address);
    const hasAdminRole = await contract.hasRole(adminRole, wallet.address);
    const hasDefaultAdminRole = await contract.hasRole(defaultAdminRole, wallet.address);
    
    console.log("\nRole check for wallet:", wallet.address);
    console.log("Has MINTER_ROLE:", hasMinterRole);
    console.log("Has ADMIN_ROLE:", hasAdminRole);
    console.log("Has DEFAULT_ADMIN_ROLE:", hasDefaultAdminRole);
    
    if (!hasMinterRole) {
      console.log("\n❌ Wallet does not have MINTER_ROLE!");
      console.log("This is likely the cause of the error 0xe2517d3f");
      
      if (hasDefaultAdminRole || hasAdminRole) {
        console.log("\n✅ Wallet has admin privileges. Granting MINTER_ROLE...");
        const signedContract = contract.connect(wallet);
        const tx = await signedContract.grantRole(minterRole, wallet.address);
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("✅ MINTER_ROLE granted successfully!");
      } else {
        console.log("\n❌ Wallet does not have admin privileges to grant roles.");
        console.log("Contact the contract owner to grant MINTER_ROLE.");
      }
    } else {
      console.log("\n✅ Wallet has MINTER_ROLE - role is not the issue.");
    }
    
  } catch (error) {
    console.error("Error checking roles:", error.message);
  }
}

main().catch(console.error);
