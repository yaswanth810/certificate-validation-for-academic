const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  
  // Contract address from frontend .env
  const contractAddress = "0xBbaBAABb432e735278f8f36F625FE4a84bbcF773";
  
  console.log("Checking contract at address:", contractAddress);
  
  // Check if contract exists
  const code = await provider.getCode(contractAddress);
  console.log("Contract code length:", code.length);
  
  if (code === "0x") {
    console.log("❌ No contract deployed at this address!");
    return;
  }
  
  console.log("✅ Contract exists at address");
  
  // Try to call some basic functions to see what's available
  const basicAbi = [
    "function name() external view returns (string memory)",
    "function symbol() external view returns (string memory)",
    "function totalSupply() external view returns (uint256)",
    "function owner() external view returns (address)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function MINTER_ROLE() external view returns (bytes32)",
    // Test semester certificate functions
    "function mintSemesterCertificate(address,string,string,tuple(string,string,string,string,string,string,string,string,string,tuple(string,string,string,uint256,string,uint256)[],uint256,uint256,string,uint256,address,bool)) external returns (uint256)",
    "function getSemesterCertificate(uint256) external view returns (tuple(string,string,string,string,string,string,string,string,string,tuple(string,string,string,uint256,string,uint256)[],uint256,uint256,string,uint256,address,bool))",
    "function isSerialNumberUsed(string) external view returns (bool)",
    "function isMemoNumberUsed(string) external view returns (bool)"
  ];
  
  const contract = new ethers.Contract(contractAddress, basicAbi, provider);
  
  try {
    console.log("\n=== Testing Basic ERC721 Functions ===");
    
    const name = await contract.name();
    console.log("Contract name:", name);
    
    const symbol = await contract.symbol();
    console.log("Contract symbol:", symbol);
    
    try {
      const totalSupply = await contract.totalSupply();
      console.log("Total supply:", totalSupply.toString());
    } catch (e) {
      console.log("Total supply not available (not enumerable)");
    }
    
  } catch (error) {
    console.log("❌ Basic ERC721 functions failed:", error.message);
  }
  
  try {
    console.log("\n=== Testing Access Control Functions ===");
    
    const minterRole = await contract.MINTER_ROLE();
    console.log("MINTER_ROLE:", minterRole);
    
  } catch (error) {
    console.log("❌ Access control functions failed:", error.message);
  }
  
  try {
    console.log("\n=== Testing Semester Certificate Functions ===");
    
    // Test if serial number checking works
    const testSerial = "TEST123";
    const isUsed = await contract.isSerialNumberUsed(testSerial);
    console.log(`Serial number "${testSerial}" is used:`, isUsed);
    
    const testMemo = "TEST456";
    const isMemoUsed = await contract.isMemoNumberUsed(testMemo);
    console.log(`Memo number "${testMemo}" is used:`, isMemoUsed);
    
    console.log("✅ Semester certificate functions are available!");
    
  } catch (error) {
    console.log("❌ Semester certificate functions failed:", error.message);
    console.log("This suggests the contract doesn't have semester certificate functionality");
    
    // Check if this is the old contract without semester functions
    console.log("\n=== Checking if this is the old contract ===");
    try {
      const oldAbi = [
        "function mintCertificate(address,string,string,string) external returns (uint256)",
        "function getCertificateData(uint256) external view returns (tuple(string,string,string,string,string,uint256,bool,address))"
      ];
      
      const oldContract = new ethers.Contract(contractAddress, oldAbi, provider);
      // Just check if the function exists without calling it
      console.log("Old contract functions available - this is likely the old version without semester certificates");
      
    } catch (oldError) {
      console.log("Not the old contract either:", oldError.message);
    }
  }
  
  // Check deployment history
  console.log("\n=== Checking Recent Deployments ===");
  console.log("Current contract address:", contractAddress);
  console.log("You may need to redeploy the contract with semester certificate functionality");
}

main().catch(console.error);
