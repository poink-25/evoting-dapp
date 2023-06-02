const { expect } = require('chai');
const { ethers } = require('hardhat');

let electionAddress;

describe('ElectionFactory 2', () => {
  let electionFactory;

  beforeEach(async () => {
    [addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10] = await ethers.getSigners();
    const ElectionFactory = await ethers.getContractFactory('ElectionFactory2');
    electionFactory = await ElectionFactory.connect(addr1).deploy();
    await electionFactory.deployed();
  });

  it("Deploys correctly", async () => {
    let administrator = await electionFactory.administrator();
    
    expect(administrator).to.equal(addr1.address);
  });
  
  it("Adds a new election", async () => {
    await electionFactory.addElection([addr2.address, addr3.address, addr4.address])
    const elections = await electionFactory.getElectionsList();
    electionAddress = elections[0];
    expect(electionAddress).to.be.a('string').and.to.have.lengthOf(42);
    expect(elections).to.have.lengthOf(1);
  });

  it("REVERT when non-admin adds new election", async () => {
    await expect(
      electionFactory.connect(addr2).addElection([addr2.address, addr3.address, addr4.address])
    ).to.be.revertedWith("Only the administrator can add elections.");
  });

});

describe('Election 2', () => {
  let election;
  
  beforeEach(async () => {
    const Election = await ethers.getContractFactory('Election2');
    election = await Election.attach(electionAddress);
  });

  it("Exists", async () => {
    let moderator = await election.Moderators(1);
    expect(moderator).to.equal(addr3.address);
  });
  
  it("Adds new parties", async () => {
    let listOfParties = await election.getPartiesList();
    expect(listOfParties).to.have.lengthOf(1);
    
    await election.connect(addr2).addParty("European People's Party");
    await election.connect(addr2).addParty("Socialists and Democrats");
    await election.connect(addr2).addParty("Renew Europe");
    await election.connect(addr2).addParty("European Conservatives and Reformists");
    await election.connect(addr2).addParty("Identity and Democracy");
    
    listOfParties = await election.getPartiesList();
    expect(listOfParties).to.have.lengthOf(6);
  });

  it("REVERT when voting outside election start and end time", async () => {
    await expect(
      election.connect(addr1).vote(0, 0)
    ).to.be.revertedWith("Election is currently inactive.");
  });
  
  it('Changes election parameters', async () => {
    let electionDesription = await election.description();
    let electionStart = await election.startTime();
    let electionEnd = await election.endTime();
    expect(electionDesription).to.equal("");
    expect(electionStart).to.equal(0);
    expect(electionEnd).to.equal(0);
    
    await election.connect(addr2).changeParameters("European Parliament Elections", Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)+3600);
    
    electionDesription = await election.description();
    electionStart = await election.startTime();
    electionEnd = await election.endTime();
    expect(electionDesription).to.equal("European Parliament Elections");
    expect(electionStart).to.not.equal(0);
    expect(electionEnd).to.not.equal(0);
  });

  it("REVERT when non-moderator calls moderator only functions", async () => {
    await expect(
      election.connect(addr1).addParty("Illegal Party")
    ).to.be.revertedWith("This function is restricted to election moderators.");
    
    await expect(
      election.connect(addr1).changeParameters("Fake Election", Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)+3600)
    ).to.be.revertedWith("This function is restricted to election moderators.");
    
    await expect(
      election.connect(addr1).callFirstStage()
    ).to.be.revertedWith("This function is restricted to election moderators.");
    
    await expect(
      election.connect(addr1).callSecondStage(0)
    ).to.be.revertedWith("This function is restricted to election moderators.");
  });
  
  it("REVERT when vote invalid", async () => {
    await expect(
      election.connect(addr1).vote(11, 11)
    ).to.be.revertedWith("Invalid vote.");
  });
  
  it("Registers votes", async () => {
    let listOfVotes = await election.getVotesList();
    expect(listOfVotes).to.have.lengthOf(0);
    
    await election.connect(addr1).vote(1, 5);
    await election.connect(addr2).vote(5, 1);
    await election.connect(addr3).vote(4, 3);
    await election.connect(addr4).vote(3, 4);
    await election.connect(addr5).vote(2, 3);
    await election.connect(addr6).vote(2, 4);
    await election.connect(addr7).vote(1, 0);
    await election.connect(addr8).vote(1, 5);
    await election.connect(addr9).vote(3, 0);
    await election.connect(addr10).vote(2, 3);
    
    listOfVotes = await election.getVotesList();
    expect(listOfVotes).to.have.lengthOf(10);
  });
  
  it("REVERT when double voting", async () => {
    await expect(
      election.connect(addr1).vote(0, 0)
    ).to.be.revertedWith("You have already voted.");
  });
  
  it("REVERT when calling second stage before first stage", async () => {
    await expect(
      election.connect(addr2).callSecondStage(0)
    ).to.be.revertedWith("First stage must be called first.");
  });
  
  it('Calls first stage', async () => {
    let firstStage = await election.firstStageLock();
    expect(firstStage).to.equal(false);
    
    await election.connect(addr2).callFirstStage();
    
    firstStage = await election.firstStageLock();
    expect(firstStage).to.equal(true);
    
    listOfParties = await election.getPartiesList();
    //console.log(listOfParties);
  });
  
  it("REVERT when calling functions locked after first stage", async () => {
    await expect(
      election.connect(addr2).addParty("Illegal Party")
    ).to.be.revertedWith("Election is over.");
    
    await expect(
      election.connect(addr2).changeParameters("Fake Election", Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)+3600)
    ).to.be.revertedWith("Election is over.");
    
    await expect(
      election.connect(addr2).vote(0, 0)
    ).to.be.revertedWith("Election is over.");
  });
  
  it('Calls second stage', async () => {
    let secondStage = await election.secondStageLock();
    expect(secondStage).to.equal(false);
    
    await election.connect(addr2).callSecondStage(2);
    
    secondStage = await election.secondStageLock();
    expect(secondStage).to.equal(true);
    
    listOfParties = await election.getPartiesList();
    //console.log(listOfParties);
  });
  
  it("REVERT when calling second stage twice", async () => {
    await expect(
      election.connect(addr2).callSecondStage(0)
    ).to.be.revertedWith("Second stage has already been called.");
  });
  
});
