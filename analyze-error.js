const { ethers } = require('ethers');

// The error signature 0xe2517d3f
const errorSig = "0xe2517d3f";

// Let's check what function this selector corresponds to
console.log("Error signature:", errorSig);

// Common function selectors that might cause issues
const functionSelectors = {
  "0xe2517d3f": "Unknown function",
  "0x4055e0e1": "mintSemesterCertificate(address,string,string,(string,string,string,string,string,string,string,string,string,(string,string,string,uint256,string,uint256)[],uint256,uint256,string,uint256,address,bool))"
};

// Check if this is a function selector
console.log("Checking function selectors...");
for (const [selector, func] of Object.entries(functionSelectors)) {
  if (selector === errorSig) {
    console.log(`Found matching function: ${func}`);
  }
}

// Calculate function selector for mintSemesterCertificate
const funcSig = "mintSemesterCertificate(address,string,string,(string,string,string,string,string,string,string,string,string,(string,string,string,uint256,string,uint256)[],uint256,uint256,string,uint256,address,bool))";
const calculated = ethers.id(funcSig).slice(0, 10);
console.log("Calculated selector for mintSemesterCertificate:", calculated);

// Let's also check the actual transaction data
const txData = "0x4055e0e1000000000000000000000000cc7b99a2a9f201611d5a0d96b81dd3f456a93c22000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100";
console.log("Transaction function selector:", txData.slice(0, 10));

// Check if the error might be related to access control
const accessControlSelectors = {
  "0x5b4c4b2e": "AccessControlUnauthorizedAccount(address,bytes32)",
  "0xe2517d3f": "Unknown - might be access control related"
};

console.log("\nPossible access control issue:");
console.log("Error 0xe2517d3f might indicate missing MINTER_ROLE");
