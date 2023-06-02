import React, { useState } from "react";
import { ethers } from "ethers";
import { Container, Form, Button, Message, Input } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import ElectionAddress from '../../artifacts/contracts/eVote.sol/ElectionFactory-address.json';
import ElectionFactory from '../../artifacts/contracts/eVote.sol/ElectionFactory.json';

function App() {
    //State Variables
    const [moderatorAddresses, setModeratorAddresses] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    //New Election Form
    const onSubmit = async () => {
        setLoading(true);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(accounts[0]);
            const electionFactory = new ethers.Contract(ElectionAddress.address, ElectionFactory.abi, signer);
            const addresses = moderatorAddresses.split(',').map(address => address.trim());
            await electionFactory.addElection(addresses);
        } catch (err) {
            setErrorMessage(err.message);
        }
        setLoading(false);
    };
    
        return (
            <div style={{ height: '100%', width: '100%', position: 'absolute', backgroundColor: '#242424', color: 'white'}}>
                <Container>
                {/*New Election Form*/}
                <h1 style={{marginTop:'20px'}}>Create a new election</h1>
                <Button href='../'>Back</Button>
                <Form onSubmit={onSubmit} error={!!errorMessage}>
                    <p>Enter the moderator addresses for the new election separated by commas.</p>
                    <Form.Field>
                        <p>Moderator Addresses:</p>
                        <Input
                        value={moderatorAddresses}
                        onChange={event => setModeratorAddresses(event.target.value)}
                        />
                    </Form.Field>
                    <Message error header='Error' content={errorMessage} />
                    <Button loading={loading} primary>Deploy</Button>
                </Form>
                </Container>
            </div>
        );
}

export default App;