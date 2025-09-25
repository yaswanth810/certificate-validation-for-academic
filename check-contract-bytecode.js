const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const contractAddress = "0xC235cFECAC5AdAa0f6fd9685BbbA568Bd7c026bE";
  
  console.log("Checking deployed contract bytecode...");
  
  // Get the deployed bytecode
  const code = await provider.getCode(contractAddress);
  console.log("Contract bytecode length:", code.length);
  console.log("Has code:", code !== "0x");
  
  // Check if the contract has the mintSemesterCertificate function selector
  const functionSelector = "0x4055e0e1"; // mintSemesterCertificate selector
  const hasFunction = code.includes(functionSelector.slice(2));
  console.log("Contains mintSemesterCertificate selector:", hasFunction);
  
  // Let's try to call a simple function to see if the contract is responsive
  const simpleAbi = [
    "function name() external view returns (string memory)",
    "function totalSupply() external view returns (uint256)"
  ];
  
  try {
    const contract = new ethers.Contract(contractAddress, simpleAbi, provider);
    const name = await contract.name();
    console.log("Contract name:", name);
    
    // Try totalSupply (might not exist but let's see)
    try {
      const supply = await contract.totalSupply();
      console.log("Total supply:", supply.toString());
    } catch (e) {
      console.log("No totalSupply function (expected for non-enumerable ERC721)");
    }
    
  } catch (error) {
    console.error("Error calling basic functions:", error.message);
  }
  
  // The issue might be that we need to redeploy with a fresh contract
  console.log("\n=== Recommendation ===");
  console.log("The contract exists but mintSemesterCertificate is failing.");
  console.log("This suggests either:");
  console.log("1. The contract was compiled without semester certificate functions");
  console.log("2. There's a bug in the contract logic");
  console.log("3. The contract needs to be redeployed with proper compilation");
}

main().catch(console.error);
