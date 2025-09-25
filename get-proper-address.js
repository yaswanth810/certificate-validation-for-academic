const { ethers } = require('ethers');

// Fix the contract address checksum
const rawAddress = "0x34f44FEC7CeAA80CF77aE4e4F95c9Bb047670832";
const properAddress = ethers.getAddress(rawAddress);

console.log("Raw address:", rawAddress);
console.log("Proper checksum address:", properAddress);
