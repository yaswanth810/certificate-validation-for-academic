const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractAddress = "0xC235cFECAC5AdAa0f6fd9685BbbA568Bd7c026bE";
  
  console.log("Testing contract:", contractAddress);
  console.log("Wallet:", wallet.address);
  
  // Simple ABI to test basic functions
  const abi = [
    "function name() external view returns (string memory)",
    "function symbol() external view returns (string memory)",
    "function MINTER_ROLE() external view returns (bytes32)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function grantRole(bytes32 role, address account) external",
    "function isSerialNumberUsed(string memory serialNo) external view returns (bool)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signedContract = contract.connect(wallet);
  
  try {
    console.log("\n=== Basic Contract Info ===");
    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    
    console.log("\n=== Role Check ===");
    const minterRole = await contract.MINTER_ROLE();
    console.log("MINTER_ROLE:", minterRole);
    
    const hasMinterRole = await contract.hasRole(minterRole, wallet.address);
    console.log("Wallet has MINTER_ROLE:", hasMinterRole);
    
    if (!hasMinterRole) {
      console.log("\n=== Granting MINTER_ROLE ===");
      const tx = await signedContract.grantRole(minterRole, wallet.address);
      console.log("Grant role tx:", tx.hash);
      await tx.wait();
      console.log("✅ MINTER_ROLE granted");
      
      // Check again
      const hasRoleNow = await contract.hasRole(minterRole, wallet.address);
      console.log("Wallet has MINTER_ROLE now:", hasRoleNow);
    }
    
    console.log("\n=== Testing Serial Number Function ===");
    const testSerial = "TEST123";
    const isUsed = await contract.isSerialNumberUsed(testSerial);
    console.log(`Serial "${testSerial}" is used:`, isUsed);
    
    console.log("\n✅ Basic functions working. The error might be in the mintSemesterCertificate function itself.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }
}

main().catch(console.error);
