const { ethers } = require("hardhat");

async function main() {

  [addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", addr1.address);
  console.log("Account balance:", (await addr1.getBalance()).toString());

  // deploy contracts here:
  const ElectionFactory = await ethers.getContractFactory('ElectionFactory2');
  electionFactory = await ElectionFactory.connect(addr1).deploy();
  await electionFactory.deployed();
  
  console.log("Wallet contract address", electionFactory.address);
  
  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(electionFactory, "ElectionFactory");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../artifacts/contracts/eVote.sol"; // Directory to save json files

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
