import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Link from 'next/link';
import { Container, Divider, Button, Card } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import ElectionAddress from '../artifacts/contracts/eVote.sol/ElectionFactory-address.json';
import ElectionFactory from '../artifacts/contracts/eVote.sol/ElectionFactory.json';

function App() {
    //State Variables
    const [accounts, setAccounts] = useState(null);
    const [electionAddress, setElectionAddress] = useState(null);
    const [elections, setElections] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    
    useEffect(() => {
        const init = async () => {
        //Initialize
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const electionAddress = ElectionAddress.address;
        const electionFactory = new ethers.Contract(ElectionAddress.address, ElectionFactory.abi, signer);
        const elections = await electionFactory.getElectionsList();
        //Check if user is admin
        const admin = await electionFactory.administrator();
        const isAdmin = accounts[0] === admin.toLowerCase();
        //Set state
            setAccounts(accounts);
            setElectionAddress(electionAddress);
            setElections(elections);
            setIsAdmin(isAdmin);
        }
        init();
    }, []);
    
    //Render Elections
    const renderElections = () => {
        if (!elections) {
            return null;
        }
        const items = elections.map(address => {
            return {
              key: address,
              header: <p>{address}</p>,
              description: <Link 
                href={{ pathname: "/elections/elections", query: { address }, }} 
                as={`/elections/${address}`} >View Election</Link>,
              fluid: true,
              style: { backgroundColor: '#323232' }
            }
        });
          
        return <Card.Group items={items} />;
    };
    
        return (
            <div style={{ height: '100%', width: '100%', position: 'absolute', backgroundColor: '#242424', color: 'white'}}>
                {/*Home Page*/}
                <Container>
                <h1 style={{marginTop:'20px'}}>Electronic Voting dApp</h1>
                <p>Factory address: {electionAddress}</p>
                {accounts && <p>Account address: {accounts[0]}</p>}
                { isAdmin &&
                    <div>
                    <p>You are the contract administrator.</p>
                    <Button primary href='./elections/new'>Create New Election</Button>
                    </div>
                }
                <Divider inverted />
                <p>List of active and closed elections:</p>
                {renderElections()}
                <Divider inverted />
                <p>Check out my Github: <Link href="https://github.com/poink-25">poink-25</Link></p>
                </Container>
            </div>
        )
}
  export default App;