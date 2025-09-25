const { ethers } = require('hardhat');

// The error signature from the frontend
const errorData = "0xe2517d3f00000000000000000000000000000000000000000000000000000000000000009f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

// Common Solidity error signatures
const errorSignatures = {
  "0x08c379a0": "Error(string)", // Generic revert with message
  "0x4e487b71": "Panic(uint256)", // Panic errors (division by zero, etc.)
  "0xe2517d3f": "Unknown custom error"
};

async function main() {
  console.log("Error data:", errorData);
  console.log("Error signature:", errorData.slice(0, 10));
  
  const signature = errorData.slice(0, 10);
  if (errorSignatures[signature]) {
    console.log("Error type:", errorSignatures[signature]);
  }

  // Try to decode the error data
  try {
    if (signature === "0x08c379a0") {
      // Standard Error(string)
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + errorData.slice(10));
      console.log("Error message:", decoded[0]);
    } else if (signature === "0x4e487b71") {
      // Panic error
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], "0x" + errorData.slice(10));
      console.log("Panic code:", decoded[0].toString());
    } else {
      console.log("Custom error - checking contract for error definitions...");
    }
  } catch (e) {
    console.log("Could not decode error:", e.message);
  }

  // Let's also check if this is a specific contract error
  console.log("\nChecking contract for custom errors...");
  
  // Load the contract to see if we can identify the error
  const contractAddress = "0xBbaBAABb432e735278f8f36F625FE4a84bbcF773";
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  
  // Check if contract has any custom errors defined
  const contractInterface = CertificateNFT.interface;
  console.log("Contract errors:", Object.keys(contractInterface.errors));
}

main().catch(console.error);
